import { readFileSync, writeFileSync } from 'fs'

const filePath = 'C:/Users/Patrick/desktop/translationtool/src/lib/grammar-data.ts'
const json = JSON.parse(readFileSync('C:/Users/Patrick/desktop/claude/grammar_additions.json', 'utf8'))

// Validate cloze is substring of jp
const issues = []
json.forEach((g, i) => {
  const required = ['id', 'pattern', 'english', 'level', 'explanation', 'hint', 'examples']
  required.forEach(f => { if (!g[f]) issues.push(`${g.id || i} missing ${f}`) })
  if (g.examples) {
    g.examples.forEach((ex, j) => {
      if (!ex.jp.includes(ex.cloze)) {
        issues.push(`${g.id} example[${j}]: cloze "${ex.cloze}" not found in "${ex.jp}"`)
      }
    })
  }
})
if (issues.length) {
  console.error('Validation issues:')
  issues.forEach(i => console.error(' ', i))
  process.exit(1)
}

const escape = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const tsEntries = json.map(g => {
  const examples = g.examples.map(ex =>
    `    { jp: '${escape(ex.jp)}', cloze: '${escape(ex.cloze)}', en: '${escape(ex.en)}' },`
  ).join('\n')
  return `  {\n    id: '${g.id}', pattern: '${escape(g.pattern)}', english: '${escape(g.english)}',\n    level: '${g.level}',\n    explanation: '${escape(g.explanation)}',\n    hint: '${escape(g.hint)}',\n    examples: [\n${examples}\n    ],\n  },`
}).join('\n')

let content = readFileSync(filePath, 'utf8')

// Insert before the closing ] of GRAMMAR_DATA
const closingIdx = content.lastIndexOf('\n]\n')
if (closingIdx === -1) { console.error('Could not find closing ]'); process.exit(1) }

const newContent = content.slice(0, closingIdx) + '\n' + tsEntries + '\n]\n' + content.slice(closingIdx + 3)

// Also update the footer exports to include all levels
const updated = newContent
  .replace(
    "export const GRAMMAR_LEVELS = ['N5', 'N4', 'N3'] as const",
    "export const GRAMMAR_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const"
  )

writeFileSync(filePath, updated, 'utf8')
console.log('Appended', json.length, 'grammar points')

// Count by level
const counts = {}
json.forEach(g => counts[g.level] = (counts[g.level] || 0) + 1)
Object.entries(counts).forEach(([l, n]) => console.log(' ', l + ':', n))
