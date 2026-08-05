import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Anthropic from '@anthropic-ai/sdk'
import toast from 'react-hot-toast'
import { useStore } from '../store'
import { VOCAB_DATA } from '../lib/vocab-data'
import { SRSRating, getMaturityLabel, getMaturityColor } from '../lib/srs'
import { speak, isTTSAvailable } from '../lib/tts'

type Tab = 'review' | 'listen' | 'leeches' | 'quiz' | 'wordbank' | 'browse'

const FREQUENCY_STYLES: Record<string, string> = {
  'very common': 'bg-jade/10 text-jade border-jade/25',
  'common': 'bg-blue-50 text-blue-600 border-blue-200',
  'uncommon': 'bg-gold/10 text-gold border-gold/25',
  'rare': 'bg-sakura/10 text-sakura border-sakura/25',
}

// Split kana reading into individual morae (handles small kana: ゃゅょャュョっッ)
function splitMorae(reading: string): string[] {
  const morae: string[] = []
  const small = new Set(['ゃ','ゅ','ょ','ャ','ュ','ョ','っ','ッ','ぁ','ぃ','ぅ','ぇ','ぉ'])
  for (let i = 0; i < reading.length; i++) {
    if (i + 1 < reading.length && small.has(reading[i + 1])) {
      morae.push(reading[i] + reading[i + 1]); i++
    } else {
      morae.push(reading[i])
    }
  }
  return morae
}

function PitchAccent({ reading, accent }: { reading: string; accent: number }) {
  const morae = splitMorae(reading)
  // accent=0: heiban (L then all H, no drop); accent=n: drop after nth mora
  const isHigh = (i: number) => accent === 0 ? i > 0 : i >= 1 && i < accent
  const hasDropAfter = (i: number) => accent > 0 && i === accent - 1
  const accentLabel = accent === 0 ? 'Heiban ⓪' : accent === 1 ? 'Atamadaka ①' : `Drop after ${accent} ⓪`.replace('⓪', `${'①②③④⑤⑥⑦⑧⑨'[accent - 1] || accent}`)

  return (
    <div className="flex flex-col items-center gap-1 mt-2">
      <div className="flex items-end gap-0.5">
        {morae.map((m, i) => (
          <div key={i} className="relative flex flex-col items-center">
            <div className={`h-1 w-full rounded-full mb-1 ${isHigh(i) ? 'bg-sakura' : 'bg-ink-400'}`} />
            {hasDropAfter(i) && (
              <div className="absolute top-0.5 -right-1 w-2 h-2 border-r-2 border-b-2 border-sakura rotate-45 translate-x-0.5" />
            )}
            <span className={`japanese-text text-xs font-medium ${isHigh(i) ? 'text-sakura' : 'text-ink-400'}`}>{m}</span>
          </div>
        ))}
      </div>
      <span className="text-[10px] text-ink-400">{accentLabel}</span>
    </div>
  )
}

