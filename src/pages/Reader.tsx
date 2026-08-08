import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import toast from 'react-hot-toast'
import { useStore, READER_JAPANESE_RE, READER_CHAR_CAP } from '../store'
import { preloadTokenizer, Token } from '../lib/tokenizer'
import { preloadDictionary, lookupWord, lookupFrequency } from '../lib/dictionary'
import { VOCAB_DATA } from '../lib/vocab-data'
import { matchGrammarPatterns } from '../lib/grammar-data'

interface WordInfo {
  gloss: string
  frequency: string | null
  contextDependent: boolean
  contextNote: string | null
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

const FREQUENCY_STYLES: Record<string, string> = {
  'very common': 'bg-jade/10 text-jade border-jade/25',
  'common': 'bg-blue-50 text-blue-600 border-blue-200',
  'uncommon': 'bg-gold/10 text-gold border-gold/25',
  'rare': 'bg-sakura/10 text-sakura border-sakura/25',
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`
}

function formatSessionDate(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return isToday ? `Today, ${time}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

function TokenSpan({ token, onClick }: { token: Token; onClick: () => void }) {
  if (!token.surface.trim()) return <span>{token.surface}</span>
  const clickable = 'cursor-pointer hover:bg-sakura/10 rounded transition-colors px-0.5 -mx-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sakura/50'
  const activate = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }
  if (token.hasKanji && token.reading) {
    return (
      <ruby
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={activate}
        className={clickable}
        aria-label={`Look up ${token.surface}`}
      >
        {token.surface}
        <rt className="text-[0.55em] text-ink-400">{token.reading}</rt>
      </ruby>
    )
  }
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={activate}
      className={clickable}
      aria-label={`Look up ${token.surface}`}
    >
      {token.surface}
    </span>
  )
}

