import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { VOCAB_DATA } from '../lib/vocab-data'

const DAY_MS = 24 * 60 * 60 * 1000

const stagger = {
  container: { transition: { staggerChildren: 0.07 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { username, streak, xp, jlptLevel, getDueCards, getKanaMastery, totalConversations, vocabCards, customWords } = useStore()

  const dueCards = useMemo(() => getDueCards(), [vocabCards])
  const kanaMastery = useMemo(() => getKanaMastery(), [vocabCards])
  const xpLevel = Math.floor(xp / 100)
  const xpProgress = xp % 100

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは'
  const greetingEn = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const showcaseWords = useMemo(() => {
    const inDeck = new Set(vocabCards.map(c => c.wordId))
    const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1']
    const targetIdx = levelOrder.indexOf(jlptLevel)
    // Show words from target level or below that aren't in the deck yet
    const candidates = VOCAB_DATA.filter(w =>
      levelOrder.indexOf(w.level) <= targetIdx && !inDeck.has(w.id)
    )
    // Use date-based offset to rotate daily without randomness
    const dayOffset = Math.floor(Date.now() / 86400000)
    const start = (dayOffset * 3) % Math.max(1, candidates.length - 3)
    return candidates.slice(start, start + 3).length === 3
      ? candidates.slice(start, start + 3)
      : candidates.slice(0, 3)
  }, [vocabCards, jlptLevel])

  const forecastDays = useMemo(() => {
    const now = Date.now()
    return Array.from({ length: 7 }, (_, i) => {
      const dayStart = now + i * DAY_MS
      const dayEnd = dayStart + DAY_MS
      return {
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `+${i}d`,
        count: vocabCards.filter(c =>
          c.state === 'review' && c.dueDate >= dayStart && c.dueDate < dayEnd
        ).length,
      }
    })
  }, [vocabCards])
  const maxForecast = Math.max(1, ...forecastDays.map(d => d.count))

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-ink-400 text-sm mb-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold text-ink-100">
              <span className="japanese-text text-sakura">{greeting}</span>
              {', '}
              <span>{greetingEn}, {username}!</span>
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <span className="text-xl streak-flame">🔥</span>
                <span className="text-2xl font-bold text-sakura">{streak}</span>
              </div>
              <p className="text-ink-400 text-xs">streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{xp}</p>
              <p className="text-ink-400 text-xs">XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-ink-200">Lv.{xpLevel}</p>
              <p className="text-ink-400 text-xs">level</p>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
          <span className="text-xs text-ink-400">{xpProgress}/100 to Lv.{xpLevel + 1}</span>
        </div>
      </motion.div>

      {/* Conversation hero CTA */}
      <motion.button
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        onClick={() => navigate('/conversation')}
        className="w-full mb-5 p-5 rounded-2xl border-2 border-sakura/30 bg-gradient-to-r from-sakura/8 to-white
                   hover:from-sakura/15 hover:border-sakura/50 hover:shadow-sakura
                   transition-all duration-300 text-left group shadow-card"
        style={{ background: 'linear-gradient(135deg, rgba(201,75,75,0.06), white)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-sakura/10 border border-sakura/20 flex items-center justify-center text-3xl shadow-sm flex-shrink-0"
            >
              🌸
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-ink-100 font-bold text-lg">Chat with Sakura</h2>
                <span className="tag-sakura">AI Tutor</span>
              </div>
              <p className="text-ink-300 text-sm">Practice real Japanese conversation with your AI teacher</p>
              <p className="text-ink-400 text-xs mt-0.5 japanese-text">話しましょう！</p>
            </div>
          </div>
          <span className="text-ink-400 text-xl group-hover:text-sakura group-hover:translate-x-1 transition-all duration-200">
            →
          </span>
        </div>
      </motion.button>

      {/* Stats row */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-3 gap-3 mb-5"
      >
        {[
          {
            label: 'Due for Review',
            value: dueCards.length,
            sub: 'vocab cards',
            color: dueCards.length > 0 ? 'text-gold' : 'text-jade',
            border: dueCards.length > 0 ? 'border-gold/25 bg-gold/5' : 'border-jade/25 bg-jade/5',
            onClick: () => navigate('/vocab'),
            cta: dueCards.length > 0 ? 'Review now →' : 'All caught up ✓',
          },
          {
            label: 'Kana Mastery',
            value: `${kanaMastery}%`,
            sub: 'hiragana + katakana',
            color: 'text-blue-600',
            border: 'border-blue-200 bg-blue-50/50',
            onClick: () => navigate('/kana'),
            cta: 'Practice →',
          },
          {
            label: 'Conversations',
            value: totalConversations,
            sub: 'sessions done',
            color: 'text-sakura',
            border: 'border-sakura/25 bg-sakura/5',
            onClick: () => navigate('/conversation'),
            cta: 'Start one →',
          },
        ].map(stat => (
          <motion.button
            key={stat.label}
            variants={stagger.item as any}
            onClick={stat.onClick}
            className={`card border-2 ${stat.border} text-left hover:shadow-card-md transition-all duration-200 active:scale-98`}
          >
            <p className="text-ink-400 text-xs mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} mb-0.5`}>{stat.value}</p>
            <p className="text-ink-400 text-xs">{stat.sub}</p>
            <p className={`${stat.color} text-xs mt-2 font-medium`}>{stat.cta}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Review forecast */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="card mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-200 font-semibold flex items-center gap-2">
            <span>📅</span> Upcoming Reviews
          </h3>
          <span className="text-ink-400 text-xs">7-day forecast</span>
        </div>
        <div className="flex gap-2 items-end h-16">
          {forecastDays.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-ink-400 text-xs">{day.count || ''}</span>
              <div className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max(4, (day.count / maxForecast) * 40)}px`,
                  background: i === 0
                    ? 'linear-gradient(to top, #c94b4b, #e07777)'
                    : i === 1
                    ? 'linear-gradient(to top, #b07d1a, #d4a73a)'
                    : 'linear-gradient(to top, #dddde8, #eeeef4)',
                }}
              />
              <span className={`text-xs font-medium ${i === 0 ? 'text-sakura' : i === 1 ? 'text-gold' : 'text-ink-400'}`}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Learning path */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28 }}
          className="card"
        >
          <h3 className="text-ink-200 font-semibold mb-3 flex items-center gap-2">
            <span>🗺️</span> Recommended Path
          </h3>
          <div className="space-y-2">
            {[
              { step: '1', label: 'Learn Hiragana & Katakana', done: kanaMastery > 0, href: '/kana' },
              { step: '2', label: 'Start vocab flashcards (10/day)', done: vocabCards.some(c => c.repetitions > 0), href: '/vocab' },
              { step: '3', label: 'Have your first conversation', done: totalConversations > 0, href: '/conversation' },
              { step: '4', label: 'Build a daily study streak', done: streak >= 3, href: '/' },
            ].map(item => (
              <button
                key={item.step}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 text-left py-1.5 hover:text-sakura transition-colors"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  item.done ? 'bg-jade text-white' : 'bg-bg-secondary text-ink-300 border border-border'
                }`}>
                  {item.done ? '✓' : item.step}
                </span>
                <span className={`text-sm ${item.done ? 'text-ink-400 line-through' : 'text-ink-200'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-ink-300">JLPT Target</span>
            <span className={`font-bold ${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[jlptLevel] ?? 'tag-jade'}`}>{jlptLevel}</span>
          </div>
        </motion.div>

        {/* Sentence showcase */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.32 }}
          className="card"
        >
          <h3 className="text-ink-200 font-semibold mb-3 flex items-center gap-2">
            <span>✏️</span> Today's Sentences
          </h3>
          <div className="space-y-3">
            {showcaseWords.map(word => (
              <div key={word.id} className="sentence-card">
                <p className="japanese-text text-base text-ink-100 leading-relaxed">{word.sentenceJp}</p>
                <p className="text-ink-400 text-xs mt-1">{word.sentenceEn}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="japanese-text text-sakura font-medium text-sm">{word.japanese}</span>
                  <span className="text-ink-400 text-xs">= {word.english}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/vocab')}
            className="mt-3 text-sakura text-xs font-medium hover:underline"
          >
            Study vocabulary →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
