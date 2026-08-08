import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-ink-300 border-l-2 border-gold/40 pl-3 py-1 leading-relaxed">
      {children}
    </p>
  )
}

export default function Guide() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="page-title">
          <span className="japanese-text text-sakura">ガイド</span> Guide
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">How the app works and how to learn Japanese effectively</p>
      </div>

      <div className="space-y-10 text-sm text-ink-300 leading-relaxed">

        <section>
          <h2 className="text-ink-100 font-bold text-lg mb-1">How learning actually works</h2>
          <p className="text-ink-400 text-xs mb-4">Why this app is built the way it is</p>
          <p className="mb-3">
            Memorising word lists alone works poorly. Your brain remembers language better when it first
            meets words <span className="text-ink-100 font-medium">inside a real sentence</span> with meaning attached.
          </p>
          <p className="mb-4">
            Every flashcard leads with a sentence. Grammar drills use real examples. Conversation with Sakura
            forces retrieval under pressure — that&apos;s what sticks long-term.
          </p>
          <ol className="space-y-3 list-none">
            {[
              { n: '1', t: 'Learn the alphabet', d: 'Hiragana and katakana first. Everything else builds on this.' },
              { n: '2', t: 'Build vocabulary', d: 'Daily SRS flashcards. Small doses beat cramming.' },
              { n: '3', t: 'Use the language', d: 'Chat with Sakura to reinforce and expose gaps.' },
            ].map(s => (
              <li key={s.n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sakura/15 text-sakura font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {s.n}
                </span>
                <div>
                  <p className="text-ink-100 font-medium text-sm">{s.t}</p>
                  <p className="text-ink-400 text-xs">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border pt-8">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg">
              <span className="japanese-text text-sakura mr-2">かな</span>Kana Study
              <span className="tag-sakura text-xs ml-2 align-middle">Start here</span>
            </h2>
            <button type="button" onClick={() => navigate('/kana')} className="btn-ghost text-xs">Open →</button>
          </div>
          <p className="mb-4">
            Japanese has three writing systems. You need two before anything else makes sense:
          </p>
          <div className="space-y-3 mb-4">
            <div>
              <p className="japanese-text text-sakura font-bold mb-0.5">ひらがな Hiragana</p>
              <p className="text-xs">46 characters for grammar words, verb endings, and words without kanji. Learn this first.</p>
              <p className="japanese-text text-ink-400 text-xs mt-1">Example: たべる (to eat)</p>
            </div>
            <div>
              <p className="japanese-text text-sakura font-bold mb-0.5">カタカナ Katakana</p>
              <p className="text-xs">46 characters for loan words and emphasis. Same sounds as hiragana — learn after.</p>
              <p className="japanese-text text-ink-400 text-xs mt-1">Example: コーヒー (coffee)</p>
            </div>
          </div>
          <p className="mb-3">
            <span className="text-ink-100 font-medium">How to use it:</span> Chart mode for the grid, Drill to practice.
            Five correct answers marks a character mastered. Finish hiragana before katakana.
          </p>
          <Tip>Don&apos;t lean on romaji (like &quot;taberu&quot;). The sooner you read in kana, the faster everything else clicks.</Tip>
        </section>

        <section className="border-t border-border pt-8">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg">
              <span className="japanese-text text-sakura mr-2">単語</span>Vocabulary (SRS)
            </h2>
            <button type="button" onClick={() => navigate('/vocab')} className="btn-ghost text-xs">Open →</button>
          </div>
          <p className="mb-4">
            Flashcards use <span className="text-ink-100 font-medium">spaced repetition</span> — review each word
            right when you&apos;re about to forget it.
          </p>
          <p className="text-ink-200 font-medium text-xs mb-2">How a card works</p>
          <ol className="space-y-1.5 text-xs list-none mb-4">
            {[
              'See a sentence with the target word blanked',
              'Think about meaning from context',
              'Reveal the word, reading, and translation',
              'Rate how well you remembered (Again / Hard / Good / Easy)',
              'Next review is scheduled from your rating',
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sakura font-bold w-4">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            {[
              { label: 'Again', color: 'text-sakura', desc: 'Reviews again in minutes.' },
              { label: 'Hard', color: 'text-orange-500', desc: 'Short interval.' },
              { label: 'Good', color: 'text-blue-600', desc: 'Normal interval.' },
              { label: 'Easy', color: 'text-jade', desc: 'Long interval boost.' },
            ].map(r => (
              <div key={r.label}>
                <p className={`font-bold ${r.color} mb-0.5`}>{r.label}</p>
                <p className="text-ink-400 leading-tight">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mb-2">
            Default: <span className="text-ink-200 font-medium">10 new cards/day</span> (Settings). Reviews are unlimited.
            Consistency beats volume.
          </p>
          <p className="text-xs">
            <span className="text-ink-100 font-medium">Shortcuts:</span>{' '}
            <span className="font-mono bg-bg-secondary px-1 rounded">Space</span> flip ·{' '}
            <span className="font-mono bg-bg-secondary px-1 rounded">1–4</span> rate
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg">
              <span className="japanese-text text-sakura mr-2">文法</span>Grammar
            </h2>
            <button type="button" onClick={() => navigate('/grammar')} className="btn-ghost text-xs">Open →</button>
          </div>
          <p className="mb-3">
            Verbs go at the end, subjects often drop, and particles (は、を、に) carry structure.
            Browse for explanations; Drill for cloze practice.
          </p>
          <Tip>Don&apos;t memorise rules in isolation. Recognise each pattern inside real sentences.</Tip>
        </section>

        <section className="border-t border-border pt-8">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg">
              <span className="japanese-text text-sakura mr-2">会話</span>AI Conversation
              <span className="tag-sakura text-xs ml-2 align-middle">Core</span>
            </h2>
            <button type="button" onClick={() => navigate('/conversation')} className="btn-ghost text-xs">Open →</button>
          </div>
          <p className="mb-3">
            Chat with Sakura (桜先生). After each message you get Japanese (level-adjusted),
            a hidden English translation, and corrections.
          </p>
          <ul className="space-y-2 text-xs mb-3 list-none">
            <li><span className="text-ink-100 font-medium">Scenarios</span> — restaurant, shopping, intros, and more keep chat focused.</li>
            <li><span className="text-ink-100 font-medium">Levels</span> — N5 is simple with furigana; N2 is natural complex speech.</li>
            <li><span className="text-ink-100 font-medium">Sentence mining</span> — tap + on words Sakura uses to add them to your SRS deck.</li>
          </ul>
          <Tip>Broken Japanese is fine. Mistakes + immediate correction is one of the fastest ways to improve.</Tip>
        </section>

        <section className="border-t border-border pt-8">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-ink-100 font-bold text-lg">
              <span className="japanese-text text-sakura mr-2">進捗</span>Progress
            </h2>
            <button type="button" onClick={() => navigate('/progress')} className="btn-ghost text-xs">Open →</button>
          </div>
          <p>
            Tracks XP, streak, kana mastery, SRS maturity, conversations, and achievements.
            If kana mastery is low, prioritise Kana before stacking more vocab.
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-ink-100 font-bold text-lg mb-4">Recommended daily schedule</h2>
          <div className="space-y-3">
            {[
              { time: '~10 min', activity: 'Vocab reviews', detail: 'Clear due cards first — never skip these.' },
              { time: '~5 min', activity: 'Kana drill', detail: 'Until 100% mastery, then skip.' },
              { time: '~10 min', activity: 'Grammar drill', detail: 'One cloze session.' },
              { time: '~15 min', activity: 'Conversation', detail: 'At least one scenario with Sakura.' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <span className="tag-jade flex-shrink-0 mt-0.5">{row.time}</span>
                <div>
                  <p className="text-ink-100 font-medium text-sm">{row.activity}</p>
                  <p className="text-ink-400 text-xs mt-0.5">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-ink-400 text-xs mt-4">
            ~40 minutes/day is enough for conversational Japanese in 1–2 years.
            Missing days hurts more than short sessions.
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-ink-100 font-bold text-lg mb-4">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Where do I start with zero Japanese?',
                a: 'Kana Study → all 46 hiragana. Then vocab cards and your first conversation.',
              },
              {
                q: 'Japanese or English in chat?',
                a: 'Always try Japanese. Use your OS IME (Win+Space). Sakura corrects you. English is fine if stuck.',
              },
              {
                q: 'My review count keeps growing. Normal?',
                a: 'Yes. Prioritise reviews before new cards. Lower the daily new limit in Settings if overwhelmed.',
              },
              {
                q: 'What does XP do?',
                a: 'Motivational tracker only — reflects total studying, no gameplay effect.',
              },
              {
                q: 'How long until a real conversation?',
                a: 'With ~40 min/day, basic conversation often lands in 6–12 months.',
              },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-ink-100 font-medium mb-1">{item.q}</p>
                <p className="text-ink-400 text-xs leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-4">
          <p className="text-ink-400 text-sm mb-4">Ready? Start with the most important step:</p>
          <button type="button" onClick={() => navigate('/kana')} className="btn-primary px-8 py-3 text-base">
            <span className="japanese-text">始めましょう</span> — Open Kana Study
          </button>
        </div>
      </div>
    </div>
  )
}
