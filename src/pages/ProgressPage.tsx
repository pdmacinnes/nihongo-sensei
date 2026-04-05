import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { getMaturityLabel, daysUntilDue } from '../lib/srs'

const SCENARIOS_MAP: Record<string, string> = {
  free: '💬', restaurant: '🍜', shopping: '🛍️', directions: '🗺️',
  introduction: '🤝', weather: '🌸', hobby: '🎨', business: '💼',
}

export default function ProgressPage() {
  const { streak, xp, totalXp, username, jlptLevel, vocabCards, kanaProgress,
          conversations, totalConversations, totalKanaCorrect, totalKanaIncorrect,
          getKanaMastery, dailyNewCardLimit, dailyXpHistory, wrongAnswerLog,
          clearWrongAnswerLog } = useStore()

  const xpLevel = Math.floor(totalXp / 100)
  const kanaMastery = getKanaMastery()
  const masteredKana = Object.values(kanaProgress).filter(k => k.mastered).length
  const kanaAccuracy = totalKanaCorrect + totalKanaIncorrect > 0
    ? Math.round((totalKanaCorrect / (totalKanaCorrect + totalKanaIncorrect)) * 100) : 0

  const maturityCounts: Record<string, number> = { New: 0, Learning: 0, Young: 0, Maturing: 0, Mature: 0, Mastered: 0 }
  vocabCards.forEach(c => { const l = getMaturityLabel(c); maturityCounts[l] = (maturityCounts[l] || 0) + 1 })

  // Build 30-day XP chart data
  const today = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
  const xpByDay = Object.fromEntries(dailyXpHistory.map(e => [e.date, e.xp]))
  const chartData = last30Days.map(date => ({ date, xp: xpByDay[date] || 0 }))
  const maxXp = Math.max(...chartData.map(d => d.xp), 1)

  // 30-day review forecast
  const forecastData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const count = vocabCards.filter(c => c.state === 'review' && Math.round(daysUntilDue(c)) === i).length
      return { day: i, count }
    })
  }, [vocabCards])
  const maxForecast = Math.max(...forecastData.map(d => d.count), 1)

  const BADGES = [
    { emoji: '🗣️', label: 'First Words', desc: 'Complete your first conversation', unlocked: totalConversations >= 1 },
    { emoji: '💬', label: 'Chatterbox', desc: '5 conversations', unlocked: totalConversations >= 5 },
    { emoji: '🔥', label: 'On Fire', desc: '3-day streak', unlocked: streak >= 3 },
    { emoji: '⚡', label: 'Week Warrior', desc: '7-day streak', unlocked: streak >= 7 },
    { emoji: '字', label: 'Kana Student', desc: '50% kana mastered', unlocked: kanaMastery >= 50 },
    { emoji: '✨', label: 'Kana Master', desc: 'All kana mastered', unlocked: kanaMastery >= 100 },
    { emoji: '📖', label: 'Word Collector', desc: '20 cards in deck', unlocked: vocabCards.length >= 20 },
    { emoji: '⭐', label: 'Level 5', desc: 'Reach level 5', unlocked: xpLevel >= 5 },
    { emoji: '🏆', label: 'Century', desc: 'Earn 100 XP', unlocked: totalXp >= 100 },
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="page-title"><span className="japanese-text text-sakura">進捗</span> Progress</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your Japanese learning journey</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Study Streak', value: streak, unit: 'days', icon: '🔥', color: 'text-sakura', border: 'border-sakura/20 bg-sakura/5' },
          { label: 'Total XP', value: totalXp, unit: 'points', icon: '⭐', color: 'text-gold', border: 'border-gold/20 bg-gold/5' },
          { label: 'Level', value: xpLevel, unit: 'current', icon: '🎌', color: 'text-blue-600', border: 'border-blue-200 bg-blue-50' },
          { label: 'JLPT Target', value: jlptLevel, unit: 'level', icon: '📜', color: 'text-jade', border: 'border-jade/20 bg-jade/5' },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`card border-2 ${stat.border} text-center shadow-card`}>
            <span className="text-2xl">{stat.icon}</span>
            <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            <p className="text-ink-400 text-xs">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 30-day XP Chart */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card mb-4">
        <h2 className="text-ink-200 font-semibold mb-4">Daily XP — Last 30 Days</h2>
        <div className="flex items-end gap-0.5 h-24">
          {chartData.map((d, i) => {
            const isToday = d.date === today.toISOString().split('T')[0]
            const heightPct = d.xp > 0 ? Math.max((d.xp / maxXp) * 100, 8) : 2
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative" title={`${d.date}: ${d.xp} XP`}>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    isToday ? 'bg-sakura' : d.xp > 0 ? 'bg-jade/70 group-hover:bg-jade' : 'bg-bg-secondary'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                {/* Tooltip */}
                {d.xp > 0 && (
                  <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-ink-100 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
                    {d.xp} XP
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </motion.div>

      {/* 30-day Review Forecast */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ink-200 font-semibold">Review Forecast — Next 30 Days</h2>
          <span className="text-ink-400 text-xs">{vocabCards.filter(c => c.state === 'review').length} review cards total</span>
        </div>
        <div className="flex items-end gap-0.5 h-20">
          {forecastData.map((d, i) => {
            const heightPct = d.count > 0 ? Math.max((d.count / maxForecast) * 100, 8) : 2
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" title={`Day +${i}: ${d.count} cards`}>
                <div className={`w-full rounded-t transition-all duration-500 ${
                  i === 0 ? 'bg-sakura' : i <= 3 ? 'bg-gold/80' : 'bg-jade/50 group-hover:bg-jade/80'
                }`} style={{ height: `${heightPct}%` }} />
                {d.count > 0 && (
                  <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-ink-100 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
                    +{i}d: {d.count} cards
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span className="text-sakura font-medium">Today</span>
          <span>+30 days</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Kana */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4">Kana Mastery</h2>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-4xl font-bold text-blue-600">{kanaMastery}%</p>
              <p className="text-ink-400 text-sm">{masteredKana} / 92</p>
            </div>
            <div className="flex-1">
              <div className="xp-bar h-3">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-jade transition-all duration-700"
                  style={{ width: `${kanaMastery}%` }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="sentence-card">
              <p className="text-jade font-bold">{totalKanaCorrect}</p>
              <p className="text-ink-400 text-xs">Correct</p>
            </div>
            <div className="sentence-card">
              <p className="text-sakura font-bold">{totalKanaIncorrect}</p>
              <p className="text-ink-400 text-xs">Incorrect</p>
            </div>
            <div className="sentence-card">
              <p className="text-gold font-bold">{kanaAccuracy}%</p>
              <p className="text-ink-400 text-xs">Accuracy</p>
            </div>
          </div>
        </motion.div>

        {/* Vocab SRS */}
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4">Vocabulary SRS</h2>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-4xl font-bold text-jade">{vocabCards.length}</p>
            <p className="text-ink-400 text-sm">cards in deck</p>
          </div>
          <p className="text-ink-400 text-xs mb-4">{dailyNewCardLimit} new/day · 90% retention target</p>
          <div className="space-y-2">
            {Object.entries(maturityCounts).map(([label, count]) => {
              const colors: Record<string, string> = {
                New: 'bg-ink-500', Learning: 'bg-blue-400', Young: 'bg-jade',
                Maturing: 'bg-jade-bright', Mature: 'bg-gold', Mastered: 'bg-sakura',
              }
              const pct = vocabCards.length > 0 ? (count / vocabCards.length) * 100 : 0
              return count > 0 ? (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-ink-400 text-xs w-16">{label}</span>
                  <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[label]} transition-all duration-500`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-ink-300 text-xs w-4 text-right">{count}</span>
                </div>
              ) : null
            })}
          </div>
        </motion.div>
      </div>

      {/* Wrong answer log */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ink-200 font-semibold">
            Wrong Answer Log <span className="text-sakura ml-2">{wrongAnswerLog.length}</span>
          </h2>
          {wrongAnswerLog.length > 0 && (
            <button onClick={clearWrongAnswerLog} className="btn-ghost text-xs text-ink-400">
              Clear
            </button>
          )}
        </div>
        {wrongAnswerLog.length === 0
          ? <p className="text-ink-400 text-center py-5 text-sm">No mistakes logged yet — keep it up!</p>
          : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {wrongAnswerLog.slice(0, 30).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-bg-primary border border-border text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      entry.type === 'vocab' ? 'bg-sakura/10 text-sakura' : 'bg-gold/10 text-gold'
                    }`}>
                      {entry.type === 'vocab' ? '単' : '文'}
                    </span>
                    <span className="japanese-text text-ink-100 font-medium">{entry.label}</span>
                    {entry.reading && <span className="text-ink-400 text-xs">({entry.reading})</span>}
                  </div>
                  <span className="text-ink-400 text-xs">{entry.english}</span>
                </div>
              ))}
              {wrongAnswerLog.length > 30 && (
                <p className="text-ink-400 text-xs text-center pt-1">+{wrongAnswerLog.length - 30} more</p>
              )}
            </div>
          )}
      </motion.div>

      {/* Conversation history */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card mb-4">
        <h2 className="text-ink-200 font-semibold mb-4">
          Conversations <span className="text-jade font-bold ml-2">{totalConversations}</span>
        </h2>
        {conversations.length === 0
          ? <p className="text-ink-400 text-center py-6 text-sm">No conversations yet — start chatting with Sakura!</p>
          : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {conversations.map(conv => (
                <div key={conv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{SCENARIOS_MAP[conv.scenario] || '💬'}</span>
                    <div>
                      <p className="text-ink-200 text-sm font-medium capitalize">{conv.scenario}</p>
                      <p className="text-ink-400 text-xs">{conv.messages.length} messages · {conv.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-ink-400 text-xs">{new Date(conv.startedAt).toLocaleDateString()}</p>
                    <p className="text-jade text-xs">Complete ✓</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
        <h2 className="text-ink-200 font-semibold mb-4">
          Achievements <span className="text-gold ml-2">{BADGES.filter(b => b.unlocked).length}/{BADGES.length}</span>
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map(badge => (
            <div key={badge.label} className={`p-3 rounded-xl border-2 text-center transition-all ${
              badge.unlocked ? 'border-gold/30 bg-gold/8 shadow-sm' : 'border-border bg-bg-primary opacity-50'
            }`}>
              <span className="text-2xl">{badge.emoji}</span>
              <p className={`text-sm font-semibold mt-1 ${badge.unlocked ? 'text-ink-100' : 'text-ink-400'}`}>
                {badge.label}
              </p>
              <p className="text-ink-400 text-xs mt-0.5">{badge.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
