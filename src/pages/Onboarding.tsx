import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

const STEPS = ['welcome', 'name', 'level', 'done']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [level, setLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N5')
  const { setUsername, setJlptLevel, completeOnboarding } = useStore()

  const next = () => setStep(s => s + 1)
  const finish = () => {
    setUsername(name || 'Learner')
    setJlptLevel(level)
    completeOnboarding()
  }

  const currentStep = STEPS[step]

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['桜', '日', '本', '語', '学', '習'].map((char, i) => (
          <div key={i} className="absolute text-sakura/6 text-7xl japanese-text select-none font-bold"
            style={{ left: `${8 + i * 16}%`, top: `${10 + (i % 3) * 28}%`, transform: `rotate(${-15 + i * 8}deg)` }}>
            {char}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.28 }}
          className="relative z-10 w-full max-w-md"
        >
          {currentStep === 'welcome' && (
            <div className="text-center space-y-6">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-7xl">🌸</motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gradient-sakura mb-1 japanese-text">日本語先生</h1>
                <p className="text-xl text-ink-200 font-medium">Nihongo Sensei</p>
                <p className="text-ink-400 mt-2">Your personal Japanese learning companion</p>
              </div>
              <div className="card text-left space-y-3">
                <p className="text-ink-300 text-sm font-medium">Built on research, optimized for you:</p>
                {[
                  ['💬', 'AI Conversation', 'Chat with Sakura, your AI tutor, anytime'],
                  ['🧠', 'Sentence-first SRS', 'Context-based cards for deeper retention'],
                  ['字', 'Kana Drills', 'Master hiragana & katakana fast'],
                  ['🔥', 'Daily Streaks', 'Build a habit that sticks'],
                ].map(([icon, title, desc]) => (
                  <div key={title as string} className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center">{icon}</span>
                    <div>
                      <p className="text-ink-200 text-sm font-medium">{title}</p>
                      <p className="text-ink-400 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={next} className="btn-primary w-full py-3 text-base">
                始めましょう — Let's Start!
              </button>
            </div>
          )}

          {currentStep === 'name' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="tag-sakura inline-block mb-3">Step 1 of 2</p>
                <h2 className="text-2xl font-bold text-ink-100">What's your name?</h2>
                <p className="text-ink-400 mt-1 japanese-text">お名前は？</p>
              </div>
              <div className="card">
                <input type="text" className="input-field text-lg text-center" placeholder="Your name..."
                  value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && next()} autoFocus />
              </div>
              <button onClick={next} className="btn-primary w-full py-3">Continue →</button>
            </div>
          )}

          {currentStep === 'level' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="tag-sakura inline-block mb-3">Step 2 of 2</p>
                <h2 className="text-2xl font-bold text-ink-100">Your Japanese level</h2>
                <p className="text-ink-400 mt-1">This sets AI conversation difficulty</p>
              </div>
              <div className="space-y-2">
                {[
                  { level: 'N5' as const, label: 'Complete Beginner', desc: 'Just starting, learning kana now' },
                  { level: 'N4' as const, label: 'Elementary', desc: 'Know kana, basic vocab and grammar' },
                  { level: 'N3' as const, label: 'Intermediate', desc: 'Can handle everyday conversations' },
                  { level: 'N2' as const, label: 'Upper Intermediate', desc: 'Comfortable with complex topics' },
                  { level: 'N1' as const, label: 'Advanced', desc: 'Near-native or native-level reading' },
                ].map(item => (
                  <button key={item.level} onClick={() => setLevel(item.level)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      level === item.level
                        ? 'border-sakura bg-sakura/8 shadow-sm'
                        : 'border-border bg-white hover:border-border-light shadow-card'
                    }`}>
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }} className="text-6xl">🎌</motion.div>
              <div>
                <h2 className="text-3xl font-bold text-ink-100 mb-1 japanese-text">よろしく！</h2>
                <p className="text-xl text-ink-200">Nice to meet you, {name || 'Learner'}!</p>
                <p className="text-ink-400 mt-2 text-sm">
                  Your path: <span className="font-medium">Kana → Vocabulary → Conversation → Immersion</span>
                </p>
              </div>
              <div className="card text-left space-y-2">
                {[
                  'Start with Kana Study — hiragana first',
                  'Do 10 vocabulary cards per day',
                  'Have your first conversation with Sakura',
                ].map((s, i) => (
                  <p key={i} className="text-ink-300 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sakura/15 text-sakura text-xs flex items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    {s}
                  </p>
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
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step >= i ? 'bg-sakura' : 'bg-border'
            }`} />
          ))}
        </div>
      )}
    </div>
  )
}
