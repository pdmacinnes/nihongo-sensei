import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Anthropic from '@anthropic-ai/sdk'
import toast from 'react-hot-toast'
import { useStore } from '../store'
import { VOCAB_DATA } from '../lib/vocab-data'

const SCENARIOS = [
  { id: 'free', label: '自由会話', labelEn: 'Free Chat', desc: 'Open conversation on any topic', icon: '💬' },
  { id: 'restaurant', label: 'レストラン', labelEn: 'Restaurant', desc: 'Ordering food and drinks', icon: '🍜' },
  { id: 'shopping', label: '買い物', labelEn: 'Shopping', desc: 'Buying things at a store', icon: '🛍️' },
  { id: 'directions', label: '道案内', labelEn: 'Directions', desc: 'Asking for and giving directions', icon: '🗺️' },
  { id: 'introduction', label: '自己紹介', labelEn: 'Introduction', desc: 'Introducing yourself', icon: '🤝' },
  { id: 'weather', label: '天気', labelEn: 'Weather', desc: 'Talking about the weather', icon: '🌸' },
  { id: 'hobby', label: '趣味', labelEn: 'Hobbies', desc: 'Discussing hobbies and interests', icon: '🎨' },
  { id: 'business', label: 'ビジネス', labelEn: 'Business', desc: 'Professional office situations', icon: '💼' },
]