export default function Reader() {
  const {
    apiKey, jlptLevel, customWords, addCustomWord,
    startReaderSession, updateReaderSession, readerSessions,
    readerLines: lines, readerCaptureOn: captureOn, setReaderCaptureOn: setCaptureOn,
    readerPendingOverflow: pendingOverflow, readerNewWordsAdded: newWordsAdded, incrementReaderNewWordsAdded,
    readerSessionId, readerSessionStart,
    addReaderText, loadMoreReaderOverflow,
  } = useStore()

  const [input, setInput] = useState('')
  const [tokenizerReady, setTokenizerReady] = useState(false)
  const [tokenizerError, setTokenizerError] = useState(false)
  const [activeWord, setActiveWord] = useState<{ lineText: string; token: Token } | null>(null)
  const [currentInfo, setCurrentInfo] = useState<WordInfo | null>(null)
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoCache, setInfoCache] = useState<Record<string, WordInfo>>({})
  const [now, setNow] = useState(Date.now())
  const [showCaptureHelp, setShowCaptureHelp] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI

  useEffect(() => {
    // readerSessionId lives in the store, not a local ref, so this only ever creates
    // one session — remounting this page (e.g. after switching tabs) won't start another.
    if (!useStore.getState().readerSessionId) {
      startReaderSession('manual')
    }
    preloadTokenizer()
      .then(() => setTokenizerReady(true))
      .catch(() => setTokenizerError(true))
    // Fired independently — word lookups await this internally when needed, but it
    // shouldn't hold up tokenization/pasting, which doesn't need the dictionary at all.
    preloadDictionary().catch(() => {})
  }, [startReaderSession])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(t)
  }, [])

  const stats = useMemo(() => {
    const charsRead = lines.reduce((sum, l) => sum + l.text.length, 0)
    const uniqueWords = new Set<string>()
    lines.forEach(l => l.tokens?.forEach(t => {
      if (READER_JAPANESE_RE.test(t.surface)) uniqueWords.add(t.basicForm)
    }))
    const elapsedMs = now - (readerSessionStart || now)
    const elapsedMin = Math.max(elapsedMs / 60000, 1 / 60)
    return {
      charsRead,
      uniqueWordIds: Array.from(uniqueWords),
      linesRead: lines.length,
      elapsedMs,
      speed: Math.round(charsRead / elapsedMin),
    }
  }, [lines, now, readerSessionStart])

  const matchedGrammar = useMemo(() => {
    if (!activeWord) return []
    return matchGrammarPatterns(activeWord.lineText)
  }, [activeWord])

  const pastSessions = useMemo(() => {
    return [...readerSessions]
      .filter(rs => rs.id !== readerSessionId)
      .sort((a, b) => b.startedAt - a.startedAt)
  }, [readerSessions, readerSessionId])

  useEffect(() => {
    if (!readerSessionId) return
    updateReaderSession(readerSessionId, {
      linesRead: stats.linesRead,
      charsRead: stats.charsRead,
      uniqueWordIds: stats.uniqueWordIds,
      newWordsAdded,
    })
  }, [stats.linesRead, stats.charsRead, stats.uniqueWordIds.length, newWordsAdded, updateReaderSession, readerSessionId])

  const handleSubmit = () => {
    if (!tokenizerReady) return
    addReaderText(input)
    setInput('')
    if (useStore.getState().readerPendingOverflow) {
      toast(`Loaded first ${READER_CHAR_CAP.toLocaleString()} characters — click "Load more" to continue`, { icon: '📄' })
    }
  }

  const loadMore = () => {
    loadMoreReaderOverflow()
    if (useStore.getState().readerPendingOverflow) {
      toast(`Loaded next ${READER_CHAR_CAP.toLocaleString()} characters — click "Load more" to continue`, { icon: '📄' })
    }
  }

  // Priority: your own curated words -> bundled offline JMdict -> AI (only for words
  // neither of the above has — VN slang, proper nouns, etc). Frequency is always checked
  // locally first regardless of where the gloss came from, since the bundled BCCWJ-based
  // data is more consistent than an AI guess; AI's frequency guess is only a last resort.
  const resolveLocalInfo = useCallback(async (token: Token): Promise<WordInfo | null> => {
    const curated = [...VOCAB_DATA, ...customWords].find(w => w.japanese === token.basicForm || w.japanese === token.surface)
    const localFreq = await lookupFrequency(token.basicForm).catch(() => null)

    if (curated) {
      return { gloss: curated.english, frequency: localFreq, contextDependent: false, contextNote: null }
    }

    const dictResult = await lookupWord(token.basicForm, token.reading).catch(() => null)
    if (dictResult) {
      return {
        gloss: dictResult.gloss,
        frequency: localFreq,
        contextDependent: dictResult.contextDependent,
        contextNote: null,
      }
    }

    return null
  }, [customWords])

  const fetchAiWordInfo = useCallback(async (token: Token): Promise<WordInfo | null> => {
    if (!apiKey) return null
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const resp = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        messages: [{ role: 'user', content: `For the Japanese word "${token.basicForm}" (reading: ${token.reading}), respond in exactly this format and nothing else:
GLOSS: <short English gloss, 1-6 words, no trailing punctuation>
FREQUENCY: <one of: very common, common, uncommon, rare — how often this word is used in everyday Japanese speech>
CONTEXT_DEPENDENT: <yes or no — yes if the meaning or nuance changes significantly depending on context>
CONTEXT_NOTE: <if yes, a short note under 15 words on what changes; if no, leave this blank>` }],
      })
      const block = resp.content[0]
      const text = block?.type === 'text' ? block.text : ''
      const gloss = /GLOSS:\s*(.+)/.exec(text)?.[1]?.trim() ?? ''
      const frequency = /FREQUENCY:\s*(.+)/.exec(text)?.[1]?.trim().toLowerCase() ?? null
      const contextDependent = /CONTEXT_DEPENDENT:\s*(yes)/i.test(text)
      const contextNote = /CONTEXT_NOTE:\s*(.+)/.exec(text)?.[1]?.trim() || null
      if (!gloss) return null
      return { gloss, frequency, contextDependent, contextNote: contextDependent ? contextNote : null }
    } catch {
      return null
    }
  }, [apiKey])

  useEffect(() => {
    if (!activeWord) { setCurrentInfo(null); return }
    const cached = infoCache[activeWord.token.basicForm]
    if (cached) { setCurrentInfo(cached); return }

    setCurrentInfo(null)
    setInfoLoading(true)
    let cancelled = false

    resolveLocalInfo(activeWord.token).then(async local => {
      if (cancelled) return
      if (local) {
        setCurrentInfo(local)
        setInfoCache(prev => ({ ...prev, [activeWord.token.basicForm]: local }))
        setInfoLoading(false)
        return
      }
      const aiInfo = await fetchAiWordInfo(activeWord.token)
      if (cancelled) return
      if (!aiInfo) { setInfoLoading(false); return }
      const localFreq = await lookupFrequency(activeWord.token.basicForm).catch(() => null)
      const info = localFreq ? { ...aiInfo, frequency: localFreq } : aiInfo
      setCurrentInfo(info)
      setInfoCache(prev => ({ ...prev, [activeWord.token.basicForm]: info }))
      setInfoLoading(false)
    })

    return () => { cancelled = true }
  }, [activeWord, infoCache, resolveLocalInfo, fetchAiWordInfo])

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
      english: currentInfo?.gloss || '(no definition found)',
      sentenceJp: lineText,
      sentenceEn: '',
      level: jlptLevel,
      category: 'vn-reader',
      pos: POS_LABELS[token.pos] ?? token.pos,
      frequency: currentInfo?.frequency ?? undefined,
      contextNote: currentInfo?.contextDependent ? (currentInfo.contextNote ?? undefined) : undefined,
    })
    incrementReaderNewWordsAdded()
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

      {pastSessions.length > 0 && (
        <div className="card mb-5">
          <button
            onClick={() => setShowHistory(v => !v)}
            className="text-xs text-sakura font-medium flex items-center gap-1"
          >
            {showHistory ? '▲ Hide' : '▼ Show'} reading history ({pastSessions.length} session{pastSessions.length === 1 ? '' : 's'})
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border overflow-hidden"
              >
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {pastSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-bg-primary">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">{session.source === 'capture' ? '🎮' : '📋'}</span>
                        <div className="min-w-0">
                          <p className="text-ink-200 font-medium truncate">{formatSessionDate(session.startedAt)}</p>
                          <p className="text-ink-400 text-xs">{formatDuration(session.updatedAt - session.startedAt)} · {session.source === 'capture' ? 'Capture Mode' : 'Manual paste'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-400 flex-shrink-0">
                        <span>{session.charsRead.toLocaleString()} chars</span>
                        <span>{session.uniqueWordIds.length} words</span>
                        {session.newWordsAdded > 0 && <span className="text-jade font-medium">+{session.newWordsAdded}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Capture Mode */}
      {isElectron && (
        <div className="card mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-200 text-sm font-medium">Capture Mode</p>
              <p className="text-ink-400 text-xs">Auto-pull new text copied by Textractor's clipboard extension — keeps running even if you switch tabs</p>
            </div>
            <button
              onClick={() => setCaptureOn(!captureOn)}
              disabled={!tokenizerReady}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-40 flex-shrink-0 ml-3 ${captureOn ? 'bg-jade' : 'bg-ink-500'}`}
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
                <p><span className="font-semibold text-ink-200">4.</span> Turn on Capture Mode above. New lines appear here as you play, newest on top. If your VN has a translation patch and Textractor is hooked to both the Japanese and English text, the English will attach automatically as each line's translation — no extra step needed.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Input */}
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

      {/* Lines feed — newest on top */}
      <div className="space-y-3">
        {pendingOverflow && (
          <button onClick={loadMore} className="btn-secondary w-full py-3">
            Load more ({pendingOverflow.length.toLocaleString()} characters remaining)
          </button>
        )}
        {lines.map(line => (
          <motion.div key={line.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="card">
            <p className="japanese-text text-lg leading-loose text-ink-100">
              {line.tokens
                ? line.tokens.map((t, i) => (
                    <TokenSpan key={i} token={t} onClick={() => setActiveWord({ lineText: line.text, token: t })} />
                  ))
                : line.text}
            </p>
            {line.translation && (
              <p className="text-ink-400 text-sm italic mt-2 pt-2 border-t border-border">{line.translation}</p>
            )}
          </motion.div>
        ))}
        {lines.length === 0 && !pendingOverflow && (
          <div className="text-center text-ink-400 text-sm py-10">
            No text yet — paste something above to get started.
          </div>
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
              <div className="bg-bg-primary rounded-xl p-3 mb-3 min-h-[3rem] flex items-center justify-center text-center">
                {currentInfo?.gloss ? (
                  <span className="text-ink-200">{currentInfo.gloss}</span>
                ) : infoLoading ? (
                  <span className="text-ink-400 text-sm">Looking up…</span>
                ) : (
                  <span className="text-ink-200">{apiKey ? 'No definition found' : 'Set an API key in Settings for lookups'}</span>
                )}
              </div>
              {(currentInfo?.frequency || currentInfo?.contextDependent) && (
                <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                  {currentInfo.frequency && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${FREQUENCY_STYLES[currentInfo.frequency] ?? 'bg-bg-primary text-ink-400 border-border'}`}>
                      {currentInfo.frequency}
                    </span>
                  )}
                  {currentInfo.contextDependent && (
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-gold/10 text-gold border-gold/25">
                      ⚠ Context-dependent
                    </span>
                  )}
                </div>
              )}
              {currentInfo?.contextDependent && currentInfo.contextNote && (
                <p className="text-ink-400 text-xs text-center mb-4">{currentInfo.contextNote}</p>
              )}
              {matchedGrammar.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                  {matchedGrammar.map(g => (
                    <Link
                      key={g.id}
                      to="/grammar"
                      onClick={() => setActiveWord(null)}
                      className="text-xs px-2 py-0.5 rounded-full border font-medium bg-jade/10 text-jade border-jade/25 japanese-text hover:bg-jade/20 transition-colors"
                    >
                      文法: {g.pattern}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-4">
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
