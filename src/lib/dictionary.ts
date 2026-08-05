// Local, offline Japanese dictionary + frequency lookup.
//
// Data sources (see scripts/dict-build/ for the conversion scripts):
// - JMdict (English), via jmdict-simplified — EDRDG License, https://github.com/scriptin/jmdict-simplified
// - Frequency ranks, University of Leeds Corpus (CC BY 2.5), via https://github.com/hingston/japanese

interface JMdictSense {
  p: string[] // partOfSpeech codes, e.g. "n", "v5u" — decoded via tags map
  g: string[] // English glosses
}

interface JMdictEntry {
  k: string[] // kanji forms
  r: string[] // kana/reading forms
  s: JMdictSense[]
}

interface JMdictData {
  tags: Record<string, string>
  entries: JMdictEntry[]
}

export interface DictLookupResult {
  gloss: string
  pos: string
  senseCount: number
  contextDependent: boolean
}

async function fetchGzipJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(res.statusText)
  const decompressed = res.body.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(decompressed).text()
  return JSON.parse(text) as T
}

let dictPromise: Promise<{ data: JMdictData; index: Map<string, number[]> }> | null = null

function loadDictionary() {
  if (!dictPromise) {
    dictPromise = fetchGzipJson<JMdictData>('./dict/jmdict.json.gz').then(data => {
      const index = new Map<string, number[]>()
      data.entries.forEach((entry, i) => {
        for (const form of [...entry.k, ...entry.r]) {
          const list = index.get(form)
          if (list) list.push(i)
          else index.set(form, [i])
        }
      })
      return { data, index }
    })
  }
  return dictPromise
}

let freqPromise: Promise<Record<string, string>> | null = null

function loadFrequency() {
  if (!freqPromise) {
    freqPromise = fetchGzipJson<Record<string, string>>('./dict/frequency.json.gz')
  }
  return freqPromise
}

// Warm both datasets early (call once, e.g. when the Reader page mounts).
export function preloadDictionary(): Promise<void> {
  return Promise.all([loadDictionary(), loadFrequency()]).then(() => undefined)
}

export async function lookupWord(basicForm: string, reading: string): Promise<DictLookupResult | null> {
  const { data, index } = await loadDictionary()
  const candidateIds = index.get(basicForm)
  if (!candidateIds || candidateIds.length === 0) return null

  // Prefer an entry whose reading list matches the token's actual reading, since a
  // kanji headword can be shared by unrelated words with different readings (homographs).
  const candidates = candidateIds.map(i => data.entries[i])
  const entry = candidates.find(e => e.r.includes(reading)) ?? candidates[0]

  const glossParts: string[] = []
  for (const sense of entry.s) {
    glossParts.push(sense.g.slice(0, 2).join('; '))
  }
  const gloss = glossParts.slice(0, 2).join(' / ')
  const posCode = entry.s[0]?.p[0]
  const pos = posCode ? (data.tags[posCode] ?? posCode) : ''

  return {
    gloss,
    pos,
    senseCount: entry.s.length,
    // Heuristic: several meaningfully distinct senses is a reasonable free, offline
    // signal that context matters — no AI call needed just to raise the flag.
    contextDependent: entry.s.length >= 3,
  }
}

export async function lookupFrequency(word: string): Promise<string | null> {
  const freq = await loadFrequency()
  return freq[word] ?? null
}
