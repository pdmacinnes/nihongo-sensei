import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { HIRAGANA, KATAKANA, HIRAGANA_GRID, KATAKANA_GRID, ROMAJI_MAP } from '../lib/kana-data'

type Mode = 'chart' | 'drill'
type KanaType = 'hiragana' | 'katakana' | 'both'

export default function KanaStudy() {
  const [mode, setMode] = useState<Mode>('chart')
  const [kanaType, setKanaType] = useState<KanaType>('hiragana')
  const [drillSet, setDrillSet] = useState<typeof HIRAGANA>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [showAnswer, setShowAnswer] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { kanaProgress, updateKanaProgress } = useStore()

  const startDrill = useCallback((type: KanaType) => {
    const pool = type === 'hiragana' ? HIRAGANA : type === 'katakana' ? KATAKANA : [...HIRAGANA, ...KATAKANA]
    const shuffled = [...pool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setDrillSet(shuffled)
    setCurrentIndex(0)
    setInput('')
    setFeedback(null)
    setShowAnswer(false)
    setSessionStats({ correct: 0, wrong: 0 })
    setMode('drill')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const currentKana = drillSet[currentIndex]

  const advance = useCallback(() => {
    setFeedback(null)
    setInput('')
    setShowAnswer(false)
    if (currentIndex + 1 >= drillSet.length) setMode('chart')
    else {
      setCurrentIndex(i => i + 1)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [currentIndex, drillSet.length])

  const checkAnswer = useCallback(() => {
    if (!currentKana || !input.trim() || feedback !== null) return
    const n = input.trim().toLowerCase()
    const correct = n === currentKana.romaji ||
      (currentKana.romaji === 'shi' && n === 'si') ||
      (currentKana.romaji === 'chi' && n === 'ti') ||
      (currentKana.romaji === 'tsu' && n === 'tu') ||
      (currentKana.romaji === 'fu' && n === 'hu')

    setFeedback(correct ? 'correct' : 'wrong')
    updateKanaProgress(currentKana.kana, correct)
    setSessionStats(s => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }))
    setTimeout(advance, correct ? 500 : 1100)
  }, [currentKana, input, feedback, advance, updateKanaProgress])

  const iDontKnow = useCallback(() => {
    if (!currentKana || feedback !== null) return
    setShowAnswer(true)
    setFeedback('wrong')
    updateKanaProgress(currentKana.kana, false)
    setSessionStats(s => ({ ...s, wrong: s.wrong + 1 }))
    setTimeout(advance, 1100)
  }, [currentKana, feedback, advance, updateKanaProgress])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (mode !== 'drill') return
      if (e.key === 'Enter') checkAnswer()
      if (e.key === 'Escape') { e.preventDefault(); iDontKnow() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [mode, checkAnswer, iDontKnow])

  const grid = kanaType === 'katakana' ? KATAKANA_GRID : HIRAGANA_GRID
  const kanaList = kanaType === 'katakana' ? KATAKANA : kanaType === 'hiragana' ? HIRAGANA : [...HIRAGANA, ...KATAKANA]
  const masteredCount = kanaList.filter(k => kanaProgress[k.kana]?.mastered).length

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title"><span className="japanese-text text-sakura">かな</span> Kana Study</h1>
          <p className="text-ink-400 text-sm mt-0.5">Master hiragana and katakana</p>
        </div>
        <div className="text-right">
          <p className="text-jade font-bold text-lg">{masteredCount}<span className="text-ink-400 text-sm font-normal">/{kanaList.length}</span></p>
          <p className="text-ink-400 text-xs">mastered</p>
        </div>
      </div>

      {/* Type + mode controls */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['hiragana', 'katakana', 'both'] as KanaType[]).map(t => (
          <button key={t} onClick={() => setKanaType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              kanaType === t ? 'bg-sakura text-white shadow-sm' : 'btn-secondary'
            }`}>
            {t === 'hiragana' ? 'Hiragana あ' : t === 'katakana' ? 'Katakana ア' : 'Both'}
          </button>
        ))}
        <div className="flex-1" />
        {mode === 'chart'
          ? <button onClick={() => startDrill(kanaType)} className="btn-primary">▶ Start Drill</button>
          : <button onClick={() => setMode('chart')} className="btn-secondary">← Chart</button>
        }
      </div>

      <AnimatePresence mode="wait">
        {mode === 'chart' && (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card mb-4">
              <div className="flex items-center gap-4 mb-4 text-xs text-ink-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded border-2 border-jade/40 bg-jade/10 inline-block" />
                  Mastered (5+ correct)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded border-2 border-blue-200 bg-blue-50 inline-block" />
                  Seen
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded border border-border bg-white inline-block" />
                  Not yet
                </span>
              </div>

              {/* Column headers */}
              <div className="grid gap-1.5 mb-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {['a', 'i', 'u', 'e', 'o'].map(col => (
                  <div key={col} className="text-center text-ink-400 text-xs font-mono">{col}</div>
                ))}
              </div>

              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {grid.map((row, ri) => row.map((cell, ci) => {
                  if (!cell) return <div key={`${ri}-${ci}`} />
                  const prog = kanaProgress[cell]
                  const mastered = prog?.mastered
                  const seen = prog && (prog.correct + prog.incorrect) > 0
                  return (
                    <div key={cell} className={`kana-grid-cell ${
                      mastered ? 'border-jade/40 bg-jade/8' : seen ? 'border-blue-200 bg-blue-50/60' : ''
                    }`}>
                      <span className="japanese-text text-xl text-ink-100">{cell}</span>
                      <span className="text-ink-400 text-xs font-mono">{ROMAJI_MAP[cell]}</span>
                      {mastered && <span className="text-jade text-xs font-bold">✓</span>}
                    </div>
                  )
                }))}
              </div>
            </div>

            <div className="card bg-bg-primary border-border">
              <h3 className="text-ink-200 font-medium mb-2">Tips</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-ink-300">
                <p>• Aim for all 46 hiragana before starting katakana</p>
                <p>• し = "shi", ち = "chi", つ = "tsu", ふ = "fu"</p>
                <p>• Master = 5 correct answers for that character</p>
                <p>• After mastery, immersion will reinforce the rest</p>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'drill' && currentKana && (
          <motion.div key="drill" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} className="flex flex-col items-center">
            {/* Progress */}
            <div className="w-full max-w-md mb-6">
              <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                <span>{currentIndex + 1} / {drillSet.length}</span>
                <div className="flex gap-3">
                  <span className="text-jade">✓ {sessionStats.correct}</span>
                  <span className="text-sakura">✗ {sessionStats.wrong}</span>
                </div>
              </div>
              <div className="xp-bar">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-jade transition-all duration-500"
                  style={{ width: `${(currentIndex / drillSet.length) * 100}%` }} />
              </div>
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex}
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.18 }}
                className={`w-60 h-60 rounded-2xl border-2 flex flex-col items-center justify-center mb-6
                  shadow-card-md transition-all duration-300 ${
                  feedback === 'correct' ? 'border-jade/60 bg-jade/8 shadow-lg' :
                  feedback === 'wrong'   ? 'border-sakura/60 bg-sakura/8' :
                                          'border-border bg-white'
                }`}>
                <span className="japanese-text text-8xl text-ink-100 select-none">{currentKana.kana}</span>
                <span className="text-ink-400 text-sm mt-2 capitalize">{currentKana.type}</span>
                {showAnswer && (
                  <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-gold font-mono text-2xl font-bold mt-2">{currentKana.romaji}</motion.span>
                )}
                {feedback === 'correct' && (
                  <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-jade text-3xl mt-1">✓</motion.p>
                )}
                {feedback === 'wrong' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sakura text-sm mt-2 text-center">
                    Answer: <span className="font-mono font-bold">{currentKana.romaji}</span>
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Input */}
            <div className="w-full max-w-xs">
              <input ref={inputRef} type="text"
                className="input-field text-center text-xl font-mono tracking-widest mb-3"
                placeholder="romaji..." value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                disabled={feedback !== null} autoComplete="off" autoCapitalize="off" />
              <div className="flex gap-2 mb-2">
                <button onClick={() => setShowAnswer(true)} className="btn-ghost flex-1 text-sm" disabled={showAnswer || feedback !== null}>
                  Hint
                </button>
                <button onClick={iDontKnow} disabled={feedback !== null}
                  className="btn-secondary flex-1 text-sm disabled:opacity-40">
                  I don't know
                </button>
              </div>
              <button onClick={checkAnswer} disabled={!input.trim() || feedback !== null}
                className="btn-primary w-full disabled:opacity-40">
                Check
              </button>
            </div>
            <p className="text-ink-400 text-xs mt-4 text-center">
              <kbd className="bg-bg-secondary border border-border rounded px-1">↵</kbd> check &nbsp;·&nbsp;
              <kbd className="bg-bg-secondary border border-border rounded px-1">Esc</kbd> I don't know &nbsp;·&nbsp;
              5 correct = mastered
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
