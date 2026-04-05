import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HanziWriter from 'hanzi-writer'
import toast from 'react-hot-toast'
import { KANJI_DATA, KanjiEntry } from '../lib/kanji-data'
import { useStore } from '../store'

type Mode = 'browse' | 'stroke' | 'quiz'
type QuizType = 'meaning' | 'reading'

// Stroke order viewer using hanzi-writer
function StrokeOrderViewer({ kanji, animate }: { kanji: string; animate: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriter | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''
    const writer = HanziWriter.create(containerRef.current, kanji, {
      width: 220,
      height: 220,
      padding: 16,
      showOutline: true,
      strokeColor: '#1a1a2a',
      outlineColor: '#e2ddd6',
      drawingColor: '#c94b4b',
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
      delayBetweenLoops: 2000,
      radicalColor: '#2d8a5e',
    })
    writerRef.current = writer
    return () => { writerRef.current = null }
  }, [kanji])

  useEffect(() => {
    if (!writerRef.current) return
    if (animate) {
      writerRef.current.animateCharacter()
    } else {
      writerRef.current.pauseAnimation()
      writerRef.current.showCharacter()
    }
  }, [animate])

  return (
    <div ref={containerRef} className="mx-auto" style={{ width: 220, height: 220 }} />
  )
}

// Quiz step with 4 options
function QuizCard({
  entry, quizType, allEntries, onAnswer,
}: {
  entry: KanjiEntry
  quizType: QuizType
  allEntries: KanjiEntry[]
  onAnswer: (correct: boolean) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)

  const others = allEntries.filter(e => e.kanji !== entry.kanji)
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3)
  const correctLabel = quizType === 'meaning' ? entry.meanings[0] : entry.onyomi[0] || entry.kunyomi[0]
  const optionLabels = [...shuffled.map(e => quizType === 'meaning' ? e.meanings[0] : (e.onyomi[0] || e.kunyomi[0])), correctLabel]
  const [options] = useState(() => {
    const opts = [...optionLabels]
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]]
    }
    return opts
  })
  const correctIdx = options.indexOf(correctLabel)

  const handleSelect = useCallback((i: number) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === correctIdx
    setTimeout(() => {
      onAnswer(correct)
      setSelected(null)
    }, 900)
  }, [selected, correctIdx, onAnswer])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key)
      if (idx !== -1) handleSelect(idx)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleSelect])

  return (
    <div className="flex flex-col items-center">
      <p className="text-ink-400 text-sm mb-4">
        What is the {quizType === 'meaning' ? 'meaning' : 'reading'} of this kanji?
      </p>
      <div className="card mb-6 text-center py-8 px-12 w-full max-w-xs">
        <span className="japanese-text text-8xl text-ink-100">{entry.kanji}</span>
        <p className="text-ink-400 text-sm mt-2">{entry.strokeCount} strokes</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map((opt, i) => {
          const isCorrect = i === correctIdx
          const isSelected = i === selected
          let cls = 'border-border bg-white text-ink-100 hover:border-sakura/40'
          if (selected !== null) {
            if (isCorrect) cls = 'border-jade bg-jade/10 text-jade'
            else if (isSelected) cls = 'border-sakura bg-sakura/10 text-sakura'
            else cls = 'border-border bg-white text-ink-400 opacity-50'
          }
          return (
            <button key={i} onClick={() => handleSelect(i)}
              className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 relative ${cls}`}>
              <span className="absolute top-1.5 left-2 text-[10px] text-ink-400 font-mono opacity-60">{i + 1}</span>
              {quizType === 'reading' ? <span className="japanese-text">{opt}</span> : opt}
            </button>
          )
        })}
      </div>
      <p className="text-ink-400 text-xs mt-4">
        <kbd className="bg-bg-secondary border border-border rounded px-1">1</kbd>–<kbd className="bg-bg-secondary border border-border rounded px-1">4</kbd> select &nbsp;·&nbsp;
        <kbd className="bg-bg-secondary border border-border rounded px-1">M</kbd> meaning &nbsp;·&nbsp;
        <kbd className="bg-bg-secondary border border-border rounded px-1">R</kbd> reading &nbsp;·&nbsp;
        <kbd className="bg-bg-secondary border border-border rounded px-1">Esc</kbd> exit
      </p>
    </div>
  )
}

export default function KanjiStudy() {
  const { kanjiProgress, updateKanjiProgress } = useStore()
  const [mode, setMode] = useState<Mode>('browse')
  const [levelFilter, setLevelFilter] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'all'>('N5')
  const [selected, setSelected] = useState<KanjiEntry | null>(null)
  const [animating, setAnimating] = useState(false)

  // Quiz state
  const [quizPool, setQuizPool] = useState<KanjiEntry[]>([])
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizType, setQuizType] = useState<QuizType>('meaning')
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })

  const filtered = levelFilter === 'all' ? KANJI_DATA : KANJI_DATA.filter(k => k.level === levelFilter)

  const startQuiz = useCallback(() => {
    const pool = [...filtered]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    setQuizPool(pool)
    setQuizIdx(0)
    setQuizScore({ correct: 0, total: 0 })
    setMode('quiz')
  }, [filtered])

  const handleQuizAnswer = useCallback((correct: boolean) => {
    const entry = quizPool[quizIdx]
    updateKanjiProgress(entry.kanji, correct)
    setQuizScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    if (correct) toast('+3 XP', { icon: '⭐', style: { background: '#fdf4e7', color: '#b07d1a', fontWeight: 600 }, duration: 1200 })
    if (quizIdx + 1 >= quizPool.length) {
      setMode('browse')
      toast.success(`Quiz done! ${quizScore.correct + (correct ? 1 : 0)}/${quizScore.total + 1} correct`, { duration: 3000 })
    } else {
      setQuizIdx(i => i + 1)
    }
  }, [quizIdx, quizPool, quizScore, updateKanjiProgress])

  // Global hotkeys
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (mode === 'browse') {
        const filters: ('N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'all')[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'all']
        const idx = ['1', '2', '3', '4', '5', '6'].indexOf(e.key)
        if (idx !== -1) setLevelFilter(filters[idx])
        if (e.key === 'q' || e.key === 'Q') startQuiz()
      }
      if (mode === 'stroke') {
        if (e.key === 'a' || e.key === 'A') setAnimating(true)
        if (e.key === 's' || e.key === 'S') setAnimating(false)
        if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); setMode('browse') }
      }
      if (mode === 'quiz') {
        if (e.key === 'm' || e.key === 'M') setQuizType('meaning')
        if (e.key === 'r' || e.key === 'R') setQuizType('reading')
        if (e.key === 'Escape') setMode('browse')
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [mode, startQuiz])

  const masteredCount = Object.values(kanjiProgress).filter(p => p.mastered).length

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="page-title"><span className="japanese-text text-sakura">漢字</span> Kanji</h1>
          <p className="text-ink-400 text-sm mt-0.5">
            Stroke order, readings, and meanings · {masteredCount}/{KANJI_DATA.length} mastered
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['N5', 'N4', 'N3', 'N2', 'N1', 'all'] as const).map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                levelFilter === l ? 'bg-sakura text-white shadow-sm' : 'btn-secondary'
              }`}>
              {l === 'all' ? 'All' : l}
            </button>
          ))}
          <button onClick={startQuiz} className="btn-primary text-sm px-4">
            🎯 Start Quiz
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── QUIZ MODE ── */}
        {mode === 'quiz' && quizPool.length > 0 && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-ink-400 text-sm">{quizIdx + 1} / {quizPool.length}</span>
                <div className="flex gap-2">
                  {(['meaning', 'reading'] as QuizType[]).map(t => (
                    <button key={t} onClick={() => setQuizType(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${quizType === t ? 'bg-sakura text-white' : 'btn-secondary'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink-400 text-xs">{quizScore.correct}/{quizScore.total}</span>
                <button onClick={() => setMode('browse')} className="btn-ghost text-xs text-ink-400">Exit</button>
              </div>
            </div>
            <div className="w-full max-w-md mx-auto">
              <div className="xp-bar mb-6">
                <div className="h-full rounded-full bg-sakura transition-all duration-500"
                  style={{ width: `${((quizIdx) / quizPool.length) * 100}%` }} />
              </div>
              <QuizCard
                key={quizIdx}
                entry={quizPool[quizIdx]}
                quizType={quizType}
                allEntries={KANJI_DATA}
                onAnswer={handleQuizAnswer}
              />
            </div>
          </motion.div>
        )}

        {/* ── STROKE ORDER VIEW ── */}
        {mode === 'stroke' && selected && (
          <motion.div key="stroke" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-lg mx-auto">
            <button onClick={() => setMode('browse')} className="btn-secondary text-sm mb-5">← Back</button>

            <div className="card text-center mb-4">
              <h2 className="japanese-text text-5xl font-bold text-ink-100 mb-1">{selected.kanji}</h2>
              <p className="text-ink-400 text-sm">{selected.meanings.join(', ')} · {selected.strokeCount} strokes · {selected.level}</p>
            </div>

            <div className="card mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-ink-200 font-semibold">Stroke Order</h3>
                <div className="flex gap-2">
                  <button onClick={() => setAnimating(true)}
                    className="btn-secondary text-xs px-3">▶ Animate</button>
                  <button onClick={() => setAnimating(false)}
                    className="btn-secondary text-xs px-3">■ Stop</button>
                </div>
              </div>
              <div className="bg-bg-primary rounded-xl border border-border">
                <StrokeOrderViewer kanji={selected.kanji} animate={animating} />
              </div>
              <p className="text-ink-400 text-xs text-center mt-2">
                Red = stroke drawing · Green = radical &nbsp;·&nbsp;
                <kbd className="bg-bg-secondary border border-border rounded px-1">A</kbd> animate &nbsp;
                <kbd className="bg-bg-secondary border border-border rounded px-1">S</kbd> stop &nbsp;
                <kbd className="bg-bg-secondary border border-border rounded px-1">Esc</kbd> back
              </p>
            </div>

            <div className="card mb-4">
              <h3 className="text-ink-200 font-semibold mb-3">Readings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-ink-400 text-xs mb-1">On-yomi (Chinese)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.onyomi.length > 0
                      ? selected.onyomi.map(r => <span key={r} className="japanese-text tag-sakura font-bold">{r}</span>)
                      : <span className="text-ink-400 text-xs">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-ink-400 text-xs mb-1">Kun-yomi (Japanese)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.kunyomi.length > 0
                      ? selected.kunyomi.map(r => <span key={r} className="japanese-text tag-jade">{r}</span>)
                      : <span className="text-ink-400 text-xs">—</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-ink-200 font-semibold mb-3">Example Words</h3>
              <div className="space-y-2">
                {selected.examples.map(ex => (
                  <div key={ex.word} className="flex items-center gap-3 p-2 bg-bg-primary rounded-lg border border-border">
                    <span className="japanese-text font-bold text-ink-100 text-lg w-16 text-center">{ex.word}</span>
                    <div>
                      <p className="japanese-text text-ink-400 text-sm">{ex.reading}</p>
                      <p className="text-ink-300 text-xs">{ex.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BROWSE GRID ── */}
        {mode === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
              {filtered.map((entry, i) => {
                const prog = kanjiProgress[entry.kanji]
                const mastered = prog?.mastered
                const seen = prog && (prog.correct + prog.incorrect) > 0
                return (
                  <motion.button
                    key={entry.kanji}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                    onClick={() => { setSelected(entry); setAnimating(false); setMode('stroke') }}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:shadow-card-md hover:scale-105 ${
                      mastered
                        ? 'border-jade/40 bg-jade/8'
                        : seen
                        ? 'border-gold/30 bg-gold/5'
                        : 'border-border bg-white'
                    }`}
                    title={entry.meanings[0]}
                  >
                    <span className="japanese-text text-2xl text-ink-100">{entry.kanji}</span>
                    <span className="text-[9px] text-ink-400 mt-0.5">{entry.level}</span>
                    {mastered && <span className="text-[9px] text-jade font-bold">✓</span>}
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 text-xs text-ink-400">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-jade/40 bg-jade/8" />
                <span>Mastered (5+ correct)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-gold/30 bg-gold/5" />
                <span>Seen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-border bg-white" />
                <span>Not studied</span>
              </div>
              <span className="ml-auto">
                <kbd className="bg-bg-secondary border border-border rounded px-1">1</kbd>–<kbd className="bg-bg-secondary border border-border rounded px-1">4</kbd> filter &nbsp;·&nbsp;
                <kbd className="bg-bg-secondary border border-border rounded px-1">Q</kbd> quiz &nbsp;·&nbsp;
                click any kanji for stroke order
              </span>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
