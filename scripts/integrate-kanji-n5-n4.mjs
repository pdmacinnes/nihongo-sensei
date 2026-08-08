import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const filePath = fileURLToPath(new URL('../src/lib/kanji-data.ts', import.meta.url))
const json = JSON.parse(readFileSync(fileURLToPath(new URL('./data/kanji_n5_n4.json', import.meta.url)), 'utf8'))

// Get existing kanji chars to avoid duplicates
const existing = readFileSync(filePath, 'utf8')
const existingKanji = new Set([...existing.matchAll(/kanji: '(.)'/g)].map(m => m[1]))

const deduped = json.filter(e => {
  if (existingKanji.has(e.kanji)) {
    console.log('  Skipping duplicate:', e.kanji)
    return false
  }
  return true
})

// Validate
const issues = []
deduped.forEach((e, i) => {
  if (!e.kanji) issues.push(`[${i}] missing kanji`)
  if (!e.level) issues.push(`[${i}] missing level`)
  if (!e.strokeCount) issues.push(`[${i}] (${e.kanji}) missing strokeCount`)
  if (!e.examples || e.examples.length < 2) issues.push(`[${i}] (${e.kanji}) needs 2 examples`)
})
if (issues.length) { console.error(issues.join('\n')); process.exit(1) }

const escape = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")

// Group by level for clean insertion
const byLevel = { N5: [], N4: [] }
deduped.forEach(e => (byLevel[e.level] || (byLevel[e.level] = [])).push(e))

const toTs = entries => entries.map(e => {
  const meanings = e.meanings.map(m => `'${escape(m)}'`).join(', ')
  const onyomi = e.onyomi.map(r => `'${escape(r)}'`).join(', ')
  const kunyomi = e.kunyomi.map(r => `'${escape(r)}'`).join(', ')
  const examples = e.examples.slice(0, 2).map(ex =>
    `{ word: '${escape(ex.word)}', reading: '${escape(ex.reading)}', meaning: '${escape(ex.meaning)}' }`
  ).join(', ')
  return `  { kanji: '${escape(e.kanji)}', meanings: [${meanings}], onyomi: [${onyomi}], kunyomi: [${kunyomi}], level: '${e.level}', strokeCount: ${e.strokeCount},\n    examples: [${examples}] },`
}).join('\n')

let content = readFileSync(filePath, 'utf8')
const closingIdx = content.lastIndexOf('\n]')
if (closingIdx === -1) { console.error('Could not find closing ]'); process.exit(1) }

let insertion = ''
if (byLevel.N5.length) insertion += '\n  // ── N5 Additional ──\n' + toTs(byLevel.N5) + '\n'
if (byLevel.N4.length) insertion += '\n  // ── N4 Kanji ──\n' + toTs(byLevel.N4) + '\n'

const newContent = content.slice(0, closingIdx) + insertion + ']' + content.slice(closingIdx + 2)
writeFileSync(filePath, newContent, 'utf8')

console.log('Done. Added:', deduped.length, '(skipped', json.length - deduped.length, 'duplicates)')
Object.entries(byLevel).forEach(([l, arr]) => console.log(' ', l + ':', arr.length))
