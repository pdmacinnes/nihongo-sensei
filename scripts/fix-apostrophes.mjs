import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const filePath = fileURLToPath(new URL('../src/lib/vocab-data.ts', import.meta.url));
let content = readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let fixCount = 0;

const fixed = lines.map((line, i) => {
  // Check if this line has a sentenceEn or sentenceJp with a curly apostrophe
  if (!/[\u2018\u2019]/.test(line)) return line;

  // Replace curly apostrophes: switch outer quotes from single to double for the affected field
  // sentenceEn: 'TEXT\u2019TEXT' -> sentenceEn: "TEXT'TEXT"
  const result = line
    .replace(/sentenceEn: '([^']*)'/g, (match, inner) => {
      if (/[\u2018\u2019]/.test(inner)) {
        fixCount++;
        return 'sentenceEn: "' + inner.replace(/[\u2018\u2019]/g, "'") + '"';
      }
      return match;
    })
    .replace(/sentenceJp: '([^']*)'/g, (match, inner) => {
      if (/[\u2018\u2019]/.test(inner)) {
        fixCount++;
        return 'sentenceJp: "' + inner.replace(/[\u2018\u2019]/g, "'") + '"';
      }
      return match;
    });

  if (result !== line) {
    console.log(`Line ${i + 1}: fixed`);
  }
  return result;
});

writeFileSync(filePath, fixed.join('\n'), 'utf8');
console.log(`\nTotal fixes: ${fixCount}`);
