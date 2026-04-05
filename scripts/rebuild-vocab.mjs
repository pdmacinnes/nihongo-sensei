import { readFileSync, writeFileSync } from 'fs';

const vocabPath = 'C:/Users/Patrick/desktop/translationtool/src/lib/vocab-data.ts';

// Normalize N3 which has different field names/values
function normalizeN3(json) {
  const posMap = {
    'verb (godan)': 'verb (u)',
    'verb (ichidan)': 'verb (ru)',
    'verb (suru)': 'verb (suru)',
    'i-adjective': 'adjective (i)',
    'na-adjective': 'adjective (na)',
    'na-adjective / noun': 'adjective (na)',
    'na-adjective / noun / suru-verb': 'verb (suru)',
    'noun / suru-verb': 'verb (suru)',
    'noun / suru-verb / na-adjective': 'verb (suru)',
    'noun / na-adjective': 'adjective (na)',
    'noun / adverb': 'noun',
    'adverb / conjunction': 'adverb',
    'adverb / noun': 'adverb',
    'adverb / pronoun': 'adverb',
    'conjunction / noun': 'conjunction',
    'expression / noun': 'expression',
  };
  const catMap = {
    'Core Verbs': 'verbs',
    'Adjectives': 'adjectives',
    'Abstract Nouns': 'abstract',
    'Academic/Study Vocabulary': 'school',
    'Body/Health': 'health',
    'Formal Expressions': 'expressions',
    'Nature/Environment': 'nature',
    'Time/Frequency Expressions': 'time',
    'Useful Adverbs/Conjunctions': 'adverbs',
    'Work/Business Nouns': 'work',
  };
  return json.map((entry, i) => ({
    id: `v${500 + i}`,
    japanese: entry.japanese,
    reading: entry.reading,
    english: entry.english,
    level: 'N3',
    category: catMap[entry.category] || entry.category.toLowerCase(),
    pos: posMap[entry.pos] || entry.pos,
    sentenceJp: entry.sentenceJp,
    sentenceEn: entry.sentenceEn,
  }));
}

// Load all 5 JSON files
const levels = [
  { file: 'jlpt_n5_vocab_draft.json', level: 'N5' },
  { file: 'jlpt_n4_vocab_draft.json', level: 'N4' },
  { file: 'jlpt_n3_vocab_draft.json', level: 'N3' },
  { file: 'jlpt_n2_vocab_draft.json', level: 'N2' },
  { file: 'jlpt_n1_vocab_draft.json', level: 'N1' },
];

const allData = {};
for (const { file, level } of levels) {
  let json = JSON.parse(readFileSync(`C:/Users/Patrick/desktop/claude/${file}`, 'utf8'));
  if (level === 'N3') json = normalizeN3(json);
  // Validate
  const issues = [];
  const seen = new Set();
  json.forEach((entry, i) => {
    const required = ['id', 'japanese', 'reading', 'english', 'level', 'category', 'pos', 'sentenceJp', 'sentenceEn'];
    required.forEach(f => { if (!entry[f]) issues.push(`${level}[${i}] missing: ${f}`); });
    if (seen.has(entry.id)) issues.push(`Duplicate id: ${entry.id}`);
    seen.add(entry.id);
  });
  if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
  allData[level] = json;
  console.log(`${level}: ${json.length} entries (${json[0].id} - ${json[json.length-1].id})`);
}

// Convert one entry to a TypeScript object literal string
const escape = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function entryToTs(entry) {
  const fields = [
    `id: "${escape(entry.id)}"`,
    `japanese: "${escape(entry.japanese)}"`,
    `reading: "${escape(entry.reading)}"`,
    `english: "${escape(entry.english)}"`,
    `level: "${escape(entry.level)}"`,
    `category: "${escape(entry.category)}"`,
    `pos: "${escape(entry.pos)}"`,
  ];
  if (entry.pitchAccent !== undefined) fields.push(`pitchAccent: ${entry.pitchAccent}`);
  return (
    `  { ${fields.join(', ')},\n` +
    `    sentenceJp: "${escape(entry.sentenceJp)}", sentenceEn: "${escape(entry.sentenceEn)}" },`
  );
}

// Build the file
let out = `// Sentence-first vocabulary — Levels of Processing research shows context = deeper retention
export interface VocabWord {
  id: string
  japanese: string
  reading: string
  english: string
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  category: string
  // Sentence context for deep processing (always preferred over definition-only)
  sentenceJp: string
  sentenceEn: string
  // Part of speech hint
  pos?: string
  // Pitch accent type (standard Tokyo/NHK): 0=heiban, 1=atamadaka, 2+=drop after nth mora
  pitchAccent?: number
}

`;

for (const level of ['N5', 'N4', 'N3', 'N2', 'N1']) {
  out += `const VOCAB_${level}: VocabWord[] = [\n`;
  out += allData[level].map(entryToTs).join('\n');
  out += '\n]\n\n';
}

out += `export const VOCAB_DATA: VocabWord[] = [
  ...VOCAB_N5,
  ...VOCAB_N4,
  ...VOCAB_N3,
  ...VOCAB_N2,
  ...VOCAB_N1,
]

export const CATEGORIES = [...new Set(VOCAB_DATA.map(w => w.category))].sort()
export const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
`;

writeFileSync(vocabPath, out, 'utf8');
console.log('\nFile written. Total entries:', Object.values(allData).reduce((s, a) => s + a.length, 0));
