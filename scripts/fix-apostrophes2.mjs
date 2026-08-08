import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const filePath = fileURLToPath(new URL('../src/lib/vocab-data.ts', import.meta.url));
const content = readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Error line numbers (1-indexed) from tsc output
const errorLines = new Set([
  799, 823, 837, 851, 853, 861, 871, 917, 925, 985, 989, 999,
  1003, 1005, 1011, 1035, 1051, 1069, 1073, 1079, 1089, 1097,
  1113, 1119, 1121, 1139, 1149, 1151, 1163, 1207, 1235, 1237,
  1243, 1251, 1281, 1315, 1320, 1323, 1343, 1353, 1361
]);

let fixCount = 0;

const fixed = lines.map((line, i) => {
  const lineNum = i + 1;
  if (!errorLines.has(lineNum)) return line;

  // This line has an unterminated string in a sentenceEn or sentenceJp field
  // The value starts at sentenceEn: ' or sentenceJp: ' and ends before ' }
  // Strategy: find sentenceEn: ' and sentenceJp: ', then extract to last ' that closes the object

  let result = line;

  // Fix sentenceEn field: the line ends with ' }, or ' }
  // We need to capture the full value including embedded apostrophes
  // Pattern: from sentenceEn: ' to the closing ' at the very end of the sentenceEn value
  // The sentenceEn value always precedes ' }, or ' } at line end

  // Find sentenceEn: '....' },  where the value may contain apostrophes
  // Use a greedy match to get everything between sentenceEn: ' and the last ' before ' },
  result = result.replace(/sentenceEn: '(.*?)'\s*\},\s*$/, (match, val) => {
    // This is non-greedy - will stop at first apostrophe. Wrong for our case.
    return match; // skip, use greedy below
  });

  // Reset and use greedy approach
  result = line;

  // The line structure: ...sentenceEn: 'VALUE' },
  // With embedded apostrophe: ...sentenceEn: 'VAL'UE' },
  // We want to capture VAL'UE as the value

  // Find the position of "sentenceEn: '" and extract from there to end
  const enMatch = result.match(/^(.*sentenceEn: ')(.*?)('\s*\},\s*)$/);
  if (enMatch) {
    const prefix = enMatch[1];   // everything up to and including the opening quote
    const suffix = enMatch[3];   // the closing ' },
    const rawValue = enMatch[2]; // what non-greedy captured (stops at first apostrophe if any)

    // Use greedy: find everything between sentenceEn: ' and the LAST ' }, at end of line
    const greedyMatch = result.match(/^(.*sentenceEn: ')(.*)'(\s*\},\s*)$/);
    if (greedyMatch) {
      const greedyValue = greedyMatch[2];
      if (greedyValue.includes("'")) {
        // There's an apostrophe in the value - switch to double quotes
        const newLine = greedyMatch[1].slice(0, -1) + '"' + greedyValue + '"' + greedyMatch[3];
        console.log(`Line ${lineNum}: fixed sentenceEn - "${greedyValue.substring(0, 50)}..."`);
        fixCount++;
        return newLine;
      }
    }
  }

  // Also fix sentenceJp if needed (less common)
  const jpGreedy = result.match(/^(.*sentenceJp: ')(.*)'(.*sentenceEn:.*)$/);
  if (jpGreedy && jpGreedy[2].includes("'")) {
    const newLine = jpGreedy[1].slice(0, -1) + '"' + jpGreedy[2] + '"' + jpGreedy[3];
    console.log(`Line ${lineNum}: fixed sentenceJp`);
    fixCount++;
    return newLine;
  }

  console.log(`Line ${lineNum}: NO FIX APPLIED - "${result.trim().substring(0, 80)}"`);
  return result;
});

writeFileSync(filePath, fixed.join('\n'), 'utf8');
console.log(`\nTotal fixes: ${fixCount}`);
