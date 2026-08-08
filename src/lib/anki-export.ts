// Builds a real .apkg file (SQLite collection + zip) client-side, importable straight into Anki.
// Schema mirrors genanki (https://github.com/kerrickstaley/genanki) — the same legacy
// "collection.anki2" schema (ver 11) genanki produces, which Anki has kept import-compatible
// for years. We hand-roll it instead of pulling in genanki's JS port because that port is
// unmaintained (last published 2022, pinned to sql.js ^0.5.0) and this only needs one fixed
// note type, not a general-purpose model builder.
import initSqlJs from 'sql.js'
import type { Database } from 'sql.js'
import JSZip from 'jszip'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

export interface AnkiExportWord {
  japanese: string
  reading: string
  english: string
  sentenceJp: string
  sentenceEn: string
}

// Fixed IDs so repeated exports land in the same Anki deck/note type instead of duplicating it
// (Anki matches by id, not name, when a package is re-imported).
const MODEL_ID = 1754000000001
const DECK_ID = 1754000000002
const DECK_NAME = 'Nihongo Sensei'
const MODEL_NAME = 'Nihongo Sensei Vocab'
const FIELD_NAMES = ['Japanese', 'Reading', 'English', 'SentenceJP', 'SentenceEN']

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildModelJson(timestampSec: number) {
  return {
    id: String(MODEL_ID),
    name: MODEL_NAME,
    type: 0, // standard front/back, not cloze
    mod: timestampSec,
    usn: -1,
    sortf: 0, // sort field index = Japanese
    did: DECK_ID,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: '{{Japanese}}<br><span class="reading">{{Reading}}</span>',
        afmt: '{{FrontSide}}<hr id="answer">{{English}}<br><br><div class="sentence">{{SentenceJP}}<br>{{SentenceEN}}</div>',
        bqfmt: '',
        bafmt: '',
        bfont: '',
        bsize: 0,
        did: null,
      },
    ],
    flds: FIELD_NAMES.map((name, ord) => ({
      name,
      ord,
      sticky: false,
      rtl: false,
      font: 'Liberation Sans',
      size: 20,
      media: [],
    })),
    css: '.card { font-family: "Hiragino Sans", "Yu Gothic", sans-serif; font-size: 24px; text-align: center; color: #1a1a1a; background: #fafaf8; } .reading { font-size: 16px; color: #888; } .sentence { font-size: 16px; color: #555; margin-top: 8px; }',
    latexPre: '',
    latexPost: '',
    latexsvg: false,
    // Card 1 requires the Japanese field (index 0) to be non-empty — this is the only
    // template, so we hardcode the requirement instead of running genanki's mustache solver.
    req: [[0, 'all', [0]]],
    tags: [],
    vers: [],
  }
}

function buildDeckJson(timestampSec: number) {
  return {
    id: DECK_ID,
    mod: timestampSec,
    name: DECK_NAME,
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

function insertBaseCol(db: Database, timestampSec: number) {
  const conf = {
    curDeck: DECK_ID,
    activeDecks: [DECK_ID],
    newSpread: 0,
    collapseTime: 1200,
    timeLim: 0,
    estTimes: true,
    dueCounts: true,
    curModel: String(MODEL_ID),
    nextPos: 1,
    sortType: 'noteFld',
    sortBackwards: false,
    addToCur: true,
  }
  const decks = { [String(DECK_ID)]: buildDeckJson(timestampSec) }
  const models = { [String(MODEL_ID)]: buildModelJson(timestampSec) }
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

export async function buildAnkiApkg(words: AnkiExportWord[]): Promise<Blob> {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
  const db = new SQL.Database()
  db.run(APKG_SCHEMA)

  const timestampMs = Date.now()
  const timestampSec = Math.floor(timestampMs / 1000)
  insertBaseCol(db, timestampSec)

  let nextId = timestampMs
  const id = () => nextId++

  let cardPosition = 0
  for (const word of words) {
    const fields = [
      escapeHtml(word.japanese),
      escapeHtml(word.reading),
      escapeHtml(word.english),
      escapeHtml(word.sentenceJp),
      escapeHtml(word.sentenceEn),
    ]
    const guid = await guidFor(...fields)
    const noteId = id()

    db.run(
      `INSERT INTO notes VALUES (?, ?, ?, ?, -1, '  ', ?, ?, 0, 0, '')`,
      [noteId, guid, MODEL_ID, timestampSec, fields.join('\x1f'), fields[0]]
    )
    db.run(
      `INSERT INTO cards VALUES (?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')`,
      [id(), noteId, DECK_ID, timestampSec, cardPosition++]
    )
  }

  const bytes = db.export()
  db.close()

  const zip = new JSZip()
  zip.file('collection.anki2', bytes)
  zip.file('media', '{}')
  return zip.generateAsync({ type: 'blob' })
}
