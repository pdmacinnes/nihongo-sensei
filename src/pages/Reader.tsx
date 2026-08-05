import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Anthropic from '@anthropic-ai/sdk'
import toast from 'react-hot-toast'
import { useStore } from '../store'
import { tokenize, preloadTokenizer, Token } from '../lib/tokenizer'
import { VOCAB_DATA } from '../lib/vocab-data'

interface ReaderLine {
  id: string
  text: string
  tokens: Token[] | null
  translation: string | null
  translating: boolean
}

const POS_LABELS: Record<string, string> = {
  '名詞': 'noun',
  '動詞': 'verb',
  '形容詞': 'adjective',
  '形容動詞': 'na-adjective',
  '副詞': 'adverb',
  '助詞': 'particle',
  '助動詞': 'auxiliary verb',
  '連体詞': 'adnominal',
  '接続詞': 'conjunction',
  '感動詞': 'interjection',
  '記号': 'symbol',
  'フィラー': 'filler',
}

const JAPANESE_RE = /[぀-ヿ一-鿿]/
const CHAR_CAP = 2000

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`
}

function TokenSpan({ token, onClick }: { token: Token; onClick: () => void }) {
  if (!token.surface.trim()) return <span>{token.surface}</span>
  const clickable = 'cursor-pointer hover:bg-sakura/10 rounded transition-colors px-0.5 -mx-0.5'
  if (token.hasKanji && token.reading) {
    return (
      <ruby onClick={onClick} className={clickable}>
        {token.surface}
        <rt className="text-[0.55em] text-ink-400">{token.reading}</rt>
      </ruby>
    )
  }
  return <span onClick={onClick} className={clickable}>{token.surface}</span>
}

export default function Reader() {
  const { apiKey, jlptLevel, customWords, addCustomWord, startReaderSession, updateReaderSession } = useStore()
  const [lines, setLines] = useState<ReaderLine[]>([])
  const [input, setInput] = useState('')
  const [pendingOverflow, setPendingOverflow] = useState<string | null>(null)
  const [tokenizerReady, setTokenizerReady] = useState(false)
  const [tokenizerError, setTokenizerError] = useState(false)
  const [activeWord, setActiveWord] = useState<{ lineText: string; token: Token } | null>(null)
  const [currentGloss, setCurrentGloss] = useState<string | null>(null)
  const [glossLoading, setGlossLoading] = useState(false)
  const [glossCache, setGlossCache] = useState<Record<string, string>>({})
  const [newWordsAdded, setNewWordsAdded] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [captureOn, setCaptureOn] = useState(false)
  const [showCaptureHelp, setShowCaptureHelp] = useState(false)

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI
  const startedRef = useRef(false)
  const sessionIdRef = useRef<string | null>(null)
  const sessionStartRef = useRef(Date.now())

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    sessionStartRef.current = Date.now()
    sessionIdRef.current = startReaderSession('manual')
    preloadTokenizer()
      .then(() => setTokenizerReady(true))
      .catch(() => setTokenizerError(true))
  }, [startReaderSession])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(t)
  }, [])

  const stats = useMemo(() => {
    const charsRead = lines.reduce((sum, l) => sum + l.text.length, 0)
    const uniqueWords = new Set<string>()
    lines.forEach(l => l.tokens?.forEach(t => {
      if (JAPANESE_RE.test(t.surface)) uniqueWords.add(t.basicForm)
    }))
    const elapsedMs = now - sessionStartRef.current
    const elapsedMin = Math.max(elapsedMs / 60000, 1 / 60)
    return {
      charsRead,
      uniqueWordIds: Array.from(uniqueWords),
      linesRead: lines.length,
      elapsedMs,
      speed: Math.round(charsRead / elapsedMin),
    }
  }, [lines, now])

  useEffect(() => {
    if (!sessionIdRef.current) return
    updateReaderSession(sessionIdRef.current, {
      linesRead: stats.linesRead,
      charsRead: stats.charsRead,
      uniqueWordIds: stats.uniqueWordIds,
      newWordsAdded,
    })
  }, [stats.linesRead, stats.charsRead, stats.uniqueWordIds.length, newWordsAdded, updateReaderSession])

  const addLines = useCallback(async (raw: string) => {
    const rawLines = raw.split('\n').map(l => l.trim()).filter(Boolean)
    if (rawLines.length === 0) return

    // Cap how much we tokenize in one go so pasting a whole chapter doesn't lock up the UI.
    let charCount = 0
    let cutoff = rawLines.length
    for (let i = 0; i < rawLines.length; i++) {
      charCount += rawLines[i].length
      if (charCount > CHAR_CAP) { cutoff = i; break }
    }
    const toProcess = rawLines.slice(0, Math.max(cutoff, 1))
    const overflow = rawLines.slice(toProcess.length)

    for (const text of toProcess) {
      const id = `ln_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      setLines(prev => [...prev, { id, text, tokens: null, translation: null, translating: false }])
      try {
        const tokens = await tokenize(text)
        setLines(prev => prev.map(l => l.id === id ? { ...l, tokens } : l))
      } catch {
        toast.error('Failed to tokenize a line')
      }
    }

    if (overflow.length > 0) {
      setPendingOverflow(overflow.join('\n'))
      toast(`Loaded first ${CHAR_CAP.toLocaleString()} characters — click "Load more" below to continue`, { icon: '📄' })
    }
  }, [])

  const loadMore = () => {
    if (!pendingOverflow) return
    const next = pendingOverflow
    setPendingOverflow(null)
    addLines(next)
  }

  const handleSubmit = () => {
    if (!tokenizerReady) return
    addLines(input)
    setInput('')
  }

  useEffect(() => {
    if (!isElectron || !captureOn || !tokenizerReady) return
    window.electronAPI!.startCapture()
    const unsubscribe = window.electronAPI!.onCaptureText(text => addLines(text))
    return () => {
      unsubscribe()
      window.electronAPI!.stopCapture()
    }
  }, [isElectron, captureOn, tokenizerReady, addLines])

  const translateLine = async (line: ReaderLine) => {
    if (!apiKey) { toast.error('Set your Anthropic API key in Settings first'); return }
    setLines(prev => prev.map(l => l.id === line.id ? { ...l, translating: true } : l))
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const resp = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: `Translate this Japanese line to natural English. Respond with only the translation, nothing else:\n\n${line.text}` }],
      })
      const block = resp.content[0]
      const text = block?.type === 'text' ? block.text.trim() : ''
      setLines(prev => prev.map(l => l.id === line.id ? { ...l, translation: text, translating: false } : l))
    } catch {
      toast.error('Translation failed')
      setLines(prev => prev.map(l => l.id === line.id ? { ...l, translating: false } : l))
    }
  }

  const findLocalGloss = useCallback((token: Token): string | null => {
    const all = [...VOCAB_DATA, ...customWords]
    const match = all.find(w => w.japanese === token.basicForm || w.japanese === token.surface)
    return match ? match.english : null
  }, [customWords])

  const fetchGloss = useCallback(async (token: Token): Promise<string | null> => {
    if (!apiKey) return null
    setGlossLoading(true)
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const resp = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 60,
        messages: [{ role: 'user', content: `Give a short English gloss (1-6 words, no explanation, no trailing punctuation) for the Japanese word "${token.basicForm}" (reading: ${token.reading}). Respond with only the gloss.` }],
      })
      const block = resp.content[0]
      const text = block?.type === 'text' ? block.text.trim() : ''
      if (text) setGlossCache(prev => ({ ...prev, [token.basicForm]: text }))
      return text || null
    } catch {
      return null
    } finally {
      setGlossLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    if (!activeWord) { setCurrentGloss(null); return }
    const local = findLocalGloss(activeWord.token)
    if (local) { setCurrentGloss(local); return }
    if (glossCache[activeWord.token.basicForm]) { setCurrentGloss(glossCache[activeWord.token.basicForm]); return }
    setCurrentGloss(null)
    let cancelled = false
    fetchGloss(activeWord.token).then(g => { if (!cancelled) setCurrentGloss(g) })
    return () => { cancelled = true }
  }, [activeWord, findLocalGloss, glossCache, fetchGloss])

  const handleAddWord = () => {
    if (!activeWord) return
    const { token, lineText } = activeWord
    const already = customWords.some(w => w.japanese === token.basicForm)
    if (already) {
      toast('Already in your deck', { icon: '✓' })
      return
    }
    addCustomWord({
      japanese: token.basicForm,
      reading: token.reading,
      english: currentGloss || '(no definition found)',
      sentenceJp: lineText,
      sentenceEn: '',
      level: jlptLevel,
      category: 'vn-reader',
      pos: POS_LABELS[token.pos] ?? token.pos,
    })
    setNewWordsAdded(n => n + 1)
    toast.success(`Added "${token.basicForm}" to your deck`)
    setActiveWord(null)
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">
          <span className="japanese-text text-sakura">読解</span> Reader
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">Paste Japanese text, tap any word, save it straight to your deck</p>
      </div>

      {/* Stats panel */}
      <div className="card mb-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div>
          <p className="text-ink-100 font-bold text-lg">{stats.charsRead}</p>
          <p className="text-ink-400 text-xs">Characters read</p>
        </div>
        <div>
          <p className="text-ink-100 font-bold text-lg">{stats.uniqueWordIds.length}</p>
          <p className="text-ink-400 text-xs">Unique words</p>
        </div>
        <div>
          <p className="text-jade font-bold text-lg">{newWordsAdded}</p>
          <p className="text-ink-400 text-xs">New words added</p>
        </div>
        <div>
          <p className="text-ink-100 font-bold text-lg">{formatDuration(stats.elapsedMs)}</p>
          <p className="text-ink-400 text-xs">{stats.speed} chars/min</p>
        </div>
      </div>

      {/* Input */}
      {isElectron && (
        <div className="card mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-200 text-sm font-medium">Capture Mode</p>
              <p className="text-ink-400 text-xs">Auto-pull new text copied by Textractor's clipboard extension</p>
            </div>
            <button
              onClick={() => setCaptureOn(v => !v)}
              disabled={!tokenizerReady}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-40 ${captureOn ? 'bg-jade' : 'bg-ink-500'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${captureOn ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>
          <button
            onClick={() => setShowCaptureHelp(v => !v)}
            className="text-xs text-sakura font-medium mt-3"
          >
            {showCaptureHelp ? '▲ Hide setup instructions' : '▼ How do I hook up a visual novel?'}
          </button>
          <AnimatePresence>
            {showCaptureHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-ink-300 text-sm mt-3 pt-3 border-t border-border space-y-2 overflow-hidden"
              >
                <p><span className="font-semibold text-ink-200">1.</span> Install <a href="https://github.com/Artikash/Textractor" target="_blank" rel="noreferrer" className="text-sakura underline">Textractor</a> (free, open-source text hooker) and launch your VN.</p>
                <p><span className="font-semibold text-ink-200">2.</span> In Textractor, attach it to your VN's process from the dropdown at the top.</p>
                <p><span className="font-semibold text-ink-200">3.</span> Open Textractor's Extensions panel and enable the <span className="font-medium text-ink-200">Clipboard</span> extension — this copies each extracted line to your clipboard automatically.</p>
                <p><span className="font-semibold text-ink-200">4.</span> Turn on Capture Mode above. New lines will appear here as you play — click any word for its reading and meaning, and save anything new straight to your deck.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="card mb-5">
        {!tokenizerReady && !tokenizerError && (
          <p className="text-ink-400 text-sm mb-2">Loading dictionary… (first load only, ~15MB)</p>
        )}
        {tokenizerError && (
          <p className="text-sakura text-sm mb-2">Dictionary failed to load. Check your connection and reopen the app.</p>
        )}
        <textarea
          className="input-field japanese-text text-base w-full resize-none"
          rows={3}
          placeholder="Paste Japanese text here — one line per sentence works best…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={!tokenizerReady}
        />
        <button
          onClick={handleSubmit}
          disabled={!tokenizerReady || !input.trim()}
          className="btn-primary w-full mt-3 disabled:opacity-40"
        >
          Add to Reader
        </button>
      </div>

      {/* Lines feed */}
      <div className="space-y-3">
        {lines.map(line => (
          <motion.div key={line.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card">
            <p className="japanese-text text-lg leading-loose text-ink-100">
              {line.tokens
                ? line.tokens.map((t, i) => (
                    <TokenSpan key={i} token={t} onClick={() => setActiveWord({ lineText: line.text, token: t })} />
                  ))
                : line.text}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <button
                onClick={() => translateLine(line)}
                disabled={line.translating}
                className="text-xs text-sakura font-medium disabled:opacity-50"
              >
                {line.translating ? 'Translating…' : line.translation ? '↻ Retranslate' : '▼ Translate'}
              </button>
            </div>
            {line.translation && (
              <p className="text-ink-400 text-sm italic mt-2">{line.translation}</p>
            )}
          </motion.div>
        ))}
        {lines.length === 0 && !pendingOverflow && (
          <div className="text-center text-ink-400 text-sm py-10">
            No text yet — paste something above to get started.
          </div>
        )}
        {pendingOverflow && (
          <button onClick={loadMore} className="btn-secondary w-full py-3">
            Load more ({pendingOverflow.length.toLocaleString()} characters remaining)
          </button>
        )}
      </div>

      {/* Word popup */}
      <AnimatePresence>
        {activeWord && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveWord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <p className="japanese-text text-3xl font-bold text-ink-100">{activeWord.token.basicForm}</p>
                {activeWord.token.reading && <p className="text-ink-400 text-sm mt-0.5">{activeWord.token.reading}</p>}
                <p className="text-ink-400 text-xs mt-1">{POS_LABELS[activeWord.token.pos] ?? activeWord.token.pos}</p>
              </div>
              <div className="bg-bg-primary rounded-xl p-3 mb-4 min-h-[3rem] flex items-center justify-center text-center">
                {glossLoading ? (
                  <span className="text-ink-400 text-sm">Looking up…</span>
                ) : (
                  <span className="text-ink-200">{currentGloss || (apiKey ? 'No definition found' : 'Set an API key in Settings for lookups')}</span>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActiveWord(null)} className="btn-secondary flex-1">Close</button>
                <button onClick={handleAddWord} className="btn-primary flex-1">+ Add to deck</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
