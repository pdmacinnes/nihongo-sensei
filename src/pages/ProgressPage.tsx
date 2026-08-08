import { useMemo } from 'react'
import { useStore } from '../store'
import { getMaturityLabel, daysUntilDue } from '../lib/srs'
import { IconStreak } from '../components/Icons'

const SCENARIO_LABELS: Record<string, string> = {
  free: '自由会話', restaurant: 'レストラン', shopping: '買い物', directions: '道案内',
  introduction: '自己紹介', weather: '天気', hobby: '趣味', business: 'ビジネス',
}

export default function ProgressPage() {
  const { streak, totalXp, jlptLevel, vocabCards, kanaProgress,
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

  const today = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
  const xpByDay = Object.fromEntries(dailyXpHistory.map(e => [e.date, e.xp]))
  const chartData = last30Days.map(date => ({ date, xp: xpByDay[date] || 0 }))
  const maxXp = Math.max(...chartData.map(d => d.xp), 1)

  const heatmapDays = useMemo(() => {
    const todayDate = new Date()
    const dayOfWeek = todayDate.getDay()
    const lastMonday = new Date(todayDate)
    lastMonday.setDate(todayDate.getDate() - ((dayOfWeek + 6) % 7))
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(lastMonday)
      d.setDate(lastMonday.getDate() - (27 - i))
      const dateStr = d.toISOString().split('T')[0]
      return { date: dateStr, xp: xpByDay[dateStr] || 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  }, [xpByDay])
  const heatmapMax = Math.max(...heatmapDays.map(d => d.xp), 1)

  const weeklyXp = useMemo(() => {
    const weeks: { label: string; xp: number }[] = []
    const todayDate = new Date()
    for (let w = 7; w >= 0; w--) {
      let total = 0
      const weekStart = new Date(todayDate)
      weekStart.setDate(todayDate.getDate() - w * 7 - 6)
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + d)
        total += xpByDay[day.toISOString().split('T')[0]] || 0
      }
      weeks.push({ label: w === 0 ? 'This wk' : `${w}w ago`, xp: total })
    }
    return weeks
  }, [xpByDay])
  const maxWeeklyXp = Math.max(...weeklyXp.map(w => w.xp), 1)

  const forecastData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const count = vocabCards.filter(c => c.state === 'review' && Math.round(daysUntilDue(c)) === i).length
      return { day: i, count }
    })
  }, [vocabCards])
  const maxForecast = Math.max(...forecastData.map(d => d.count), 1)

  const BADGES = [
    { label: 'First Words', desc: 'Complete your first conversation', unlocked: totalConversations >= 1 },
    { label: 'Chatterbox', desc: '5 conversations', unlocked: totalConversations >= 5 },
    { label: 'On Fire', desc: '3-day streak', unlocked: streak >= 3 },
    { label: 'Week Warrior', desc: '7-day streak', unlocked: streak >= 7 },
    { label: 'Kana Student', desc: '50% kana mastered', unlocked: kanaMastery >= 50 },
    { label: 'Kana Master', desc: 'All kana mastered', unlocked: kanaMastery >= 100 },
    { label: 'Word Collector', desc: '20 cards in deck', unlocked: vocabCards.length >= 20 },
    { label: 'Level 5', desc: 'Reach level 5', unlocked: xpLevel >= 5 },
    { label: 'Century', desc: 'Earn 100 XP', unlocked: totalXp >= 100 },
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="page-title"><span className="japanese-text text-sakura">進捗</span> Progress</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your Japanese learning journey</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Streak', value: streak, unit: 'days', color: 'text-sakura' },
          { label: 'Total XP', value: totalXp, unit: 'points', color: 'text-gold' },
          { label: 'Level', value: xpLevel, unit: 'current', color: 'text-ink-200' },
          { label: 'JLPT', value: jlptLevel, unit: 'target', color: 'text-jade' },
        ].map(stat => (
          <div key={stat.label} className="border-b border-border pb-3">
            <div className="flex items-center gap-1.5 text-ink-400 text-xs mb-1">
              {stat.label === 'Streak' && <IconStreak size={12} className="text-sakura" />}
              {stat.label}
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-ink-400 text-xs">{stat.unit}</p>
          </div>
        ))}
      </div>

      <section className="mb-6">
        <h2 className="text-ink-200 font-semibold mb-3">Daily XP — Last 30 Days</h2>
        <div className="flex items-end gap-0.5 h-24">
          {chartData.map(d => {
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
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-ink-200 font-semibold">Study Activity — Last 4 Weeks</h2>
          <div className="flex items-center gap-1.5 text-xs text-ink-400">
            <span>None</span>
            {[0.2, 0.4, 0.7, 1].map(op => (
              <div key={op} className="w-3 h-3 rounded-sm" style={{ background: `rgba(201,75,75,${op})` }} />
            ))}
            <span>High</span>
          </div>
        </div>
        <div className="flex gap-0.5 mb-1 text-[10px] text-ink-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="flex-1 text-center">{d}</div>
          ))}
        </div>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {heatmapDays.map(day => {
            const intensity = day.xp > 0 ? Math.max(0.15, day.xp / heatmapMax) : 0
            const isToday = day.date === today.toISOString().split('T')[0]
            return (
              <div
                key={day.date}
                title={`${day.label}: ${day.xp} XP`}
                className={`h-7 rounded-sm ${isToday ? 'ring-1 ring-sakura ring-offset-1' : ''} ${day.xp > 0 ? '' : 'heatmap-empty'}`}
                style={{
                  background: day.xp > 0 ? `rgba(201,75,75,${intensity})` : undefined,
                }}
              />
            )
          })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-ink-200 font-semibold mb-3">Weekly XP — Last 8 Weeks</h2>
        <div className="flex items-end gap-2 h-20">
          {weeklyXp.map((week, i) => {
            const heightPct = week.xp > 0 ? Math.max((week.xp / maxWeeklyXp) * 100, 6) : 2
            const isCurrent = i === weeklyXp.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                {week.xp > 0 && <span className="text-[10px] text-ink-400">{week.xp}</span>}
                <div
                  className={`w-full rounded-t ${isCurrent ? 'bg-sakura' : 'bg-jade/60'}`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className={`text-[10px] font-medium ${isCurrent ? 'text-sakura' : 'text-ink-400'}`}>
                  {week.label}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-ink-200 font-semibold">Review Forecast — Next 30 Days</h2>
          <span className="text-ink-400 text-xs">{vocabCards.filter(c => c.state === 'review').length} review cards</span>
        </div>
        <div className="flex items-end gap-0.5 h-20">
          {forecastData.map((d, i) => {
            const heightPct = d.count > 0 ? Math.max((d.count / maxForecast) * 100, 8) : 2
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`Day +${i}: ${d.count} cards`}>
                <div
                  className={`w-full rounded-t ${i === 0 ? 'bg-sakura' : i <= 3 ? 'bg-gold/80' : 'bg-jade/50'}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span className="text-sakura font-medium">Today</span>
          <span>+30 days</span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <section>
          <h2 className="text-ink-200 font-semibold mb-3">Kana Mastery</h2>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-4xl font-bold text-ink-100">{kanaMastery}%</p>
              <p className="text-ink-400 text-sm">{masteredKana} / 92</p>
            </div>
            <div className="flex-1">
              <div className="xp-bar h-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sakura to-jade transition-all duration-700"
                  style={{ width: `${kanaMastery}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-jade font-bold text-lg">{totalKanaCorrect}</p>
              <p className="text-ink-400 text-xs">Correct</p>
            </div>
            <div>
              <p className="text-sakura font-bold text-lg">{totalKanaIncorrect}</p>
              <p className="text-ink-400 text-xs">Incorrect</p>
            </div>
            <div>
              <p className="text-gold font-bold text-lg">{kanaAccuracy}%</p>
              <p className="text-ink-400 text-xs">Accuracy</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-ink-200 font-semibold mb-3">Vocabulary SRS</h2>
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
                    <div className={`h-full rounded-full ${colors[label]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-ink-300 text-xs w-4 text-right">{count}</span>
                </div>
              ) : null
            })}
          </div>
        </section>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-ink-200 font-semibold">
            Wrong Answer Log <span className="text-sakura ml-2">{wrongAnswerLog.length}</span>
          </h2>
          {wrongAnswerLog.length > 0 && (
            <button onClick={clearWrongAnswerLog} className="btn-ghost text-xs text-ink-400">Clear</button>
          )}
        </div>
        {wrongAnswerLog.length === 0
          ? <p className="text-ink-400 text-sm">No mistakes logged yet — keep it up!</p>
          : (
            <div className="space-y-1 max-h-52 overflow-y-auto divide-y divide-border">
              {wrongAnswerLog.slice(0, 30).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 text-sm">
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
            </div>
          )}
      </section>

      <section className="mb-8">
        <h2 className="text-ink-200 font-semibold mb-3">
          Conversations <span className="text-jade font-bold ml-2">{totalConversations}</span>
        </h2>
        {conversations.length === 0
          ? <p className="text-ink-400 text-sm">No conversations yet — start chatting with Sakura!</p>
          : (
            <div className="space-y-0 max-h-40 overflow-y-auto divide-y divide-border">
              {conversations.map(conv => (
                <div key={conv.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-ink-200 text-sm font-medium japanese-text">
                      {SCENARIO_LABELS[conv.scenario] || conv.scenario}
                    </p>
                    <p className="text-ink-400 text-xs">{conv.messages.length} messages · {conv.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-ink-400 text-xs">{new Date(conv.startedAt).toLocaleDateString()}</p>
                    <p className="text-jade text-xs">Complete</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      <section>
        <h2 className="text-ink-200 font-semibold mb-3">
          Achievements <span className="text-gold ml-2">{BADGES.filter(b => b.unlocked).length}/{BADGES.length}</span>
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map(badge => (
            <div
              key={badge.label}
              className={`p-3 rounded-xl border text-center ${
                badge.unlocked ? 'border-gold/30 bg-gold/8' : 'border-border opacity-50'
              }`}
            >
              <p className={`text-sm font-semibold ${badge.unlocked ? 'text-ink-100' : 'text-ink-400'}`}>
                {badge.label}
              </p>
              <p className="text-ink-400 text-xs mt-0.5">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