function SentenceCard({
  word, flipped, onFlip, ttsAvailable, showFurigana, aiExample, aiExampleLoading, onNewExample,
}: {
  word: typeof VOCAB_DATA[0]
  flipped: boolean
  onFlip: () => void
  ttsAvailable: boolean
  showFurigana: boolean
  aiExample?: { jp: string; en: string } | null
  aiExampleLoading?: boolean
  onNewExample?: () => void
}) {
  const clozeSentence = word.sentenceJp.replace(
    new RegExp(word.japanese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    '＿＿＿'
  )

  return (
    <motion.div
      onClick={() => !flipped && onFlip()}
      className={`w-full min-h-56 rounded-2xl border-2 flex flex-col items-center justify-center p-8 cursor-pointer
        transition-all duration-300 shadow-card ${
        flipped
          ? 'border-jade/40 bg-white shadow-card-md'
          : 'border-border bg-white hover:border-sakura/30 hover:shadow-card-md'
      }`}
    >
      {!flipped ? (
        <div className="text-center w-full">
          <div className="sentence-card mb-5 text-left">
            <p className="japanese-text text-xl leading-loose text-ink-100">{clozeSentence}</p>
            <p className="text-ink-400 text-sm mt-1">{word.sentenceEn.replace(word.english, '___')}</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="japanese-text text-4xl font-bold text-ink-100">{word.japanese}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            {word.pos && <span className="tag bg-bg-secondary text-ink-400 border-border">{word.pos}</span>}
            <span className={`${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[word.level] ?? 'tag-jade'}`}>{word.level}</span>
          </div>
          <p className="text-ink-400 text-sm mt-5">What does this mean in context? Click to reveal.</p>
        </div>
      ) : (
        <div className="text-center w-full">
          <div className="sentence-card mb-4 text-left bg-jade/5 border-jade/20">
            <div className="flex items-start justify-between gap-2">
              <p className="japanese-text text-xl leading-loose text-ink-100">{word.sentenceJp}</p>
              {ttsAvailable && (
                <button onClick={e => { e.stopPropagation(); speak(word.sentenceJp) }}
                  className="text-xl text-ink-400 hover:text-sakura transition-colors flex-shrink-0 mt-1" title="Listen">
                  🔊
                </button>
              )}
            </div>
            <p className="text-ink-300 text-sm mt-1">{word.sentenceEn}</p>
          </div>
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="japanese-text text-4xl font-bold text-ink-100">{word.japanese}</span>
            {showFurigana && <span className="text-ink-400 text-lg">{word.reading}</span>}
            {ttsAvailable && (
              <button onClick={e => { e.stopPropagation(); speak(word.japanese) }}
                className="text-lg text-ink-400 hover:text-sakura transition-colors" title="Listen to word">
                🔊
              </button>
            )}
          </div>
          <p className="text-2xl font-semibold text-ink-100 mb-3">{word.english}</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {word.pos && <span className="tag bg-bg-secondary text-ink-400 border-border">{word.pos}</span>}
            {word.frequency && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${FREQUENCY_STYLES[word.frequency] ?? 'bg-bg-secondary text-ink-400 border-border'}`}>
                {word.frequency}
              </span>
            )}
            {word.contextNote && (
              <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-gold/10 text-gold border-gold/25" title={word.contextNote}>
                ⚠ Context-dependent
              </span>
            )}
          </div>
          {word.contextNote && (
            <p className="text-ink-400 text-xs mt-1.5">{word.contextNote}</p>
          )}
          {word.pitchAccent !== undefined && (
            <PitchAccent reading={word.reading} accent={word.pitchAccent} />
          )}
          {onNewExample && (
            <div className="mt-4 pt-3 border-t border-border w-full text-left">
              {aiExample ? (
                <div className="sentence-card text-left bg-sakura/4 border-sakura/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="japanese-text text-base leading-loose text-ink-100">{aiExample.jp}</p>
                      <p className="text-ink-400 text-xs mt-1">{aiExample.en}</p>
                    </div>
                    {ttsAvailable && (
                      <button onClick={e => { e.stopPropagation(); speak(aiExample.jp) }}
                        className="text-ink-400 hover:text-sakura transition-colors flex-shrink-0">🔊</button>
                    )}
                  </div>
                </div>
              ) : null}
              <button
                onClick={e => { e.stopPropagation(); onNewExample() }}
                disabled={aiExampleLoading}
                className="mt-2 text-xs text-sakura hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                {aiExampleLoading ? '⏳ Generating…' : '✨ New AI example sentence'}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function VocabReview() {
  const [tab, setTab] = useState<Tab>('review')

  // Review session
  const [flipped, setFlipped] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
  const lastRatingRef = useRef<SRSRating | null>(null)

  // AI example sentences
  const [aiExample, setAiExample] = useState<{ jp: string; en: string } | null>(null)
  const [aiExampleLoading, setAiExampleLoading] = useState(false)

  // Undo
  const [showUndo, setShowUndo] = useState(false)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Leeches
  const [leechIdx, setLeechIdx] = useState(0)
  const [leechFlipped, setLeechFlipped] = useState(false)
  const [leechDone, setLeechDone] = useState(false)

  // Listening drill
  const [listenIdx, setListenIdx] = useState(0)
  const [listenInput, setListenInput] = useState('')
  const [listenResult, setListenResult] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const listenInputRef = useRef<HTMLInputElement>(null)

  // Word bank — default to user's target level
  const [wbLevel, setWbLevel] = useState<string>(() => useStore.getState().jlptLevel ?? 'N5')
  const [wbSearch, setWbSearch] = useState('')

  // Multiple choice quiz
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })

  // Browse / custom vocab
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [browseSearch, setBrowseSearch] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customJp, setCustomJp] = useState('')
  const [customReading, setCustomReading] = useState('')
  const [customEnglish, setCustomEnglish] = useState('')
  const [customSentenceJp, setCustomSentenceJp] = useState('')
  const [customSentenceEn, setCustomSentenceEn] = useState('')

  const {
    vocabCards, reviewVocabCard, addVocabCard, getDueCards, dailyNewCardLimit,
    showFurigana, setShowFurigana, getLeeches, undoLastVocabRating, lastVocabCardSnapshot,
    customWords, addCustomWord, removeCustomWord, jlptLevel,
  } = useStore()

  const dueCards = getDueCards()
  const leeches = getLeeches()
  const allWords = [...VOCAB_DATA, ...customWords]

  const currentSRSCard = dueCards[currentIdx]
  const currentWord = currentSRSCard ? allWords.find(w => w.id === currentSRSCard.wordId) : null

  const leechCard = leeches[leechIdx]
  const leechWord = leechCard ? allWords.find(w => w.id === leechCard.wordId) : null

  const listenCard = dueCards[listenIdx]
  const listenWord = listenCard ? allWords.find(w => w.id === listenCard.wordId) : null

  const ttsAvailable = isTTSAvailable()

  // Reset AI example when card changes
  useEffect(() => {
    setAiExample(null)
    setAiExampleLoading(false)
  }, [currentIdx])

  // Auto-TTS on flip
  useEffect(() => {
    if (flipped && currentWord && ttsAvailable) {
      speak(currentWord.sentenceJp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped])

  // Auto-play listening drill
  useEffect(() => {
    if (tab === 'listen' && listenWord && ttsAvailable) {
      speak(listenWord.japanese)
      setListenInput('')
      setListenResult('idle')
      setTimeout(() => listenInputRef.current?.focus(), 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, listenIdx])

  const handleRate = useCallback((rating: SRSRating, source: 'review' | 'leeches' = 'review') => {
    const card = source === 'leeches' ? leeches[leechIdx] : dueCards[currentIdx]
    if (!card) return

    reviewVocabCard(card.id, rating)
    lastRatingRef.current = rating

    if (source === 'review') {
      setSessionStats(s => ({ ...s, [rating]: s[rating] + 1 }))
      setFlipped(false)
      // Show undo for 4 seconds
      setShowUndo(true)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setShowUndo(false), 4000)
      if (currentIdx + 1 >= dueCards.length) {
        setSessionDone(true)
        setShowUndo(false)
      } else {
        setCurrentIdx(i => i + 1)
      }
    } else {
      setLeechFlipped(false)
      if (leechIdx + 1 >= leeches.length) {
        setLeechDone(true)
      } else {
        setLeechIdx(i => i + 1)
      }
    }
  }, [currentIdx, dueCards, leeches, leechIdx, reviewVocabCard])

  const handleUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoLastVocabRating()
    if (lastRatingRef.current) {
      setSessionStats(s => ({ ...s, [lastRatingRef.current!]: Math.max(0, s[lastRatingRef.current!] - 1) }))
      lastRatingRef.current = null
    }
    setCurrentIdx(i => Math.max(0, i - 1))
    setFlipped(false)
    setShowUndo(false)
    setSessionDone(false)
  }, [undoLastVocabRating])

  const resetSession = () => {
    setCurrentIdx(0)
    setFlipped(false)
    setSessionDone(false)
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 })
    setAiExample(null)
  }

  const fetchAiExample = useCallback(async (word: typeof VOCAB_DATA[0]) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string
    if (!apiKey) { toast.error('API key not set'); return }
    setAiExampleLoading(true)
    setAiExample(null)
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const res = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{
          role: 'user',
          content: `Write one natural Japanese sentence using the word "${word.japanese}" (${word.english}) appropriate for JLPT ${word.level}. Reply with ONLY: the Japanese sentence, then "||", then the English translation. No other text.`,
        }],
      })
      const text = (res.content[0] as { text: string }).text.trim()
      const [jp, en] = text.split('||').map(s => s.trim())
      if (jp && en) setAiExample({ jp, en })
    } catch { toast.error('Failed to generate example') }
    finally { setAiExampleLoading(false) }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (tab === 'review' && !sessionDone && currentSRSCard) {
        if (!flipped) {
          if (e.key === ' ') { e.preventDefault(); setFlipped(true) }
        } else {
          if (e.key === '1') handleRate('again')
          if (e.key === '2') handleRate('hard')
          if (e.key === '3') handleRate('good')
          if (e.key === '4') handleRate('easy')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tab, flipped, sessionDone, currentSRSCard, handleRate])

  const isNewCard = currentSRSCard?.state === 'new'
  const isLearning = currentSRSCard?.state === 'learning' || currentSRSCard?.state === 'relearning'

  const filteredWords = allWords.filter(w => {
    const q = browseSearch.toLowerCase()
    const matchSearch = !q || w.japanese.includes(q) || w.reading.includes(q) || w.english.toLowerCase().includes(q)
    return (filterLevel === 'all' || w.level === filterLevel) &&
      (filterCategory === 'all' || w.category === filterCategory) &&
      matchSearch
  })
  const categories = [...new Set(allWords.map(w => w.category))].sort()

  const handleAddCustomWord = () => {
    if (!customJp.trim() || !customEnglish.trim()) return
    addCustomWord({
      japanese: customJp.trim(),
      reading: customReading.trim() || customJp.trim(),
      english: customEnglish.trim(),
      sentenceJp: customSentenceJp.trim() || `${customJp.trim()}。`,
      sentenceEn: customSentenceEn.trim() || customEnglish.trim(),
      level: jlptLevel ?? 'N5',
      category: 'custom',
    })
    setCustomJp(''); setCustomReading(''); setCustomEnglish('')
    setCustomSentenceJp(''); setCustomSentenceEn('')
    setShowCustomForm(false)
  }

  const ratingButtons = [
    { rating: 'again' as SRSRating, label: 'Again', key: '1', sub: '< 1d', style: 'border-sakura/30 text-sakura hover:bg-sakura/8 bg-white' },
    { rating: 'hard' as SRSRating, label: 'Hard', key: '2', sub: '~1d', style: 'border-orange-200 text-orange-500 hover:bg-orange-50 bg-white' },
    { rating: 'good' as SRSRating, label: 'Good', key: '3', sub: `~${currentSRSCard?.interval ?? 1}d`, style: 'border-blue-200 text-blue-600 hover:bg-blue-50 bg-white' },
    { rating: 'easy' as SRSRating, label: 'Easy', key: '4', sub: `~${Math.max(4, Math.round((currentSRSCard?.interval ?? 1) * 1.3))}d`, style: 'border-jade/30 text-jade hover:bg-jade/8 bg-white' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title">
            <span className="japanese-text text-sakura">単語</span> Vocabulary
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">
            Sentence-first spaced repetition · {dailyNewCardLimit} new cards/day
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => setShowFurigana(!showFurigana)} className="btn-ghost text-xs">
            {showFurigana ? 'Hide Furigana' : 'Show Furigana'}
          </button>
          <span className="tag-gold">{dueCards.filter(c => c.state !== 'new').length} reviews</span>
          <span className="tag-sakura">{dueCards.filter(c => c.state === 'new').length} new</span>
          {leeches.length > 0 && <span className="tag bg-orange-50 text-orange-500 border-orange-200">🐛 {leeches.length}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mobile-tabs flex gap-2 mb-6 pb-1">
        {[
          { id: 'review' as Tab, label: 'Study Cards', count: dueCards.length },
          { id: 'listen' as Tab, label: 'Listening' },
          { id: 'leeches' as Tab, label: '🐛 Leeches', count: leeches.length },
          { id: 'quiz' as Tab, label: '🎯 Quiz' },
          { id: 'wordbank' as Tab, label: '📖 Word Bank' },
          { id: 'browse' as Tab, label: 'Browse All' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-sakura text-white shadow-sakura' : 'btn-secondary'
            }`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-white/25' : 'bg-gold/15 text-gold'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── REVIEW TAB ── */}
        {tab === 'review' && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {dueCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🎉</span>
                <h2 className="text-2xl font-bold text-ink-100 mb-2">All caught up!</h2>
                <p className="text-ink-400 mb-6">No cards due right now. Come back later.</p>
                <button onClick={() => setTab('browse')} className="btn-secondary">Browse vocabulary →</button>
              </div>
            ) : sessionDone ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                  className="text-6xl mb-4">✨</motion.span>
                <h2 className="text-2xl font-bold text-ink-100 mb-1">Session Complete!</h2>
                <p className="text-ink-400 mb-6 text-sm">Great work — your reviews are done for now</p>

                {/* Rating breakdown */}
                <div className="grid grid-cols-4 gap-3 mb-5 w-full">
                  {[
                    { label: 'Again', count: sessionStats.again, color: 'text-sakura', bg: 'bg-sakura/8 border-sakura/20' },
                    { label: 'Hard', count: sessionStats.hard, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
                    { label: 'Good', count: sessionStats.good, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                    { label: 'Easy', count: sessionStats.easy, color: 'text-jade', bg: 'bg-jade/8 border-jade/20' },
                  ].map(s => (
                    <div key={s.label} className={`card border-2 ${s.bg} text-center py-3`}>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                      <p className="text-ink-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3 mb-7 w-full">
                  {(() => {
                    const total = Object.values(sessionStats).reduce((a, b) => a + b, 0)
                    const correct = sessionStats.hard + sessionStats.good + sessionStats.easy
                    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
                    const xpEarned = sessionStats.again * 1 + sessionStats.hard * 3 + sessionStats.good * 5 + sessionStats.easy * 8
                    return [
                      { label: 'Cards reviewed', value: total, color: 'text-ink-100' },
                      { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 80 ? 'text-jade' : accuracy >= 60 ? 'text-gold' : 'text-sakura' },
                      { label: 'XP earned', value: `+${xpEarned}`, color: 'text-gold' },
                    ].map(s => (
                      <div key={s.label} className="card text-center py-3">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-ink-400 text-xs">{s.label}</p>
                      </div>
                    ))
                  })()}
                </div>

                <button onClick={resetSession} className="btn-secondary w-full max-w-xs">Review again</button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Progress */}
                <div className="w-full max-w-lg mb-4">
                  <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{currentIdx + 1} / {dueCards.length}</span>
                      {isNewCard && <span className="tag-sakura">New</span>}
                      {isLearning && <span className="tag bg-blue-50 text-blue-600 border-blue-200">Learning</span>}
                    </div>
                    <span>{dueCards.length - currentIdx - 1} remaining</span>
                  </div>
                  <div className="xp-bar">
                    <div className="h-full rounded-full bg-gradient-to-r from-sakura to-sakura-bright transition-all duration-500"
                      style={{ width: `${(currentIdx / dueCards.length) * 100}%` }} />
                  </div>
                </div>

                {currentWord && currentSRSCard && (
                  <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait">
                      <motion.div key={currentIdx + (flipped ? '-f' : '')}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                        <SentenceCard word={currentWord} flipped={flipped}
                          onFlip={() => setFlipped(true)} ttsAvailable={ttsAvailable}
                          showFurigana={showFurigana}
                          aiExample={aiExample} aiExampleLoading={aiExampleLoading}
                          onNewExample={flipped ? () => fetchAiExample(currentWord) : undefined} />
                      </motion.div>
                    </AnimatePresence>

                    {/* Rating buttons */}
                    <AnimatePresence>
                      {flipped && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-4 gap-2 mt-4">
                          {ratingButtons.map(btn => (
                            <button key={btn.rating} onClick={() => handleRate(btn.rating)}
                              className={`py-3 rounded-xl border-2 transition-all duration-150 active:scale-95 ${btn.style}`}>
                              <p className="font-semibold text-sm">{btn.label}</p>
                              <p className="text-xs opacity-60">{btn.sub}</p>
                              <p className="text-[10px] opacity-40 mt-0.5">({btn.key})</p>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Undo button */}
                    <AnimatePresence>
                      {showUndo && lastVocabCardSnapshot && (
                        <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }} onClick={handleUndo}
                          className="w-full mt-2 py-2 rounded-xl border border-border text-ink-400 text-sm
                                     hover:border-sakura/30 hover:text-sakura transition-all">
                          ↩ Undo last rating
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {!flipped && (
                      <div className="mt-3 text-center">
                        <p className="text-ink-400 text-xs">
                          Think about the meaning, then click the card to reveal &nbsp;·&nbsp; <kbd className="bg-bg-secondary border border-border rounded px-1">Space</kbd> to flip
                        </p>
                        {isLearning && currentSRSCard.stepIndex !== undefined && (
                          <p className="text-blue-500 text-xs mt-1">
                            Learning step {currentSRSCard.stepIndex + 1} — keep going!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── LISTENING DRILL TAB ── */}
        {tab === 'listen' && (
          <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {dueCards.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <span className="text-4xl mb-3">👂</span>
                <p className="text-ink-200 font-medium">No cards to drill yet.</p>
                <p className="text-ink-400 text-sm mt-1">Add vocabulary cards first, then come back.</p>
              </div>
            ) : listenIdx >= dueCards.length ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl mb-4">👂</span>
                <h2 className="text-xl font-bold text-ink-100 mb-1">Listening session done!</h2>
                <button onClick={() => setListenIdx(0)} className="btn-primary mt-4">Start again</button>
              </div>
            ) : listenWord && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg mb-5">
                  <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                    <span>{listenIdx + 1} / {dueCards.length}</span>
                    <span>{dueCards.length - listenIdx - 1} remaining</span>
                  </div>
                  <div className="xp-bar">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-jade transition-all duration-500"
                      style={{ width: `${(listenIdx / dueCards.length) * 100}%` }} />
                  </div>
                </div>

                <div className="w-full max-w-lg">
                  <div className="card text-center mb-4">
                    <p className="text-ink-400 text-sm mb-4">Listen and type what you hear in Japanese</p>
                    <p className="text-ink-300 text-sm italic mb-5">"{listenWord.english}"</p>

                    <button onClick={() => speak(listenWord.japanese)}
                      className="w-16 h-16 rounded-full bg-sakura/10 border-2 border-sakura/30
                                 hover:bg-sakura/20 transition-all text-3xl mx-auto mb-4 flex items-center justify-center"
                      title="Play again">
                      🔊
                    </button>

                    {listenResult === 'idle' ? (
                      <>
                        <input ref={listenInputRef} type="text"
                          className="input-field text-center text-lg japanese-text mb-3"
                          placeholder="Type in Japanese..."
                          value={listenInput} onChange={e => setListenInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && listenInput.trim()) {
                              const correct = listenInput.trim() === listenWord.japanese ||
                                listenInput.trim() === listenWord.reading
                              setListenResult(correct ? 'correct' : 'wrong')
                            }
                          }}
                          autoComplete="off" />
                        <button onClick={() => {
                          const correct = listenInput.trim() === listenWord.japanese ||
                            listenInput.trim() === listenWord.reading
                          setListenResult(correct ? 'correct' : 'wrong')
                        }} disabled={!listenInput.trim()} className="btn-primary w-full disabled:opacity-40">
                          Check ↵
                        </button>
                      </>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                        <div className={`p-4 rounded-xl border-2 mb-4 ${
                          listenResult === 'correct'
                            ? 'border-jade/40 bg-jade/5'
                            : 'border-sakura/40 bg-sakura/5'
                        }`}>
                          <p className={`font-bold text-lg ${listenResult === 'correct' ? 'text-jade' : 'text-sakura'}`}>
                            {listenResult === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
                          </p>
                          <p className="japanese-text text-2xl font-bold text-ink-100 mt-1">{listenWord.japanese}</p>
                          {showFurigana && <p className="text-ink-400 text-sm">{listenWord.reading}</p>}
                          <p className="text-ink-300 text-sm mt-1">{listenWord.english}</p>
                        </div>
                        <button onClick={() => {
                          if (listenIdx + 1 >= dueCards.length) setListenIdx(dueCards.length)
                          else setListenIdx(i => i + 1)
                        }} className="btn-primary w-full">
                          Next →
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── LEECHES TAB ── */}
        {tab === 'leeches' && (
          <motion.div key="leeches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {leeches.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <span className="text-5xl mb-4">🌟</span>
                <h2 className="text-xl font-bold text-ink-100 mb-2">No leeches!</h2>
                <p className="text-ink-400 text-sm">All your cards are in good shape. Keep it up!</p>
              </div>
            ) : leechDone ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl mb-4">✅</span>
                <h2 className="text-xl font-bold text-ink-100 mb-1">Leech drill complete!</h2>
                <p className="text-ink-400 mb-4">Keep drilling these until they stick.</p>
                <button onClick={() => { setLeechIdx(0); setLeechDone(false) }} className="btn-primary">
                  Drill again
                </button>
              </div>
            ) : leechWord && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg mb-4">
                  <div className="flex items-center justify-between text-xs text-ink-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      🐛 Leeches — {leechIdx + 1} / {leeches.length}
                      <span className="tag bg-orange-50 text-orange-500 border-orange-200 ml-1">
                        {leechCard.lapses} failures
                      </span>
                    </span>
                    <span>{leeches.length - leechIdx - 1} remaining</span>
                  </div>
                  <div className="xp-bar">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-sakura transition-all duration-500"
                      style={{ width: `${(leechIdx / leeches.length) * 100}%` }} />
                  </div>
                </div>

                <div className="w-full max-w-lg">
                  <AnimatePresence mode="wait">
                    <motion.div key={leechIdx + (leechFlipped ? '-f' : '')}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                      <SentenceCard word={leechWord} flipped={leechFlipped}
                        onFlip={() => setLeechFlipped(true)} ttsAvailable={ttsAvailable}
                        showFurigana={showFurigana} />
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {leechFlipped && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-4 gap-2 mt-4">
                        {[
                          { rating: 'again' as SRSRating, label: 'Again', style: 'border-sakura/30 text-sakura hover:bg-sakura/8 bg-white' },
                          { rating: 'hard' as SRSRating, label: 'Hard', style: 'border-orange-200 text-orange-500 hover:bg-orange-50 bg-white' },
                          { rating: 'good' as SRSRating, label: 'Good', style: 'border-blue-200 text-blue-600 hover:bg-blue-50 bg-white' },
                          { rating: 'easy' as SRSRating, label: 'Easy', style: 'border-jade/30 text-jade hover:bg-jade/8 bg-white' },
                        ].map(btn => (
                          <button key={btn.rating} onClick={() => handleRate(btn.rating, 'leeches')}
                            className={`py-3 rounded-xl border-2 transition-all duration-150 active:scale-95 ${btn.style}`}>
                            <p className="font-semibold text-sm">{btn.label}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── QUIZ TAB ── */}
        {tab === 'quiz' && (() => {
          const quizPool = allWords.filter(w => vocabCards.some(c => c.wordId === w.id))
          if (quizPool.length < 4) return (
            <motion.div key="quiz-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 text-center">
              <span className="text-5xl mb-4">📚</span>
              <h2 className="text-xl font-bold text-ink-100 mb-2">Need more words first</h2>
              <p className="text-ink-400 text-sm mb-4">Add at least 4 cards to your deck to use quiz mode.</p>
              <button onClick={() => setTab('browse')} className="btn-secondary">Browse vocabulary →</button>
            </motion.div>
          )
          const currentQuizWord = quizPool[quizIdx % quizPool.length]
          const distractors = quizPool.filter(w => w.id !== currentQuizWord.id)
          const shuffledDistractors: typeof quizPool = []
          const distCopy = [...distractors]
          for (let i = distCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distCopy[i], distCopy[j]] = [distCopy[j], distCopy[i]]
          }
          shuffledDistractors.push(...distCopy.slice(0, 3))
          const options = [...shuffledDistractors, currentQuizWord]
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]]
          }
          const correctIdx = options.findIndex(o => o.id === currentQuizWord.id)

          const handleQuizAnswer = (idx: number) => {
            if (quizAnswered !== null) return
            setQuizAnswered(idx)
            const correct = idx === correctIdx
            setQuizScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
            if (correct) {
              useStore.getState().addXP(3)
            } else {
              useStore.getState().logWrongAnswer({ type: 'vocab', wordId: currentQuizWord.id, label: currentQuizWord.japanese, reading: currentQuizWord.reading, english: currentQuizWord.english })
            }
            setTimeout(() => {
              setQuizAnswered(null)
              setQuizIdx(i => i + 1)
            }, 1200)
          }

          return (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-ink-400 text-sm">Question {(quizIdx % quizPool.length) + 1} of {quizPool.length}</span>
                  {quizScore.total > 0 && (
                    <span className="tag-jade text-xs">{quizScore.correct}/{quizScore.total} correct</span>
                  )}
                </div>
                <button onClick={() => setQuizScore({ correct: 0, total: 0 })} className="btn-ghost text-xs text-ink-400">Reset score</button>
              </div>
              <div className="card text-center mb-6 py-10">
                <p className="text-ink-400 text-sm mb-2">What does this mean?</p>
                <p className="japanese-text text-5xl font-bold text-ink-100 mb-2">{currentQuizWord.japanese}</p>
                <p className="text-ink-400 text-lg">{currentQuizWord.reading}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt, i) => {
                  const isCorrect = i === correctIdx
                  const isSelected = i === quizAnswered
                  let style = 'border-border bg-white hover:border-sakura/30 hover:bg-sakura/5 text-ink-100'
                  if (quizAnswered !== null) {
                    if (isCorrect) style = 'border-jade bg-jade/10 text-jade'
                    else if (isSelected) style = 'border-sakura bg-sakura/10 text-sakura'
                    else style = 'border-border bg-white text-ink-400 opacity-50'
                  }
                  return (
                    <button key={opt.id} onClick={() => handleQuizAnswer(i)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-98 ${style}`}>
                      <p className="font-semibold">{opt.english}</p>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )
        })()}

        {/* ── WORD BANK TAB ── */}
        {tab === 'wordbank' && (() => {
          const inDeckIds = new Set(vocabCards.map(c => c.wordId))
          const q = wbSearch.toLowerCase()
          const bankWords = VOCAB_DATA.filter(w =>
            !inDeckIds.has(w.id) &&
            (wbLevel === 'all' || w.level === wbLevel) &&
            (!q || w.japanese.includes(q) || w.reading.includes(q) || w.english.toLowerCase().includes(q))
          )
          return (
            <motion.div key="wordbank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-3 mb-4 flex-wrap items-center">
                <input type="text" placeholder="Search…" value={wbSearch} onChange={e => setWbSearch(e.target.value)}
                  className="input-field py-2 text-sm flex-1 min-w-32" />
                {(['N5', 'N4', 'N3', 'N2', 'N1', 'all'] as const).map(l => (
                  <button key={l} onClick={() => setWbLevel(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${wbLevel === l ? 'bg-sakura text-white' : 'btn-secondary'}`}>
                    {l === 'all' ? 'All' : l}
                  </button>
                ))}
                <span className="text-ink-400 text-sm">{bankWords.length} words</span>
                {bankWords.length > 0 && (
                  <button onClick={() => bankWords.slice(0, 10).forEach(w => addVocabCard(w.id))}
                    className="btn-secondary text-sm text-jade border-jade/30 hover:bg-jade/8">
                    + Add top 10
                  </button>
                )}
              </div>
              {bankWords.length === 0 ? (
                <div className="text-center py-16 text-ink-400">
                  <span className="text-4xl block mb-3">🎉</span>
                  <p className="font-semibold">All {wbLevel} words are in your deck!</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                  {bankWords.map(w => (
                    <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-sakura/20 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="japanese-text font-bold text-ink-100">{w.japanese}</span>
                          <span className="text-ink-400 text-xs">{w.reading}</span>
                          <span className="text-ink-300 text-xs">— {w.english}</span>
                        </div>
                        <p className="text-ink-400 text-xs mt-0.5 truncate">{w.sentenceJp}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs ${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[w.level] ?? 'tag-jade'}`}>{w.level}</span>
                        <button onClick={() => addVocabCard(w.id)}
                          className="text-jade text-sm font-bold hover:bg-jade/10 rounded-lg px-2 py-1 transition-all">
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })()}

        {/* ── BROWSE TAB ── */}
        {tab === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap items-center">
              <input
                type="text"
                placeholder="Search words, readings, meanings…"
                value={browseSearch}
                onChange={e => setBrowseSearch(e.target.value)}
                className="input-field py-2 text-sm flex-1 min-w-40"
              />
              <select className="input-field w-auto py-2 text-sm" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="all">All Levels</option>
                {['N5', 'N4', 'N3', 'N2', 'N1'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="input-field w-auto py-2 text-sm capitalize" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
              <span className="text-ink-400 text-sm">{filteredWords.length} words</span>
              <button onClick={() => setShowCustomForm(s => !s)} className="btn-secondary text-sm">
                {showCustomForm ? '✕ Cancel' : '＋ Add custom word'}
              </button>
            </div>

            {/* Custom word form */}
            <AnimatePresence>
              {showCustomForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="card mb-4 border-jade/20" style={{ background: 'rgba(45,138,94,0.02)' }}>
                  <h3 className="text-ink-200 font-semibold mb-3 flex items-center gap-2">
                    <span>＋</span> Add Custom Vocabulary
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-ink-400 text-xs mb-1 block">Japanese *</label>
                      <input type="text" className="input-field japanese-text" placeholder="食べる"
                        value={customJp} onChange={e => setCustomJp(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-ink-400 text-xs mb-1 block">Reading (kana)</label>
                      <input type="text" className="input-field japanese-text" placeholder="たべる"
                        value={customReading} onChange={e => setCustomReading(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-ink-400 text-xs mb-1 block">English *</label>
                      <input type="text" className="input-field" placeholder="to eat"
                        value={customEnglish} onChange={e => setCustomEnglish(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-ink-400 text-xs mb-1 block">Example sentence (Japanese)</label>
                      <input type="text" className="input-field japanese-text" placeholder="ごはんを食べる。"
                        value={customSentenceJp} onChange={e => setCustomSentenceJp(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-ink-400 text-xs mb-1 block">Example sentence (English)</label>
                      <input type="text" className="input-field" placeholder="I eat rice."
                        value={customSentenceEn} onChange={e => setCustomSentenceEn(e.target.value)} />
                    </div>
                  </div>
                  <button onClick={handleAddCustomWord}
                    disabled={!customJp.trim() || !customEnglish.trim()}
                    className="btn-primary disabled:opacity-40">
                    Add to deck ＋
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredWords.map(word => {
                const srsCard = vocabCards.find(c => c.wordId === word.id)
                const isCustom = word.id.startsWith('cw_')
                const isLeech = srsCard && srsCard.lapses >= 4
                return (
                  <div key={word.id} className="card hover:shadow-card-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="japanese-text text-2xl text-ink-100">{word.japanese}</span>
                          {showFurigana && <span className="text-ink-400 text-sm">{word.reading}</span>}
                        </div>
                        <p className="text-ink-200 font-medium">{word.english}</p>
                        {word.frequency && (
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize mt-1 ${FREQUENCY_STYLES[word.frequency] ?? 'bg-bg-secondary text-ink-400 border-border'}`}>
                            {word.frequency}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isCustom
                          ? <span className="tag-jade text-xs">Custom</span>
                          : <span className={`text-xs ${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[word.level] ?? 'tag-jade'}`}>{word.level}</span>
                        }
                        {isLeech && <span className="text-orange-400 text-xs">🐛 leech</span>}
                        {srsCard ? (
                          <span className={`text-xs ${getMaturityColor(srsCard)}`}>{getMaturityLabel(srsCard)}</span>
                        ) : (
                          <button onClick={() => addVocabCard(word.id)} className="text-xs text-sakura hover:underline font-medium">
                            + Add
                          </button>
                        )}
                        {isCustom && (
                          <button onClick={() => removeCustomWord(word.id)}
                            className="text-xs text-ink-400 hover:text-sakura transition-colors mt-0.5">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="sentence-card text-xs mt-1">
                      <p className="japanese-text text-ink-200">{word.sentenceJp}</p>
                      <p className="text-ink-400 mt-0.5">{word.sentenceEn}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
