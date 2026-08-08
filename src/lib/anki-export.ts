// Builds real .apkg files (SQLite collection + zip) client-side, importable straight into Anki.
// Schema mirrors genanki (https://github.com/kerrickstaley/genanki) — the same legacy
// "collection.anki2" schema (ver 11) genanki produces, which Anki has kept import-compatible
// for years. We hand-roll it instead of pulling in genanki's JS port because that port is
// unmaintained (last published 2022, pinned to sql.js ^0.5.0).
import initSqlJs from 'sql.js'
import type { Database } from 'sql.js'
import JSZip from 'jszip'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

const APKG_SCHEMA = `
CREATE TABLE col (
    id              integer primary key,
    crt             integer not null,
    mod             integer not null,
    scm             integer not null,
    ver             integer not null,
    dty             integer not null,
    usn             integer not null,
    ls              integer not null,
    conf            text not null,
    models          text not null,
    decks           text not null,
    dconf           text not null,
    tags            text not null
);
CREATE TABLE notes (
    id              integer primary key,
    guid            text not null,
    mid             integer not null,
    mod             integer not null,
    usn             integer not null,
    tags            text not null,
    flds            text not null,
    sfld            text not null,
    csum            integer not null,
    flags           integer not null,
    data            text not null
);
CREATE TABLE cards (
    id              integer primary key,
    nid             integer not null,
    did             integer not null,
    ord             integer not null,
    mod             integer not null,
    usn             integer not null,
    type            integer not null,
    queue           integer not null,
    due             integer not null,
    ivl             integer not null,
    factor          integer not null,
    reps            integer not null,
    lapses          integer not null,
    left            integer not null,
    odue            integer not null,
    odid            integer not null,
    flags           integer not null,
    data            text not null
);
CREATE TABLE revlog (
    id              integer primary key,
    cid             integer not null,
    usn             integer not null,
    ease            integer not null,
    ivl             integer not null,
    lastIvl         integer not null,
    factor          integer not null,
    time            integer not null,
    type            integer not null
);
CREATE TABLE graves (
    usn             integer not null,
    oid             integer not null,
    type            integer not null
);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
`

// Base91-ish table Anki uses to render note guids (from genanki's util.py) — arbitrary alphabet,
// just needs to be stable and URL/JSON-safe.
const GUID_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~'.split('')

async function guidFor(...values: string[]): Promise<string> {
  const hashStr = values.join('__')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashStr))
  const bytes = new Uint8Array(digest).slice(0, 8)
  let hashInt = 0n
  for (const b of bytes) hashInt = (hashInt << 8n) + BigInt(b)

  const base = BigInt(GUID_ALPHABET.length)
  const chars: string[] = []
  while (hashInt > 0n) {
    chars.push(GUID_ALPHABET[Number(hashInt % base)])
    hashInt /= base
  }
  return chars.reverse().join('')
}

// Callers use this to escape any raw text before slotting it into a field or a hand-built
// HTML fragment (e.g. one field value containing several <br>-joined pieces) — escaping the
// whole assembled field afterward would mangle the deliberate markup.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export interface AnkiDeckSpec {
  modelId: number
  deckId: number
  deckName: string
  modelName: string
  fieldNames: string[]
  sortFieldIndex?: number
  qfmt: string
  afmt: string
  css: string
  // Each row's values align 1:1 with fieldNames, already final HTML (pre-escaped by the caller).
  rows: string[][]
}

function buildModelJson(spec: AnkiDeckSpec, timestampSec: number) {
  return {
    id: String(spec.modelId),
    name: spec.modelName,
    type: 0, // standard front/back, not cloze
    mod: timestampSec,
    usn: -1,
    sortf: spec.sortFieldIndex ?? 0,
    did: spec.deckId,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: spec.qfmt,
        afmt: spec.afmt,
        bqfmt: '',
        bafmt: '',
        bfont: '',
        bsize: 0,
        did: null,
      },
    ],
    flds: spec.fieldNames.map((name, ord) => ({
      name,
      ord,
      sticky: false,
      rtl: false,
      font: 'Liberation Sans',
      size: 20,
      media: [],
    })),
    css: spec.css,
    latexPre: '',
    latexPost: '',
    latexsvg: false,
    // Card 1 requires field 0 to be non-empty — this is the only template per model, so we
    // hardcode the requirement instead of running genanki's mustache solver.
    req: [[0, 'all', [0]]],
    tags: [],
    vers: [],
  }
}

