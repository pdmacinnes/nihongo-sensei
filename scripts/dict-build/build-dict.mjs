// One-time conversion: jmdict-simplified's full JSON -> compact format for bundling.
// Run manually when refreshing the dictionary; output is committed as a static asset,
// this script itself and its raw input are not part of the app build.
import fs from 'node:fs'
import zlib from 'node:zlib'

const raw = JSON.parse(fs.readFileSync('./jmdict-eng-3.6.2.json', 'utf8'))

const MAX_SENSES = 4
const MAX_GLOSSES_PER_SENSE = 3
const MAX_POS_PER_SENSE = 2

const entries = []
for (const w of raw.words) {
  const kanji = w.kanji.map(k => k.text)
  const kana = w.kana.map(k => k.text)
  if (kanji.length === 0 && kana.length === 0) continue

  const senses = []
  for (const s of w.sense) {
    const glosses = s.gloss.filter(g => g.lang === 'eng').map(g => g.text).slice(0, MAX_GLOSSES_PER_SENSE)
    if (glosses.length === 0) continue
    senses.push({ p: s.partOfSpeech.slice(0, MAX_POS_PER_SENSE), g: glosses })
    if (senses.length >= MAX_SENSES) break
  }
  if (senses.length === 0) continue

  entries.push({ k: kanji, r: kana, s: senses })
}

const output = { tags: raw.tags, entries }
const json = JSON.stringify(output)
fs.writeFileSync('../../public/dict/jmdict.json.gz', zlib.gzipSync(json, { level: 9 }))

console.log(`entries: ${entries.length}`)
console.log(`raw json: ${(json.length / 1024 / 1024).toFixed(2)} MB`)
console.log(`gzipped: ${(fs.statSync('../../public/dict/jmdict.json.gz').size / 1024 / 1024).toFixed(2)} MB`)
