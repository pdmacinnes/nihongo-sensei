import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../store'
import { VOCAB_DATA } from '../lib/vocab-data'
import { IconSakura, IconVocab, IconReader, IconChat, IconArrow, IconKana } from '../components/Icons'

export default function Dashboard() {
  const navigate = useNavigate()
  const { username, jlptLevel, getDueCards, getKanaMastery, vocabCards, kanaProgress } = useStore()

  const dueCards = useMemo(() => getDueCards(), [vocabCards])
  const kanaMastery = useMemo(() => getKanaMastery(), [kanaProgress])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは'
  const greetingEn = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const showcaseWords = useMemo(() => {
    const inDeck = new Set(vocabCards.map(c => c.wordId))
    const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1']
    const targetIdx = levelOrder.indexOf(jlptLevel)
    const candidates = VOCAB_DATA.filter(w =>
      levelOrder.indexOf(w.level) <= targetIdx && !inDeck.has(w.id)
    )
    const dayOffset = Math.floor(Date.now() / 86400000)
    const start = (dayOffset * 3) % Math.max(1, candidates.length - 3)
    return candidates.slice(start, start + 3).length === 3
      ? candidates.slice(start, start + 3)
      : candidates.slice(0, 3)
  }, [vocabCards, jlptLevel])

  const primary = dueCards.length > 0
    ? {
        title: `Review ${dueCards.length} card${dueCards.length === 1 ? '' : 's'}`,
        subtitle: 'Vocab due now — keep your streak strong',
        jp: '復習しましょう',
        href: '/vocab',
        Icon: IconVocab,
      }
    : kanaMastery < 40
      ? {
          title: 'Practice kana',
          subtitle: `Hiragana & katakana · ${kanaMastery}% mastery`,
          jp: 'かなを練習',
          href: '/kana',
          Icon: IconKana,
        }
      : {
          title: 'Chat with Sakura',
          subtitle: 'Practice real Japanese conversation',
          jp: '話しましょう！',
          href: '/conversation',
          Icon: IconChat,
        }

  const secondary = [
    primary.href !== '/conversation' && {
      label: 'Chat',
      labelJp: '会話',
      href: '/conversation',
      Icon: IconChat,
    },
    primary.href !== '/vocab' && {
      label: dueCards.length > 0 ? `Vocab (${dueCards.length})` : 'Vocab',
      labelJp: '単語',
      href: '/vocab',
      Icon: IconVocab,
    },
    {
      label: 'Reader',
      labelJp: '読解',
      href: '/reader',
      Icon: IconReader,
    },
  ].filter(Boolean) as { label: string; labelJp: string; href: string; Icon: typeof IconChat }[]

  const secondaryTwo = secondary.slice(0, 2)
  const PrimaryIcon = primary.Icon

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-ink-400 text-sm mb-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-ink-100 leading-snug">
          <span className="japanese-text text-sakura text-[1.15em]">{greeting}</span>
          <span className="text-ink-300 font-normal"> · </span>
          <span className="font-semibold">{greetingEn}, {username}</span>
        </h1>
        <p className="text-ink-400 text-sm mt-1">What should you do next?</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(primary.href)}
        className="w-full mb-4 p-5 rounded-2xl border-2 border-sakura/30 text-left group shadow-card
                   hover:border-sakura/50 hover:shadow-sakura transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(201,75,75,0.07), white 55%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sakura/10 border border-sakura/20 flex items-center justify-center text-sakura shadow-sm flex-shrink-0">
            {primary.href === '/conversation' ? <IconSakura size={28} /> : <PrimaryIcon size={26} />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-ink-100 font-bold text-lg">{primary.title}</h2>
            <p className="text-ink-300 text-sm">{primary.subtitle}</p>
            <p className="text-ink-400 text-xs mt-0.5 japanese-text">{primary.jp}</p>
          </div>
          <IconArrow className="text-ink-400 group-hover:text-sakura group-hover:translate-x-0.5 transition-all flex-shrink-0" size={20} />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {secondaryTwo.map(({ label, labelJp, href, Icon }) => (
          <button
            key={href}
            type="button"
            onClick={() => navigate(href)}
            className="card-hover text-left p-4 flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-xl bg-bg-secondary border border-border flex items-center justify-center text-ink-200 flex-shrink-0">
              <Icon size={20} />
            </span>
            <span>
              <span className="block text-ink-100 font-semibold text-sm">{label}</span>
              <span className="japanese-text text-ink-400 text-xs">{labelJp}</span>
            </span>
          </button>
        ))}
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-ink-200 font-semibold">
            <span className="japanese-text text-sakura mr-1.5 text-lg">今日</span>
            Today&apos;s sentences
          </h3>
          <button
            type="button"
            onClick={() => navigate('/vocab')}
            className="text-sakura text-xs font-medium hover:underline"
          >
            Study vocab →
          </button>
        </div>
        <div className="space-y-3">
          {showcaseWords.length === 0 ? (
            <p className="text-ink-400 text-sm">Your deck is caught up for this level. Try Chat or Reader.</p>
          ) : (
            showcaseWords.map(word => (
              <div key={word.id} className="sentence-card">
                <p className="study-jp text-ink-100">{word.sentenceJp}</p>
                <p className="text-ink-400 text-xs mt-1">{word.sentenceEn}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="japanese-text text-sakura font-medium text-sm">{word.japanese}</span>
                  <span className="text-ink-400 text-xs">= {word.english}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
