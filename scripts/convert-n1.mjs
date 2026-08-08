import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const json = JSON.parse(readFileSync(fileURLToPath(new URL('./data/jlpt_n1_vocab_draft.json', import.meta.url)), 'utf8'));

// Validate entries
const issues = [];
json.forEach((entry, i) => {
  const required = ['id', 'japanese', 'reading', 'english', 'level', 'category', 'pos', 'sentenceJp', 'sentenceEn'];
  required.forEach(f => {
    if (!entry[f]) issues.push(`Entry ${i} (${entry.id}) missing field: ${f}`);
  });
  if (entry.level !== 'N1') issues.push(`Entry ${i} (${entry.id}) wrong level: ${entry.level}`);
});
if (issues.length) {
  console.error('Validation issues:\n' + issues.join('\n'));
  process.exit(1);
}

const tsEntries = json.map(entry => {
  const escape = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `  { id: "${entry.id}", japanese: "${escape(entry.japanese)}", reading: "${escape(entry.reading)}", english: "${escape(entry.english)}", level: "N1", category: "${escape(entry.category)}", pos: "${escape(entry.pos)}",
    sentenceJp: "${escape(entry.sentenceJp)}", sentenceEn: "${escape(entry.sentenceEn)}" },`;
}).join('\n');

const vocabPath = fileURLToPath(new URL('../src/lib/vocab-data.ts', import.meta.url));
let content = readFileSync(vocabPath, 'utf8');

const closingIdx = content.lastIndexOf('\n]');
if (closingIdx === -1) {
  console.error('Could not find closing ] in vocab-data.ts');
  process.exit(1);
}

const newContent = content.slice(0, closingIdx) + '\n' + tsEntries + '\n]' + content.slice(closingIdx + 2);
writeFileSync(vocabPath, newContent, 'utf8');
console.log(`Appended ${json.length} N1 entries to vocab-data.ts`);
