import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { READING_PASSAGES, ReadingPassage, parseRuby } from '../lib/reading-data'
import { useStore } from '../store'

function RubyText({ text, showFurigana }: { text: string; showFurigana: boolean }) {
  const segments = parseRuby(text)
  return (
    <span>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i}>
            {seg.text}
            {showFurigana && <rt className="text-[0.6em] text-ink-400">{seg.reading}</rt>}
            {!showFurigana && <rt />}
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  )
}

export default function ReadingPractice() {
  const { showFurigana, setShowFurigana, addXP } = useStore()
  const [levelFilter, setLevelFilter] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'all'>('N5')
  const [selected, setSelected] = useState<ReadingPassage | null>(null)
  const [showTranslation, setShowTranslation] = useState<Record<number, boolean>>({})
  const [showAllTranslation, setShowAllTranslation] = useState(false)
  const [xpAwarded, setXpAwarded] = useState<Set<string>>(new Set())

  const filtered = levelFilter === 'all' ? READING_PASSAGES : READING_PASSAGES.filter(p => p.level === levelFilter)

  const openPassage = (passage: ReadingPassage) => {
    setSelected(passage)
    setShowTranslation({})
    setShowAllTranslation(false)
  }

  const toggleLine = (idx: number) => {
    setShowTranslation(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const handleComplete = (passageId: string) => {
    if (!xpAwarded.has(passageId)) {
      addXP(15)
      toast.success('+15 XP — passage complete! 🎌', { duration: 2000 })
      setXpAwarded(prev => new Set(prev).add(passageId))
    }
    setSelected(null)
  }

  if (selected) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelected(null)} className="btn-secondary text-sm">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span className={`${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[selected.level] ?? 'tag-jade'}`}>{selected.level}</span>
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                showFurigana ? 'border-jade bg-jade/8 text-jade' : 'border-border text-ink-400 bg-white'
              }`}
            >
              ふ Furigana
            </button>
            <button
              onClick={() => setShowAllTranslation(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                showAllTranslation ? 'border-gold bg-gold/8 text-gold' : 'border-border text-ink-400 bg-white'
              }`}
            >
              EN All
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card mb-5">
            <h1 className="japanese-text text-2xl font-bold text-ink-100 mb-0.5">{selected.title}</h1>
            <p className="text-ink-400 text-sm">{selected.titleEn} · {selected.topic}</p>
          </div>

          <div className="space-y-3 mb-6">
            {selected.paragraphs.map((para, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card cursor-pointer hover:border-sakura/20 transition-all"
                onClick={() => toggleLine(i)}
              >
                <p className="japanese-text text-lg leading-loose text-ink-100 mb-2">
                  <RubyText text={para.japanese} showFurigana={showFurigana} />
                </p>
                <AnimatePresence>
                  {(showTranslation[i] || showAllTranslation) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-ink-400 text-sm italic border-t border-border pt-2"
                    >
                      {para.english}
                    </motion.p>
                  )}
                </AnimatePresence>
                {!showAllTranslation && (
                  <p className="text-xs text-ink-400 mt-1">{showTranslation[i] ? '▲ Hide' : '▼ Show translation'}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Vocabulary section */}
          <div className="card mb-5">
            <h2 className="text-ink-200 font-semibold mb-3">Key Vocabulary</h2>
            <div className="grid grid-cols-2 gap-2">
              {selected.vocabulary.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-bg-primary rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="japanese-text font-bold text-ink-100">{v.word}</span>
                      <span className="text-ink-400 text-xs">{v.reading}</span>
                    </div>
                    <p className="text-ink-400 text-xs">{v.english}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleComplete(selected.id)}
            className="btn-primary w-full py-3 text-base"
          >
            {xpAwarded.has(selected.id) ? '✓ Completed' : '✓ Mark Complete (+15 XP)'}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="page-title"><span className="japanese-text text-sakura">読書</span> Reading</h1>
          <p className="text-ink-400 text-sm mt-0.5">Graded passages with furigana support</p>
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
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
              showFurigana ? 'border-jade bg-jade/8 text-jade' : 'border-border text-ink-400 bg-white'
            }`}
          >
            ふ Furigana {showFurigana ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((passage, i) => (
          <motion.button
            key={passage.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => openPassage(passage)}
            className="card text-left hover:border-sakura/30 hover:shadow-card-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${{ N5: 'tag-jade', N4: 'tag-blue', N3: 'tag-gold', N2: 'tag-sakura', N1: 'tag-purple' }[passage.level] ?? 'tag-jade'}`}>{passage.level}</span>
                <span className="text-ink-400 text-xs capitalize">{passage.topic}</span>
              </div>
              {xpAwarded.has(passage.id) && <span className="text-jade text-xs font-medium">✓ Done</span>}
            </div>
            <h3 className="japanese-text text-xl font-bold text-ink-100 mb-1 group-hover:text-sakura transition-colors">
              {passage.title}
            </h3>
            <p className="text-ink-400 text-sm mb-3">{passage.titleEn}</p>
            <p className="japanese-text text-sm text-ink-300 line-clamp-2 leading-relaxed">
              {passage.paragraphs[0].japanese.replace(/\[[^\]]+\|([^\]]+)\]/g, '$1').slice(0, 60)}...
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-ink-400 text-xs">{passage.paragraphs.length} paragraphs · {passage.vocabulary.length} vocab</span>
              <span className="text-sakura text-xs group-hover:translate-x-0.5 transition-transform">Read →</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
