import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const filePath = fileURLToPath(new URL('../src/lib/kanji-data.ts', import.meta.url))

function appendKanjiFromFile(jsonFile, label) {
  const json = JSON.parse(readFileSync(jsonFile, 'utf8'))
  const escape = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")

  // Validate
  const issues = []
  json.forEach((e, i) => {
    if (!e.kanji) issues.push(`[${i}] missing kanji`)
    if (!e.level) issues.push(`[${i}] missing level`)
    if (!e.strokeCount) issues.push(`[${i}] missing strokeCount`)
    if (!e.examples || e.examples.length < 2) issues.push(`[${i}] (${e.kanji}) needs 2 examples`)
  })
  if (issues.length) { console.error(label + ' issues:\n' + issues.slice(0, 10).join('\n')); return 0 }

  const tsEntries = json.map(e => {
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
  if (closingIdx === -1) { console.error('Could not find closing ]'); return 0 }

  const newContent = content.slice(0, closingIdx) + '\n\n  // ── ' + label + ' ──\n' + tsEntries + '\n]' + content.slice(closingIdx + 2)
  writeFileSync(filePath, newContent, 'utf8')
  console.log(label + ': appended ' + json.length + ' entries')
  return json.length
}

appendKanjiFromFile(fileURLToPath(new URL('./data/kanji_n3_n2_n1.json', import.meta.url)), 'N3/N2/N1 Kanji')
