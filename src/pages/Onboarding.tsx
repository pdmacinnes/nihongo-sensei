import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { IconSakura } from '../components/Icons'

const STEPS = ['welcome', 'name', 'level', 'done']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [level, setLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N5')
  const { setUsername, setJlptLevel, completeOnboarding } = useStore()

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const finish = () => {
    setUsername(name || 'Learner')
    setJlptLevel(level)
    completeOnboarding()
  }

  const currentStep = STEPS[step]

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['桜', '日', '本', '語', '学', '習'].map((char, i) => (
          <div
            key={i}
            className="absolute text-sakura/6 text-7xl japanese-text select-none font-bold"
            style={{ left: `${8 + i * 16}%`, top: `${10 + (i % 3) * 28}%`, transform: `rotate(${-15 + i * 8}deg)` }}
          >
            {char}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full max-w-md"
        >
          {currentStep === 'welcome' && (
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sakura/10 border border-sakura/20 text-sakura mx-auto">
                <IconSakura size={36} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient-sakura mb-1 japanese-text">日本語先生</h1>
                <p className="text-xl text-ink-200 font-medium">Nihongo Sensei</p>
                <p className="text-ink-400 mt-3 max-w-sm mx-auto leading-relaxed">
                  Practice real Japanese with Sakura — conversation, vocab, and reading in one place.
                </p>
              </div>
              <button onClick={next} className="btn-primary w-full py-3.5 text-base">
                始めましょう — Let&apos;s Start
              </button>
            </div>
          )}

          {currentStep === 'name' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="tag-sakura inline-block mb-3">Step 1 of 2</p>
                <h2 className="text-2xl font-bold text-ink-100">What&apos;s your name?</h2>
                <p className="text-ink-400 mt-1 japanese-text text-lg">お名前は？</p>
              </div>
              <input
                type="text"
                className="input-field text-lg text-center"
                placeholder="Your name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                autoFocus
              />
              <button onClick={next} className="btn-primary w-full py-3">Continue →</button>
            </div>
          )}

          {currentStep === 'level' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="tag-sakura inline-block mb-3">Step 2 of 2</p>
                <h2 className="text-2xl font-bold text-ink-100">Your Japanese level</h2>
                <p className="text-ink-400 mt-1">Sets conversation difficulty</p>
              </div>
              <div className="space-y-2">
                {[
                  { level: 'N5' as const, label: 'Complete Beginner', desc: 'Just starting, learning kana now' },
                  { level: 'N4' as const, label: 'Elementary', desc: 'Know kana, basic vocab and grammar' },
                  { level: 'N3' as const, label: 'Intermediate', desc: 'Can handle everyday conversations' },
                  { level: 'N2' as const, label: 'Upper Intermediate', desc: 'Comfortable with complex topics' },
                  { level: 'N1' as const, label: 'Advanced', desc: 'Near-native or native-level reading' },
                ].map(item => (
                  <button
                    key={item.level}
                    onClick={() => setLevel(item.level)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      level === item.level
                        ? 'border-sakura bg-sakura/8 shadow-sm'
                        : 'border-border bg-white hover:border-border-light shadow-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${level === item.level ? 'text-sakura' : 'text-ink-300'}`}>
                        {item.level}
                      </span>
                      <div>
                        <p className="text-ink-100 font-medium">{item.label}</p>
                        <p className="text-ink-400 text-sm">{item.desc}</p>
                      </div>
                      {level === item.level && <span className="ml-auto text-sakura text-lg">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={next} className="btn-primary w-full py-3">Continue →</button>
            </div>
          )}

          {currentStep === 'done' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sakura/10 border border-sakura/20 text-sakura"
              >
                <IconSakura size={32} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-ink-100 mb-1 japanese-text">よろしく！</h2>
                <p className="text-xl text-ink-200">Nice to meet you, {name || 'Learner'}!</p>
              </div>
              <div className="text-left space-y-3 text-sm text-ink-300">
                <p className="text-ink-400 text-xs font-medium uppercase tracking-wide">What&apos;s inside</p>
                {[
                  ['会話', 'AI chat with Sakura'],
                  ['単語', 'Sentence-first SRS vocab'],
                  ['かな', 'Hiragana & katakana drills'],
                ].map(([jp, en]) => (
                  <div key={jp} className="flex items-baseline gap-3 border-b border-border pb-2 last:border-0">
                    <span className="japanese-text text-sakura font-medium w-10">{jp}</span>
                    <span>{en}</span>
                  </div>
                ))}
              </div>
              <button onClick={finish} className="btn-primary w-full py-3 text-base shadow-sakura">
                開始！Begin Learning
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step > 0 && step < STEPS.length - 1 && (
        <div className="fixed bottom-8 flex gap-2">
          {[1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step >= i ? 'bg-sakura' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
