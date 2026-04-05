import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const section = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Guide() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-16">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-title">
          <span className="japanese-text text-sakura">ガイド</span> Guide
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">How the app works and how to learn Japanese effectively</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
        className="space-y-5"
      >

        {/* ── THE LEARNING PHILOSOPHY ── */}
        <motion.div variants={section} className="card border-sakura/20" style={{ background: 'rgba(201,75,75,0.02)' }}>
          <h2 className="text-ink-100 font-bold text-lg mb-1 flex items-center gap-2">
            <span>🧠</span> How Japanese Learning Actually Works
          </h2>
          <p className="text-ink-400 text-xs mb-4">The method behind this app — why it's built this way</p>

          <div className="space-y-4 text-sm text-ink-300 leading-relaxed">
            <p>
              Most people try to learn Japanese by memorising vocabulary lists or grinding grammar rules.
              This works poorly. Research shows that <span className="text-ink-100 font-medium">context is everything</span> —
              your brain remembers words far better when it first encounters them inside a real sentence
              with meaning attached to it (Craik &amp; Lockhart, 1972 — "Levels of Processing").
            </p>
            <p>
              This app is built around that insight. Every flashcard shows you a sentence first, not a word list.
              Every grammar drill puts the pattern inside a real example. The AI conversation forces you
              to retrieve language under pressure, which is exactly what cements it long-term.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { step: '1', title: 'Learn the alphabet', desc: 'Hiragana and katakana first. Everything else is built on this.' },
                { step: '2', title: 'Build vocabulary', desc: 'Daily flashcards using spaced repetition. Small doses every day beat cramming.' },
                { step: '3', title: 'Use the language', desc: 'Conversation practice with Sakura reinforces everything and exposes gaps.' },
              ].map(s => (
                <div key={s.step} className="sentence-card text-center">
                  <div className="w-7 h-7 rounded-full bg-sakura/15 text-sakura font-bold text-sm flex items-center justify-center mx-auto mb-2">
                    {s.step}
                  </div>
                  <p className="text-ink-100 font-medium text-xs mb-1">{s.title}</p>
                  <p className="text-ink-400 text-xs">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── KANA ── */}
        <motion.div variants={section} className="card">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg flex items-center gap-2">
              <span>字</span> Kana Study
              <span className="tag-sakura text-xs">Start here</span>
            </h2>
            <button onClick={() => navigate('/kana')} className="btn-ghost text-xs">Open →</button>
          </div>
          <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
            <p>
              Japanese has three writing systems. You need two of them before anything else will make sense:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="sentence-card">
                <p className="japanese-text text-sakura font-bold mb-1">ひらがな Hiragana</p>
                <p className="text-xs">46 characters. Used for Japanese grammar words, verb endings, and words without kanji.
                  This is the most important one — learn it first.</p>
                <p className="japanese-text text-ink-400 text-xs mt-1">Example: たべる (to eat)</p>
              </div>
              <div className="sentence-card">
                <p className="japanese-text text-sakura font-bold mb-1">カタカナ Katakana</p>
                <p className="text-xs">46 characters. Used for foreign loan words and emphasis.
                  Learn after hiragana — it mirrors the same sounds.</p>
                <p className="japanese-text text-ink-400 text-xs mt-1">Example: コーヒー (coffee)</p>
              </div>
            </div>
            <p>
              <span className="text-ink-100 font-medium">How to use it:</span> Switch to Chart mode to see the full grid,
              then hit Drill to practice. The app tracks each character — 5 correct answers marks it as mastered.
              Aim to finish all 46 hiragana before moving to katakana.
              Most learners finish hiragana in 1–2 weeks with daily 10-minute sessions.
            </p>
            <div className="flex items-center gap-2 p-3 bg-gold/8 border border-gold/20 rounded-lg text-xs">
              <span className="text-gold text-base">💡</span>
              <p>Do not use romaji (romanized Japanese like "taberu") as a crutch.
                The sooner you read in kana, the faster everything else clicks.</p>
            </div>
          </div>
        </motion.div>

        {/* ── VOCAB ── */}
        <motion.div variants={section} className="card">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg flex items-center gap-2">
              <span>📚</span> Vocabulary (SRS Flashcards)
            </h2>
            <button onClick={() => navigate('/vocab')} className="btn-ghost text-xs">Open →</button>
          </div>
          <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
            <p>
              The flashcard system uses <span className="text-ink-100 font-medium">Spaced Repetition (SRS)</span> —
              a proven technique where you review each word at precisely the moment you're about to forget it.
              This makes long-term retention dramatically more efficient than re-reading or random quizzing.
            </p>

            <div className="sentence-card">
              <p className="text-ink-200 font-medium text-xs mb-2">How a card works:</p>
              <ol className="space-y-1.5 text-xs list-none">
                {[
                  'You see a sentence with the target word blanked out',
                  'You think about the meaning from context',
                  'You click to reveal the word, reading, and translation',
                  'You rate how well you remembered it (Again / Hard / Good / Easy)',
                  'The app schedules the next review based on your rating',
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sakura/15 text-sakura text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              {[
                { label: 'Again', color: 'text-sakura', bg: 'bg-sakura/8 border-sakura/20', desc: "Didn't remember. Reviews again in minutes." },
                { label: 'Hard', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', desc: 'Remembered with effort. Short interval.' },
                { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', desc: 'Remembered well. Normal interval.' },
                { label: 'Easy', color: 'text-jade', bg: 'bg-jade/8 border-jade/20', desc: 'Instantly recalled. Long interval boost.' },
              ].map(r => (
                <div key={r.label} className={`p-2 rounded-lg border ${r.bg}`}>
                  <p className={`font-bold ${r.color} mb-1`}>{r.label}</p>
                  <p className="text-ink-400 leading-tight">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="sentence-card">
                <p className="text-ink-200 font-medium mb-1">Card states</p>
                <ul className="space-y-1 text-ink-400">
                  <li><span className="tag-sakura">New</span> — not studied yet</li>
                  <li><span className="tag bg-blue-50 text-blue-600 border-blue-200">Learning</span> — in short-term pipeline (1min → 10min → 1 day)</li>
                  <li><span className="tag-jade">Review</span> — in long-term memory, reviewed in days/weeks</li>
                </ul>
              </div>
              <div className="sentence-card">
                <p className="text-ink-200 font-medium mb-1">Daily limit</p>
                <p className="text-ink-400">You learn up to <span className="text-ink-200 font-medium">10 new cards per day</span> by default
                  (adjustable in Settings). Reviews of old cards are unlimited.
                  Consistency matters far more than volume — 10 cards/day = ~3,600 words per year.</p>
              </div>
            </div>

            <p className="text-xs">
              <span className="text-ink-100 font-medium">Keyboard shortcuts:</span>{' '}
              <span className="font-mono bg-bg-secondary px-1 rounded">Space</span> to flip the card ·{' '}
              <span className="font-mono bg-bg-secondary px-1 rounded">1</span> Again ·{' '}
              <span className="font-mono bg-bg-secondary px-1 rounded">2</span> Hard ·{' '}
              <span className="font-mono bg-bg-secondary px-1 rounded">3</span> Good ·{' '}
              <span className="font-mono bg-bg-secondary px-1 rounded">4</span> Easy
            </p>
          </div>
        </motion.div>

        {/* ── GRAMMAR ── */}
        <motion.div variants={section} className="card">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg flex items-center gap-2">
              <span>✍️</span> Grammar
            </h2>
            <button onClick={() => navigate('/grammar')} className="btn-ghost text-xs">Open →</button>
          </div>
          <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
            <p>
              Grammar in Japanese is very different from English — verbs go at the end, subjects are often dropped,
              and particles (small words like は、を、に) carry most of the structural meaning.
              This section covers N5 and N4 grammar patterns using a fill-in-the-blank (cloze) format.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="sentence-card">
                <p className="text-ink-200 font-medium text-xs mb-1">Browse mode</p>
                <p className="text-xs">Read through all grammar patterns with full explanations and example sentences.
                  Click any pattern to expand it. Good for initial study or review before drilling.</p>
              </div>
              <div className="sentence-card">
                <p className="text-ink-200 font-medium text-xs mb-1">Drill mode</p>
                <p className="text-xs">You see an English translation and a Japanese sentence with the grammar pattern blanked.
                  Type the correct grammar form. Press Enter to check, Enter/Space to advance.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gold/8 border border-gold/20 rounded-lg text-xs">
              <span className="text-gold text-base">💡</span>
              <p>Don't try to memorise grammar rules in isolation. Focus on recognising each pattern
                inside a real sentence. After enough exposure, correct grammar will feel natural rather than calculated.</p>
            </div>
          </div>
        </motion.div>

        {/* ── CONVERSATION ── */}
        <motion.div variants={section} className="card">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg flex items-center gap-2">
              <span>💬</span> AI Conversation
              <span className="tag-sakura">Core feature</span>
            </h2>
            <button onClick={() => navigate('/conversation')} className="btn-ghost text-xs">Open →</button>
          </div>
          <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
            <p>
              This is the most important part of the app. You chat with Sakura (桜先生), an AI Japanese tutor,
              in real Japanese. After each message she replies with:
            </p>
            <ol className="space-y-1.5 text-xs list-none">
              {[
                'Her response in Japanese (adjusted to your level)',
                'An English translation (hidden by default — try to understand before peeking)',
                'Corrections on any grammar or vocabulary mistakes you made',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-sakura/15 text-sakura text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="sentence-card">
                <p className="text-ink-200 font-medium mb-1">Scenarios</p>
                <p className="text-ink-400">Choose a situation before starting — restaurant, shopping, self-introduction, etc.
                  Scenarios give Sakura context so the conversation stays focused and realistic.</p>
              </div>
              <div className="sentence-card">
                <p className="text-ink-200 font-medium mb-1">Difficulty levels</p>
                <p className="text-ink-400">N5 uses very simple sentences and shows furigana (reading hints) on kanji.
                  N2 uses natural speech with complex grammar. Match it to your current level.</p>
              </div>
            </div>

            <div className="sentence-card text-xs">
              <p className="text-ink-200 font-medium mb-1">Sentence mining</p>
              <p>When Sakura uses a word that exists in the vocabulary list, a green <span className="text-jade font-bold">+ Add</span> button
                appears next to it. Clicking it adds that word to your SRS deck so you'll study it in flashcards.
                This is called <span className="text-ink-100 font-medium">sentence mining</span> — building your deck
                from language you actually encountered in context.</p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-jade/8 border border-jade/20 rounded-lg text-xs">
              <span className="text-jade text-base">✓</span>
              <p>Even if your Japanese is broken, just try. Sakura will always correct you kindly.
                Making mistakes and seeing them corrected immediately is one of the most effective ways to learn.</p>
            </div>
          </div>
        </motion.div>

        {/* ── PROGRESS ── */}
        <motion.div variants={section} className="card">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg flex items-center gap-2">
              <span>📊</span> Progress
            </h2>
            <button onClick={() => navigate('/progress')} className="btn-ghost text-xs">Open →</button>
          </div>
          <div className="text-sm text-ink-300 leading-relaxed space-y-2">
            <p>Tracks your overall learning: XP earned, streak, kana mastery, SRS card maturity breakdown,
              conversation history, and achievement badges. Use this to spot weak areas
              — if your kana mastery is low, prioritise the Kana page before adding more vocab.</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Streak 🔥', desc: 'Days in a row you studied. Even 5 minutes counts. Streaks build habit.' },
                { label: 'XP ⭐', desc: 'Earned from every review, drill, and conversation. Tracks total effort.' },
                { label: 'Maturity', desc: 'Cards progress: New → Young → Maturing → Mature → Mastered.' },
              ].map(s => (
                <div key={s.label} className="sentence-card">
                  <p className="text-ink-200 font-medium mb-1">{s.label}</p>
                  <p className="text-ink-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RECOMMENDED SCHEDULE ── */}
        <motion.div variants={section} className="card border-jade/20" style={{ background: 'rgba(45,138,94,0.02)' }}>
          <h2 className="text-ink-100 font-bold text-lg mb-3 flex items-center gap-2">
            <span>🗓️</span> Recommended Daily Schedule
          </h2>
          <div className="space-y-2">
            {[
              { time: '~10 min', activity: 'Vocab reviews', detail: 'Clear your due cards first — never skip these. Reviews compound over time.' },
              { time: '~5 min',  activity: 'Kana drill', detail: 'Until you hit 100% mastery. Skip once you have it.' },
              { time: '~10 min', activity: 'Grammar drill', detail: 'Run through one session of cloze drills.' },
              { time: '~15 min', activity: 'Conversation', detail: 'At least one scenario with Sakura. This is where real learning happens.' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white border border-border rounded-xl">
                <span className="tag-jade flex-shrink-0 mt-0.5">{row.time}</span>
                <div>
                  <p className="text-ink-100 font-medium text-sm">{row.activity}</p>
                  <p className="text-ink-400 text-xs mt-0.5">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-ink-400 text-xs mt-3">
            Total: ~40 minutes/day. This is enough to reach conversational Japanese in 1–2 years with consistent practice.
            The single most important thing is <span className="text-ink-200 font-medium">not missing days</span> — a short session every day beats long sessions twice a week.
          </p>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div variants={section} className="card">
          <h2 className="text-ink-100 font-bold text-lg mb-4 flex items-center gap-2">
            <span>❓</span> Common Questions
          </h2>
          <div className="space-y-4 text-sm">
            {[
              {
                q: 'Where do I start if I know zero Japanese?',
                a: 'Kana Study → learn all 46 hiragana first. Do the drill daily until everything is mastered. Then start vocab cards and your first conversation.',
              },
              {
                q: 'Should I type in Japanese or English in the conversation?',
                a: 'Always try Japanese, even broken Japanese. Use your OS Japanese keyboard (Windows: Win+Space to switch input). Sakura will correct you. If you get stuck, English is fine — she\'ll respond in Japanese anyway.',
              },
              {
                q: 'My review count keeps growing. Is that normal?',
                a: 'Yes — this is the SRS working correctly. Reviews pile up when you add too many new cards or miss days. Prioritise clearing reviews before learning new words. If overwhelmed, lower your daily new card limit in Settings.',
              },
              {
                q: 'What does XP do?',
                a: 'XP is a motivational tracker only — it has no gameplay effect. It reflects how much total studying you\'ve done.',
              },
              {
                q: 'How long until I can hold a real conversation?',
                a: 'With consistent daily use (40 min/day), most people reach basic conversational ability in 6–12 months. Reading ability in kana and common kanji comes around the same time.',
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="text-ink-100 font-medium mb-1">{item.q}</p>
                <p className="text-ink-400 text-xs leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={section} className="text-center py-4">
          <p className="text-ink-400 text-sm mb-4">Ready? Start with the most important step:</p>
          <button onClick={() => navigate('/kana')} className="btn-primary px-8 py-3 text-base">
            <span className="japanese-text">始めましょう</span> — Open Kana Study
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
