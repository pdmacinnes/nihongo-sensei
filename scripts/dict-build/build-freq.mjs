// One-time conversion: University of Leeds Japanese frequency corpus -> compact tier map.
// Source: https://github.com/hingston/japanese (CC BY 2.5, University of Leeds Corpus + hingston cleanup)
import fs from 'node:fs'
import zlib from 'node:zlib'

const lines = fs.readFileSync('./freq-raw.txt', 'utf8').split('\n').map(l => l.trim())

const JAPANESE_RE = /[぀-ヿ一-鿿]/
const PUNCT_RE = /^[「」・、。！？…～ー\s]*$/

function tierFor(rank) {
  if (rank <= 800) return 'very common'
  if (rank <= 3000) return 'common'
  if (rank <= 15000) return 'uncommon'
  return 'rare'
}

const freq = {}
let rank = 0
for (const word of lines) {
  if (!word || word === 'EOS' || PUNCT_RE.test(word) || !JAPANESE_RE.test(word)) continue
  rank++
  if (!(word in freq)) freq[word] = tierFor(rank)
}

const json = JSON.stringify(freq)
fs.writeFileSync('../../public/dict/frequency.json.gz', zlib.gzipSync(json, { level: 9 }))

console.log(`ranked words: ${rank}`)
console.log(`raw json: ${(json.length / 1024).toFixed(0)} KB`)
console.log(`gzipped: ${(fs.statSync('../../public/dict/frequency.json.gz').size / 1024).toFixed(0)} KB`)
