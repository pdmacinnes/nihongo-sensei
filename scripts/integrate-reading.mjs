import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const filePath = fileURLToPath(new URL('../src/lib/reading-data.ts', import.meta.url))
const json = JSON.parse(readFileSync(fileURLToPath(new URL('./data/reading_additions.json', import.meta.url)), 'utf8'))

// Validate
const issues = []
json.forEach((p, i) => {
  const required = ['id', 'title', 'titleEn', 'level', 'topic', 'paragraphs', 'vocabulary']
  required.forEach(f => { if (!p[f]) issues.push(`[${i}] ${p.id || '?'} missing ${f}`) })
  if (p.paragraphs && p.paragraphs.length < 3) issues.push(`${p.id} too few paragraphs: ${p.paragraphs.length}`)
})
if (issues.length) { console.error(issues.join('\n')); process.exit(1) }

const escape = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const tsEntries = json.map(p => {
  const paragraphs = p.paragraphs.map(para =>
    `      { japanese: '${escape(para.japanese)}', english: '${escape(para.english)}' },`
  ).join('\n')
  const vocab = p.vocabulary.map(v =>
    `      { word: '${escape(v.word)}', reading: '${escape(v.reading)}', english: '${escape(v.english)}' },`
  ).join('\n')
  return `  {\n    id: '${p.id}',\n    title: '${escape(p.title)}',\n    titleEn: '${escape(p.titleEn)}',\n    level: '${p.level}',\n    topic: '${escape(p.topic)}',\n    paragraphs: [\n${paragraphs}\n    ],\n    vocabulary: [\n${vocab}\n    ],\n  },`
}).join('\n')

let content = readFileSync(filePath, 'utf8')
const closingIdx = content.lastIndexOf('\n]')
if (closingIdx === -1) { console.error('Could not find closing ]'); process.exit(1) }

const newContent = content.slice(0, closingIdx) + '\n' + tsEntries + '\n]' + content.slice(closingIdx + 2)
writeFileSync(filePath, newContent, 'utf8')

const counts = {}
json.forEach(p => counts[p.level] = (counts[p.level] || 0) + 1)
console.log('Appended', json.length, 'passages:')
Object.entries(counts).forEach(([l, n]) => console.log(' ', l + ':', n))