const LEVELS = [
  { id: 'N5', label: 'N5 Beginner', desc: 'Simple words and basic phrases' },
  { id: 'N4', label: 'N4 Elementary', desc: 'Everyday topics, basic grammar' },
  { id: 'N3', label: 'N3 Intermediate', desc: 'Natural conversation, varied grammar' },
  { id: 'N2', label: 'N2 Upper Int.', desc: 'Complex sentences, more kanji' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  japanese: string
  translation?: string
  corrections?: string
  timestamp: number
  streaming?: boolean
  isOpening?: boolean
}

function VocabMiningChips({ japanese, vocabCards, onAdd }: {
  japanese: string
  vocabCards: { wordId: string }[]
  onAdd: (wordId: string, japanese: string) => void
}) {
  const addable = useMemo(() => {
    const found = VOCAB_DATA.filter(w => japanese.includes(w.japanese))
    return found.filter(w => !vocabCards.find(c => c.wordId === w.id))
  }, [japanese, vocabCards])

  if (addable.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {addable.slice(0, 4).map(w => (
        <button
          key={w.id}
          onClick={() => onAdd(w.id, w.japanese)}
          className="text-xs px-2 py-0.5 rounded-full border border-jade/30 text-jade bg-jade/5
                     hover:bg-jade/15 transition-all flex items-center gap-1"
          title={`Add "${w.english}" to your vocab deck`}
        >
          + <span className="japanese-text">{w.japanese}</span>
        </button>
      ))}
      {addable.length > 4 && (
        <span className="text-xs text-ink-400 py-0.5">+{addable.length - 4} more</span>
      )}
    </div>
  )
}

function buildSystemPrompt(scenario: string, level: string): string {
  const scenarioDesc = SCENARIOS.find(s => s.id === scenario)
  return `You are Sakura (桜先生), a warm, patient, and encouraging Japanese language teacher. You genuinely care about helping your student learn Japanese and feel confident speaking it.

CURRENT SCENARIO: ${scenarioDesc?.labelEn ?? 'Free conversation'} — ${scenarioDesc?.desc ?? 'Chat about anything'}
STUDENT LEVEL: JLPT ${level}

HOW TO RESPOND:

1. JAPANESE RESPONSE: Write your conversational reply in Japanese. Adjust complexity to JLPT ${level}:
   - N5: Very simple sentences, hiragana/katakana, basic kanji with furigana
   - N4: Short sentences, common kanji with furigana for harder ones
   - N3: Natural sentences, moderate kanji, some complex grammar
   - N2: Natural speech, varied grammar, kanji without furigana except rare ones

   For kanji harder than the student's level, add furigana in parentheses: 日本語(にほんご)
   Stay in character for the scenario. Be warm and encouraging!

2. ENGLISH SUMMARY: After your Japanese, add "---" on its own line, then a natural English translation/summary of what you said.

3. CORRECTIONS: Then add "CORRECTIONS:" followed by:
   - If the student made grammar or vocabulary mistakes: List each mistake clearly with: the error → the correct form → brief explanation
   - If no mistakes: Write "None! とても上手(じょうず)です！"
   - If the student wrote in romaji: Gently encourage hiragana/katakana instead, and show the kana version
   - Include a tip about Japanese culture or language if relevant

FORMAT EXAMPLE:
[Your Japanese reply here]

---
[English translation here]

CORRECTIONS:
[corrections or "None! とても上手です！"]

Be concise. Don't make the response too long. Keep it conversational and fun!`
}

function parseResponse(raw: string): { japanese: string; translation: string; corrections: string } {
  const parts = raw.split(/\n---\n/)
  const japanese = (parts[0] || raw).trim()
  const rest = parts[1] || ''
  const corrIdx = rest.indexOf('CORRECTIONS:')
  const translation = corrIdx >= 0 ? rest.slice(0, corrIdx).trim() : rest.trim()
  const corrections = corrIdx >= 0 ? rest.slice(corrIdx + 12).trim() : ''
  return { japanese, translation, corrections }
}

export default function Conversation() {
  const [phase, setPhase] = useState<'setup' | 'chat'>('setup')
  const [selectedScenario, setSelectedScenario] = useState('free')
  const [selectedLevel, setSelectedLevel] = useState('N5')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showCorrections, setShowCorrections] = useState<string | null>(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const { jlptLevel, apiKey, startConversation, addMessage, endConversation, addXP, addVocabCard, vocabCards } = useStore()

  useEffect(() => {
    setSelectedLevel(jlptLevel)
  }, [jlptLevel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startChat = useCallback(() => {
    startConversation(selectedScenario, selectedLevel)
    setMessages([])
    setPhase('chat')

    // Opening message from Sakura
    const scenario = SCENARIOS.find(s => s.id === selectedScenario)
    const openings: Record<string, { jp: string; en: string }> = {
      free: { jp: 'こんにちは！今日は何について話しましょうか？どんなことでも聞いてください！', en: 'Hello! What shall we talk about today? Feel free to ask me anything!' },
      restaurant: { jp: 'いらっしゃいませ！ご注文はお決まりですか？', en: 'Welcome! Have you decided on your order?' },
      shopping: { jp: 'いらっしゃいませ！何かお探しですか？', en: 'Welcome! Are you looking for something?' },
      directions: { jp: 'すみません、どちらへ行きたいですか？', en: 'Excuse me, where would you like to go?' },
      introduction: { jp: 'はじめまして！私は桜です。あなたのお名前は何ですか？', en: 'Nice to meet you! I\'m Sakura. What\'s your name?' },
      weather: { jp: '今日はいい天気(てんき)ですね！外に出かけましたか？', en: 'The weather is nice today! Have you gone out?' },
      hobby: { jp: '趣味(しゅみ)について話しましょう！あなたは何が好きですか？', en: 'Let\'s talk about hobbies! What do you like?' },
      business: { jp: 'お疲(つか)れ様(さま)です。今日の会議(かいぎ)の準備(じゅんび)はできましたか？', en: 'Good work. Are you ready for today\'s meeting?' },
    }
    const opening = openings[selectedScenario] || openings.free

    const welcomeMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      japanese: opening.jp,
      translation: opening.en,
      corrections: '',
      timestamp: Date.now(),
      isOpening: true,
    }
    setMessages([welcomeMsg])
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [selectedScenario, selectedLevel, startConversation])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userText = input.trim()
    setInput('')
    setError('')

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      japanese: userText,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])

    const streamingId = `msg_stream_${Date.now()}`
    const streamingMsg: Message = {
      id: streamingId,
      role: 'assistant',
      japanese: '',
      timestamp: Date.now(),
      streaming: true,
    }
    setMessages(prev => [...prev, streamingMsg])
    setIsStreaming(true)

    try {
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      })

      const history = messages
        .filter(m => !m.streaming && !m.isOpening)
        .slice(-10)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.role === 'assistant'
            ? `${m.japanese}\n\n---\n${m.translation}\n\nCORRECTIONS:\n${m.corrections}`
            : m.japanese,
        }))

      history.push({ role: 'user', content: userText })

      abortRef.current = new AbortController()
      let fullText = ''

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: buildSystemPrompt(selectedScenario, selectedLevel),
        messages: history,
      }, { signal: abortRef.current.signal })

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text
          const parsed = parseResponse(fullText)
          setMessages(prev => prev.map(m =>
            m.id === streamingId
              ? { ...m, japanese: parsed.japanese, translation: parsed.translation, corrections: parsed.corrections }
              : m
          ))
        }
      }

      // Finalize
      const parsed = parseResponse(fullText)
      setMessages(prev => prev.map(m =>
        m.id === streamingId
          ? { ...m, ...parsed, streaming: false }
          : m
      ))

      addMessage({ role: 'user', content: userText })
      addMessage({ role: 'assistant', content: fullText })
      addXP(10)
      toast('+10 XP', { icon: '⭐', style: { background: '#fdf4e7', color: '#b07d1a', fontWeight: 600 }, duration: 1500 })

    } catch (e: unknown) {
      const err = e as Error
      if (err.name === 'AbortError') return
      const errMsg = err.message?.includes('401')
        ? 'Invalid API key. Check your settings.'
        : err.message?.includes('insufficient_quota')
        ? 'API quota exceeded.'
        : `Error: ${err.message}`
      setError(errMsg)
      setMessages(prev => prev.filter(m => m.id !== streamingId))
    } finally {
      setIsStreaming(false)
    }
  }, [input, isStreaming, messages, selectedScenario, selectedLevel, addMessage, addXP])

  const stopStream = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const endChat = () => {
    endConversation()
    toast.success('+25 XP — conversation complete! 💬', { duration: 3000 })
    setPhase('setup')
    setMessages([])
    setShowCorrections(null)
  }

  return (
    <div className="h-screen flex flex-col">
      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full"
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-6xl mb-4"
              >
                🌸
              </motion.div>
              <h1 className="text-3xl font-bold text-ink-100 mb-1">Chat with Sakura</h1>
              <p className="text-ink-400">桜先生 · Your AI Japanese tutor</p>
            </div>

            {/* Scenario picker */}
            <div className="mb-6">
              <h2 className="text-ink-200 font-semibold mb-3">Choose a scenario</h2>
              <div className="grid grid-cols-2 gap-3">
                {SCENARIOS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenario(s.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 shadow-card ${
                      selectedScenario === s.id
                        ? 'border-sakura bg-sakura/8 shadow-sakura'
                        : 'border-border bg-white hover:border-border-light hover:shadow-card-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className={`font-medium text-sm ${selectedScenario === s.id ? 'text-sakura' : 'text-ink-100'}`}>
                          <span className="japanese-text">{s.label}</span> — {s.labelEn}
                        </p>
                        <p className="text-ink-400 text-xs mt-0.5">{s.desc}</p>
                      </div>
                      {selectedScenario === s.id && <span className="ml-auto text-sakura">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Level picker */}
            <div className="mb-8">
              <h2 className="text-ink-200 font-semibold mb-3">Difficulty level</h2>
              <div className="grid grid-cols-4 gap-3">
                {LEVELS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLevel(l.id)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                      selectedLevel === l.id
                        ? 'border-sakura bg-sakura/10'
                        : 'border-border bg-bg-card hover:border-border-light'
                    }`}
                  >
                    <p className={`text-xl font-bold mb-1 ${selectedLevel === l.id ? 'text-sakura' : 'text-ink-200'}`}>
                      {l.id}
                    </p>
                    <p className="text-ink-300 text-xs font-medium">{l.label.split(' ')[1]}</p>
                    <p className="text-ink-400 text-xs mt-1 leading-tight">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startChat}
              className="w-full btn-primary py-4 text-lg"
            >
              <span className="japanese-text">始めましょう！</span> Start Conversation
            </button>
          </motion.div>
        )}

        {phase === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-white shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sakura/20 border border-sakura/30 flex items-center justify-center text-lg">
                  🌸
                </div>
                <div>
                  <p className="text-ink-100 font-medium text-sm">Sakura 桜先生</p>
                  <p className="text-ink-400 text-xs">
                    {SCENARIOS.find(s => s.id === selectedScenario)?.labelEn} · {selectedLevel}
                    {isStreaming && <span className="text-jade animate-pulse ml-1">· typing...</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-400 text-xs">{messages.filter(m => m.role === 'user').length} exchanges</span>
                <button
                  onClick={endChat}
                  className="btn-ghost text-sm text-sakura hover:text-sakura-bright"
                >
                  End session
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-primary">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-sakura/20 border border-sakura/30 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                      🌸
                    </div>
                  )}

                  <div className="max-w-[75%] space-y-1">
                    <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                      <p className={`japanese-text text-base leading-relaxed ${
                        msg.streaming ? 'streaming-cursor' : ''
                      }`}>
                        {msg.japanese || (msg.streaming ? '' : '...')}
                      </p>

                      {/* Translation toggle */}
                      {msg.role === 'assistant' && msg.translation && !msg.streaming && (
                        <details className="mt-2">
                          <summary className="text-ink-400 text-xs cursor-pointer hover:text-ink-300 select-none list-none flex items-center gap-1">
                            <span>▶</span> Show translation
                          </summary>
                          <p className="text-ink-300 text-sm mt-1 pl-3 border-l border-border">{msg.translation}</p>
                        </details>
                      )}
                    </div>

                    {/* Corrections button */}
                    {msg.role === 'assistant' && msg.corrections && !msg.streaming && (
                      <button
                        onClick={() => setShowCorrections(
                          showCorrections === msg.id ? null : msg.id
                        )}
                        className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                          msg.corrections.startsWith('None')
                            ? 'border-jade/30 text-jade hover:bg-jade/10'
                            : 'border-gold/30 text-gold hover:bg-gold/10'
                        }`}
                      >
                        {msg.corrections.startsWith('None')
                          ? '✓ No mistakes!'
                          : '📝 View corrections'}
                      </button>
                    )}

                    {/* Corrections panel */}
                    <AnimatePresence>
                      {showCorrections === msg.id && msg.corrections && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 text-sm">
                            <p className="text-gold font-medium text-xs mb-2">📝 Sakura's Notes</p>
                            <p className="text-ink-200 whitespace-pre-wrap leading-relaxed">{msg.corrections}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sentence mining: vocab words found in AI message */}
                    {msg.role === 'assistant' && !msg.streaming && msg.japanese && (
                      <VocabMiningChips
                        japanese={msg.japanese}
                        vocabCards={vocabCards}
                        onAdd={(wordId, jp) => { addVocabCard(wordId); toast.success(`Added ${jp} to deck`, { duration: 1500 }) }}
                      />
                    )}

                    <p className="text-ink-500 text-xs px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {error && (
                <div className="flex justify-center">
                  <div className="bg-sakura/10 border border-sakura/30 rounded-xl px-4 py-3 text-sakura text-sm max-w-md">
                    ⚠️ {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Tips bar */}
            <div className="px-5 py-1.5 border-t border-border bg-bg-secondary flex-shrink-0">
              <p className="text-ink-400 text-xs text-center">
                💡 Use your OS Japanese IME to type in hiragana/katakana · Shift+Enter for new line
              </p>
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-border bg-white flex-shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    className="input-field resize-none min-h-[52px] max-h-36 leading-relaxed pr-12 japanese-text"
                    placeholder="日本語で話しましょう... (Type in Japanese or English)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ height: 'auto' }}
                    onInput={e => {
                      const t = e.target as HTMLTextAreaElement
                      t.style.height = 'auto'
                      t.style.height = Math.min(t.scrollHeight, 144) + 'px'
                    }}
                  />
                </div>

                {isStreaming ? (
                  <button
                    onClick={stopStream}
                    className="h-12 w-12 rounded-xl bg-sakura/20 border border-sakura/40 text-sakura flex items-center justify-center hover:bg-sakura/30 transition-colors flex-shrink-0"
                  >
                    ■
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="h-12 w-12 rounded-xl bg-sakura text-white flex items-center justify-center
                               hover:bg-sakura-bright transition-colors flex-shrink-0
                               disabled:opacity-40 disabled:cursor-not-allowed
                               active:scale-95"
                  >
                    ↑
                  </button>
                )}
              </div>

              {/* Quick phrases */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  { jp: 'もう一度お願いします', en: 'Please repeat' },
                  { jp: 'わかりません', en: 'I don\'t understand' },
                  { jp: 'どういう意味ですか？', en: 'What does that mean?' },
                  { jp: 'ゆっくり話してください', en: 'Please speak slowly' },
                ].map(phrase => (
                  <button
                    key={phrase.jp}
                    onClick={() => setInput(phrase.jp)}
                    className="text-xs px-2 py-1 rounded-lg border border-border text-ink-400
                               hover:border-sakura/30 hover:text-ink-200 transition-all"
                    title={phrase.en}
                  >
                    {phrase.jp}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
