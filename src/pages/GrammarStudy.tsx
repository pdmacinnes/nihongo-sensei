import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GRAMMAR_DATA, GrammarPoint } from '../lib/grammar-data'
import { speak, isTTSAvailable } from '../lib/tts'
import { useStore } from '../store'

type Mode = 'browse' | 'drill'
type DrillState = 'prompt' | 'checking' | 'revealed'

export default function GrammarStudy() {
  const [mode, setMode] = useState<Mode>('browse')
  const [levelFilter, setLevelFilter] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'all'>('N5')
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null)
  const [drillQueue, setDrillQueue] = useState<{ point: GrammarPoint; exIdx: number }[]>([])
  const [drillIdx, setDrillIdx] = useState(0)
  const [input, setInput] = useState('')
  const [drillState, setDrillState] = useState<DrillState>('prompt')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [sessionDone, setSessionDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addXP, logWrongAnswer } = useStore()
  const ttsAvailable = isTTSAvailable()

  const filtered = levelFilter === 'all' ? GRAMMAR_DATA : GRAMMAR_DATA.filter(g => g.level === levelFilter)

  const startDrill = useCallback(() => {
    const queue = filtered.flatMap(point =>
      point.examples.map((_, exIdx) => ({ point, exIdx }))
    ).sort(() => Math.random() - 0.5)
    setDrillQueue(queue)
    setDrillIdx(0)
    setInput('')
    setDrillState('prompt')
    setShowHint(false)
    setSessionStats({ correct: 0, wrong: 0 })
    setSessionDone(false)
    setMode('drill')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [filtered])

  const currentItem = drillQueue[drillIdx]
  const currentExample = currentItem ? currentItem.point.examples[currentItem.exIdx] : null

  const checkAnswer = useCallback(() => {
    if (!currentItem || !currentExample || !input.trim()) return
    const userInput = input.trim()
    const correct = userInput === currentExample.cloze ||
      userInput === currentExample.cloze.replace(/[。、！？]/g, '')
    setIsCorrect(correct)
    setDrillState('revealed')
    setSessionStats(s => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }))
    if (correct) {
      addXP(5)
    } else {
      logWrongAnswer({
        type: 'grammar',
        grammarPattern: currentItem.point.pattern,
        userAnswer: userInput,
        correctAnswer: currentExample.cloze,
        label: currentItem.point.pattern,
        english: currentItem.point.english,
      })
    }
  }, [currentItem, currentExample, input, addXP])

  const iDontKnow = useCallback(() => {
    if (!currentItem || !currentExample || drillState !== 'prompt') return
    setIsCorrect(false)
    setDrillState('revealed')
    setSessionStats(s => ({ ...s, wrong: s.wrong + 1 }))
    logWrongAnswer({
      type: 'grammar',
      grammarPattern: currentItem.point.pattern,
      userAnswer: '',
      correctAnswer: currentExample.cloze,
      label: currentItem.point.pattern,
      english: currentItem.point.english,
    })
  }, [currentItem, currentExample, drillState, logWrongAnswer])

  const nextCard = useCallback(() => {
    if (drillIdx + 1 >= drillQueue.length) {
      setSessionDone(true)
      return
    }
    setDrillIdx(i => i + 1)
    setInput('')
    setDrillState('prompt')
    setShowHint(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [drillIdx, drillQueue.length])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (mode !== 'drill') return
      if (drillState === 'prompt' && e.key === 'Enter') checkAnswer()
      if (drillState === 'prompt' && e.key === 'Escape') { e.preventDefault(); iDontKnow() }
      if (drillState === 'revealed' && (e.key === 'Enter' || e.key === ' ')) nextCard()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [mode, drillState, checkAnswer, nextCard, iDontKnow])

  // Build cloze sentence display
  function renderClozePrompt(jp: string, cloze: string, revealed: boolean) {
    const parts = jp.split(cloze)
    if (parts.length < 2) return jp
    return (
      <span>
        {parts[0]}
        <span className={`inline-block min-w-[60px] mx-1 px-2 py-0 rounded border-b-2 text-center transition-all duration-300 ${
          revealed
            ? isCorrect
              ? 'border-jade text-jade font-bold bg-jade/8'
              : 'border-sakura text-sakura font-bold bg-sakura/8'
            : 'border-sakura bg-sakura/5 text-transparent select-none'
        }`}>
          {cloze}
        </span>
        {parts.slice(1).join(cloze)}
      </span>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title"><span className="japanese-text text-sakura">文法</span> Grammar</h1>
          <p className="text-ink-400 text-sm mt-0.5">DoJG-style cloze deletion practice</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'browse' && (
            <>
              {(['N5', 'N4', 'N3', 'N2', 'N1', 'all'] as const).map(l => (
                <button key={l} onClick={() => setLevelFilter(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    levelFilter === l ? 'bg-sakura text-white shadow-sm' : 'btn-secondary'
                  }`}>
                  {l === 'all' ? 'All' : l}
                </button>
              ))}
              <button onClick={startDrill} className="btn-primary ml-2">▶ Drill</button>
            </>
          )}
          {mode === 'drill' && (
            <button onClick={() => setMode('browse')} className="btn-secondary">← Back</button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* BROWSE MODE */}
        {mode === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Selected point detail */}
            {selectedPoint && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="card mb-5 border-sakura/20 bg-sakura/4" style={{ background: 'rgba(201,75,75,0.03)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[selectedPoint.level] ?? 'tag-jade'}`}>{selectedPoint.level}</span>
                      <h2 className="text-ink-100 font-bold text-lg japanese-text">{selectedPoint.pattern}</h2>
                    </div>
                    <p className="text-ink-200 font-medium">{selectedPoint.english}</p>
                  </div>
                  <button onClick={() => setSelectedPoint(null)} className="btn-ghost text-sm">✕ Close</button>
                </div>
                <div className="sentence-card mb-4">
                  <p className="text-ink-200 text-sm leading-relaxed">{selectedPoint.explanation}</p>
                </div>
                <div className="space-y-2">
                  {selectedPoint.examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-border shadow-card">
                      <span className="w-6 h-6 rounded-full bg-sakura/10 text-sakura text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="japanese-text text-lg text-ink-100">{ex.jp}</p>
                          {ttsAvailable && (
                            <button onClick={() => speak(ex.jp)}
                              className="text-ink-400 hover:text-sakura transition-colors text-lg" title="Listen">
                              🔊
                            </button>
                          )}
                        </div>
                        <p className="text-ink-400 text-sm mt-0.5">{ex.en}</p>
                        <p className="text-xs mt-1">
                          <span className="text-ink-400">Grammar point: </span>
                          <span className="japanese-text text-sakura font-bold">{ex.cloze}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Grammar point grid */}
            <div className="space-y-2">
              {filtered.map(point => (
                <button key={point.id} onClick={() => setSelectedPoint(selectedPoint?.id === point.id ? null : point)}
                  className={`w-full card text-left hover:shadow-card-md transition-all duration-200 ${
                    selectedPoint?.id === point.id ? 'border-sakura/30 bg-sakura/4' : ''
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 ${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[point.level] ?? 'tag-jade'}`}>{point.level}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="japanese-text font-bold text-ink-100">{point.pattern}</span>
                        <span className="text-ink-400 text-sm truncate">{point.english}</span>
                      </div>
                      <p className="text-ink-400 text-xs mt-0.5 truncate">{point.explanation.slice(0, 80)}...</p>
                    </div>
                    <span className="text-ink-400 text-sm flex-shrink-0">
                      {selectedPoint?.id === point.id ? '▲' : '▼'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* DRILL MODE */}
        {mode === 'drill' && (
          <motion.div key="drill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {sessionDone ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">🎉</span>
                <h2 className="text-xl font-bold text-ink-100 mb-1">Drill Complete!</h2>
                <p className="text-ink-400 mb-6">{drillQueue.length} grammar exercises</p>
                <div className="flex gap-4 mb-8">
                  <div className="card border-jade/30 bg-jade/5 text-center px-8">
                    <p className="text-2xl font-bold text-jade">{sessionStats.correct}</p>
                    <p className="text-ink-400 text-xs">Correct</p>
                  </div>
                  <div className="card border-sakura/30 bg-sakura/5 text-center px-8">
                    <p className="text-2xl font-bold text-sakura">{sessionStats.wrong}</p>
                    <p className="text-ink-400 text-xs">Wrong</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setMode('browse')} className="btn-secondary">Browse</button>
                  <button onClick={startDrill} className="btn-primary">Drill Again</button>
                </div>
              </div>
            ) : currentItem && currentExample && (
              <div className="flex flex-col items-center">
                {/* Progress */}
                <div className="w-full max-w-lg mb-5">
                  <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                    <span>{drillIdx + 1} / {drillQueue.length}</span>
                    <div className="flex gap-3">
                      <span className="text-jade">✓ {sessionStats.correct}</span>
                      <span className="text-sakura">✗ {sessionStats.wrong}</span>
                    </div>
                  </div>
                  <div className="xp-bar">
                    <div className="h-full rounded-full bg-gradient-to-r from-sakura to-gold transition-all duration-500"
                      style={{ width: `${(drillIdx / drillQueue.length) * 100}%` }} />
                  </div>
                </div>

                <div className="w-full max-w-lg">
                  <AnimatePresence mode="wait">
                    <motion.div key={drillIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                      {/* Grammar label */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[currentItem.point.level] ?? 'tag-jade'}`}>{currentItem.point.level}</span>
                        <span className="text-ink-200 font-medium text-sm japanese-text">{currentItem.point.pattern}</span>
                        <span className="text-ink-400 text-sm">— {currentItem.point.english}</span>
                      </div>

                      {/* Sentence card */}
                      <div className={`rounded-2xl border-2 p-6 mb-4 shadow-card transition-all duration-300 ${
                        drillState === 'revealed'
                          ? isCorrect ? 'border-jade/40 bg-jade/5' : 'border-sakura/40 bg-sakura/5'
                          : 'border-border bg-white'
                      }`}>
                        {/* English translation (context) */}
                        <p className="text-ink-400 text-sm mb-4 italic">{currentExample.en}</p>

                        {/* Cloze sentence */}
                        <div className="flex items-center justify-between">
                          <p className="japanese-text text-2xl leading-loose text-ink-100">
                            {renderClozePrompt(currentExample.jp, currentExample.cloze, drillState === 'revealed')}
                          </p>
                          {ttsAvailable && drillState === 'revealed' && (
                            <button onClick={() => speak(currentExample.jp)}
                              className="text-2xl text-ink-400 hover:text-sakura ml-3 flex-shrink-0" title="Listen">
                              🔊
                            </button>
                          )}
                        </div>

                        {drillState === 'revealed' && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-border">
                            <p className={`text-sm font-medium ${isCorrect ? 'text-jade' : 'text-sakura'}`}>
                              {isCorrect ? '✓ Correct!' : `✗ Answer: `}
                              {!isCorrect && <span className="japanese-text font-bold">{currentExample.cloze}</span>}
                            </p>
                            <p className="text-ink-300 text-xs mt-1">{currentItem.point.hint}</p>
                          </motion.div>
                        )}
                      </div>

                      {drillState === 'prompt' && (
                        <>
                          <input ref={inputRef} type="text"
                            className="input-field text-center text-lg japanese-text mb-3"
                            placeholder="Type the grammar pattern..."
                            value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                            autoComplete="off" />
                          <div className="flex gap-2 mb-2">
                            <button onClick={() => setShowHint(true)} className="btn-ghost flex-1 text-sm" disabled={showHint}>
                              Hint
                            </button>
                            <button onClick={iDontKnow} className="btn-secondary flex-1 text-sm">
                              I don't know
                            </button>
                          </div>
                          <button onClick={checkAnswer} disabled={!input.trim()} className="btn-primary w-full disabled:opacity-40">
                            Check
                          </button>
                          <p className="text-ink-400 text-xs text-center mt-3">
                            <kbd className="bg-bg-secondary border border-border rounded px-1">↵</kbd> check &nbsp;·&nbsp;
                            <kbd className="bg-bg-secondary border border-border rounded px-1">Esc</kbd> I don't know &nbsp;·&nbsp;
                            <kbd className="bg-bg-secondary border border-border rounded px-1">Enter</kbd>/<kbd className="bg-bg-secondary border border-border rounded px-1">Space</kbd> next
                          </p>
                          {showHint && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-gold text-sm text-center mt-2">{currentItem.point.hint}</motion.p>
                          )}
                        </>
                      )}

                      {drillState === 'revealed' && (
                        <button onClick={nextCard} className="btn-primary w-full mt-2">
                          Next → <span className="text-xs opacity-70 ml-1">(Enter or Space)</span>
                        </button>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