function buildDeckJson(spec: AnkiDeckSpec, timestampSec: number) {
  return {
    id: spec.deckId,
    mod: timestampSec,
    name: spec.deckName,
    usn: -1,
    lrnToday: [0, 0],
    revToday: [0, 0],
    newToday: [0, 0],
    timeToday: [0, 0],
    collapsed: false,
    desc: '',
    dyn: 0,
    extendNew: 10,
    extendRev: 50,
    conf: 1,
  }
}

function insertBaseCol(db: Database, spec: AnkiDeckSpec, timestampSec: number) {
  const conf = {
    curDeck: spec.deckId,
    activeDecks: [spec.deckId],
    newSpread: 0,
    collapseTime: 1200,
    timeLim: 0,
    estTimes: true,
    dueCounts: true,
    curModel: String(spec.modelId),
    nextPos: 1,
    sortType: 'noteFld',
    sortBackwards: false,
    addToCur: true,
  }
  const decks = { [String(spec.deckId)]: buildDeckJson(spec, timestampSec) }
  const models = { [String(spec.modelId)]: buildModelJson(spec, timestampSec) }
  const dconf = {
    '1': {
      id: 1,
      mod: 0,
      name: 'Default',
      usn: 0,
      maxTaken: 60,
      autoplay: true,
      timer: 0,
      replayq: true,
      new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true },
      rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 100 },
      lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 },
    },
  }

  db.run(
    `INSERT INTO col VALUES (null, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, '{}')`,
    [
      timestampSec,
      timestampSec * 1000,
      timestampSec * 1000,
      JSON.stringify(conf),
      JSON.stringify(models),
      JSON.stringify(decks),
      JSON.stringify(dconf),
    ]
  )
}

// Generic core — one deck/model/set of notes per call, shared by the Vocab/Kanji/Grammar
// export builders below.
export async function buildAnkiApkg(spec: AnkiDeckSpec): Promise<Blob> {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
  const db = new SQL.Database()
  db.run(APKG_SCHEMA)

  const timestampMs = Date.now()
  const timestampSec = Math.floor(timestampMs / 1000)
  insertBaseCol(db, spec, timestampSec)

  let nextId = timestampMs
  const id = () => nextId++

  let cardPosition = 0
  for (const fields of spec.rows) {
    const guid = await guidFor(...fields)
    const noteId = id()

    db.run(
      `INSERT INTO notes VALUES (?, ?, ?, ?, -1, '  ', ?, ?, 0, 0, '')`,
      [noteId, guid, spec.modelId, timestampSec, fields.join('\x1f'), fields[spec.sortFieldIndex ?? 0]]
    )
    db.run(
      `INSERT INTO cards VALUES (?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')`,
      [id(), noteId, spec.deckId, timestampSec, cardPosition++]
    )
  }

  const bytes = db.export()
  db.close()

  const zip = new JSZip()
  zip.file('collection.anki2', bytes)
  zip.file('media', '{}')
  return zip.generateAsync({ type: 'blob' })
}

// ── Vocab ──────────────────────────────────────────────────────────────────
export interface AnkiExportWord {
  japanese: string
  reading: string
  english: string
  sentenceJp: string
  sentenceEn: string
}

export function buildVocabApkg(words: AnkiExportWord[]): Promise<Blob> {
  return buildAnkiApkg({
    modelId: 1754000000001,
    deckId: 1754000000002,
    deckName: 'Nihongo Sensei',
    modelName: 'Nihongo Sensei Vocab',
    fieldNames: ['Japanese', 'Reading', 'English', 'SentenceJP', 'SentenceEN'],
    qfmt: '{{Japanese}}<br><span class="reading">{{Reading}}</span>{{tts ja_JP:Japanese}}',
    afmt: '{{FrontSide}}<hr id="answer">{{English}}<br><br><div class="sentence">{{SentenceJP}}<br>{{SentenceEN}}</div>{{tts ja_JP:SentenceJP}}',
    css: '.card { font-family: "Hiragino Sans", "Yu Gothic", sans-serif; font-size: 24px; text-align: center; color: #1a1a1a; background: #fafaf8; } .reading { font-size: 16px; color: #888; } .sentence { font-size: 16px; color: #555; margin-top: 8px; }',
    rows: words.map(w => [
      escapeHtml(w.japanese),
      escapeHtml(w.reading),
      escapeHtml(w.english),
      escapeHtml(w.sentenceJp),
      escapeHtml(w.sentenceEn),
    ]),
  })
}

// ── Kanji ──────────────────────────────────────────────────────────────────
export interface AnkiExportKanji {
  kanji: string
  meanings: string[]
  onyomi: string[]
  kunyomi: string[]
  examples: { word: string; reading: string; meaning: string }[]
}

export function buildKanjiApkg(entries: AnkiExportKanji[]): Promise<Blob> {
  return buildAnkiApkg({
    modelId: 1754000000003,
    deckId: 1754000000004,
    deckName: 'Nihongo Sensei Kanji',
    modelName: 'Nihongo Sensei Kanji',
    fieldNames: ['Kanji', 'Meanings', 'Onyomi', 'Kunyomi', 'Examples'],
    qfmt: '<div style="font-size:64px">{{Kanji}}</div>',
    afmt: '{{FrontSide}}<hr id="answer"><b>Meanings:</b> {{Meanings}}<br><b>On:</b> {{Onyomi}}<br><b>Kun:</b> {{Kunyomi}}<br><br>{{Examples}}',
    css: '.card { font-family: "Hiragino Sans", "Yu Gothic", sans-serif; font-size: 20px; text-align: center; color: #1a1a1a; background: #fafaf8; }',
    rows: entries.map(k => [
      escapeHtml(k.kanji),
      escapeHtml(k.meanings.join(', ')),
      escapeHtml(k.onyomi.join('、')),
      escapeHtml(k.kunyomi.join('、')),
      k.examples.map(ex => `${escapeHtml(ex.word)} (${escapeHtml(ex.reading)}) — ${escapeHtml(ex.meaning)}`).join('<br>'),
    ]),
  })
}

// ── Grammar ────────────────────────────────────────────────────────────────
export interface AnkiExportGrammar {
  pattern: string
  english: string
  explanation: string
  hint: string
  examples: { jp: string; en: string }[]
}

export function buildGrammarApkg(entries: AnkiExportGrammar[]): Promise<Blob> {
  return buildAnkiApkg({
    modelId: 1754000000005,
    deckId: 1754000000006,
    deckName: 'Nihongo Sensei Grammar',
    modelName: 'Nihongo Sensei Grammar',
    fieldNames: ['Pattern', 'English', 'Explanation', 'Hint', 'Examples'],
    qfmt: '<div style="font-size:28px">{{Pattern}}</div><div style="font-size:16px;color:#888">{{English}}</div>',
    afmt: '{{FrontSide}}<hr id="answer">{{Explanation}}<br><br><i>{{Hint}}</i><br><br>{{Examples}}',
    css: '.card { font-family: "Hiragino Sans", "Yu Gothic", sans-serif; font-size: 20px; text-align: center; color: #1a1a1a; background: #fafaf8; }',
    rows: entries.map(g => [
      escapeHtml(g.pattern),
      escapeHtml(g.english),
      escapeHtml(g.explanation),
      escapeHtml(g.hint),
      g.examples.map(ex => `${escapeHtml(ex.jp)}<br>${escapeHtml(ex.en)}`).join('<br><br>'),
    ]),
  })
}
