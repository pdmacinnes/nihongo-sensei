import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  useStore, VocabCardState, KanaProgress, WrongAnswerEntry,
  CustomVocabWord, DailyXpEntry, ConversationSession, ReaderSession,
} from '../store'
import {
  isFirebaseConfigured, initFirebase,
  generateSyncCode, uploadProgress, downloadProgress,
} from '../lib/firebase'
import { scheduleStudyReminder, clearStudyReminder } from '../lib/reminders'
import { VOCAB_DATA } from '../lib/vocab-data'
import { KANJI_DATA } from '../lib/kanji-data'
import { GRAMMAR_DATA } from '../lib/grammar-data'

export default function Settings() {
  const { username, setUsername, jlptLevel, setJlptLevel,
          dailyNewCardLimit, setDailyNewCardLimit,
          notificationsEnabled, setNotificationsEnabled,
          reminderTime, setReminderTime,
          showFurigana, setShowFurigana,
          autoTts, setAutoTts,
          darkMode, setDarkMode,
          resetAllProgress, apiKey, setApiKey,
          syncCode, setSyncCode, lastSynced, setLastSynced } = useStore()
  const [localName, setLocalName] = useState(username)
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [syncInput, setSyncInput] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [exportingAnki, setExportingAnki] = useState(false)
  const [exportingKanjiAnki, setExportingKanjiAnki] = useState(false)
  const [exportingGrammarAnki, setExportingGrammarAnki] = useState(false)
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => { setLocalName(username) }, [username])
  useEffect(() => { setLocalApiKey(apiKey) }, [apiKey])

  const getStateForSync = () => {
    const s = useStore.getState()
    const { apiKey: _a, lastVocabCardSnapshot: _l, syncCode: _sc, lastSynced: _ls, ...data } = s as any
    return data
  }

  const handleGenerateCode = () => {
    const code = generateSyncCode()
    setSyncCode(code)
    initFirebase()
    toast.success(`Sync code created: ${code}`)
  }

  const handleUpload = async () => {
    if (!syncCode) return
    setSyncing(true)
    initFirebase()
    const ok = await uploadProgress(syncCode, getStateForSync())
    setSyncing(false)
    if (ok) {
      setLastSynced(Date.now())
      toast.success('Progress uploaded to cloud ✓')
    } else {
      toast.error('Upload failed — check your connection')
    }
  }

  const handleDownload = async () => {
    const code = (syncInput.trim().toUpperCase() || syncCode)
    if (!code) return
    setSyncing(true)
    initFirebase()
    const cloud = await downloadProgress(code)
    setSyncing(false)
    if (!cloud) {
      toast.error('No data found for that sync code')
      return
    }
    const { syncCode: _sc, lastSynced: _ls, apiKey: _ak, ...rest } = cloud.state as any
    useStore.setState({ ...rest, syncCode: code, lastSynced: cloud.lastModified })
    setSyncCode(code)
    setSyncInput('')
    toast.success('Progress downloaded from cloud ✓')
  }

  const saveName = () => {
    const trimmed = localName.trim() || 'Learner'
    if (trimmed !== username) {
      setUsername(trimmed)
      setLocalName(trimmed)
      toast.success('Name saved')
    }
  }

  const saveApiKey = () => {
    if (localApiKey !== apiKey) {
      setApiKey(localApiKey.trim())
      toast.success(localApiKey.trim() ? 'API key saved' : 'API key cleared')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.username || !Array.isArray(data.vocabCards)) throw new Error('Invalid backup file')
        useStore.setState({
          username: typeof data.username === 'string' ? data.username : useStore.getState().username,
          jlptLevel: ['N5','N4','N3','N2','N1'].includes(data.jlptLevel) ? data.jlptLevel : 'N5',
          dailyNewCardLimit: typeof data.dailyNewCardLimit === 'number' ? data.dailyNewCardLimit : 10,
          streak: typeof data.streak === 'number' ? data.streak : 0,
          streakFreezes: typeof data.streakFreezes === 'number' ? data.streakFreezes : 0,
          xp: typeof data.xp === 'number' ? data.xp : 0,
          totalXp: typeof data.totalXp === 'number' ? data.totalXp : 0,
          lastStudyDate: typeof data.lastStudyDate === 'string' ? data.lastStudyDate : '',
          vocabCards: Array.isArray(data.vocabCards) ? data.vocabCards as VocabCardState[] : [],
          customWords: Array.isArray(data.customWords) ? data.customWords as CustomVocabWord[] : [],
          kanaProgress: data.kanaProgress && typeof data.kanaProgress === 'object' ? data.kanaProgress as Record<string, KanaProgress> : {},
          kanjiProgress: data.kanjiProgress && typeof data.kanjiProgress === 'object'
            ? data.kanjiProgress as Record<string, { correct: number; incorrect: number; mastered: boolean }>
            : {},
          wrongAnswerLog: Array.isArray(data.wrongAnswerLog) ? data.wrongAnswerLog as WrongAnswerEntry[] : [],
          dailyXpHistory: Array.isArray(data.dailyXpHistory) ? data.dailyXpHistory as DailyXpEntry[] : [],
          conversations: Array.isArray(data.conversations) ? data.conversations as ConversationSession[] : [],
          totalConversations: typeof data.totalConversations === 'number' ? data.totalConversations : 0,
          readerSessions: Array.isArray(data.readerSessions) ? data.readerSessions as ReaderSession[] : [],
          showFurigana: typeof data.showFurigana === 'boolean' ? data.showFurigana : true,
          autoTts: typeof data.autoTts === 'boolean' ? data.autoTts : true,
        })
        toast.success('Backup restored successfully!')
        setLocalName(typeof data.username === 'string' ? data.username : useStore.getState().username)
      } catch {
        toast.error('Invalid backup file — please use a file exported from this app.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExport = () => {
    const state = useStore.getState()
    const exportData = {
      exportedAt: new Date().toISOString(),
      username: state.username,
      jlptLevel: state.jlptLevel,
      dailyNewCardLimit: state.dailyNewCardLimit,
      streak: state.streak,
      streakFreezes: state.streakFreezes,
      xp: state.xp,
      totalXp: state.totalXp,
      lastStudyDate: state.lastStudyDate,
      vocabCards: state.vocabCards,
      customWords: state.customWords,
      kanaProgress: state.kanaProgress,
      kanjiProgress: state.kanjiProgress,
      wrongAnswerLog: state.wrongAnswerLog,
      dailyXpHistory: state.dailyXpHistory,
      conversations: state.conversations,
      totalConversations: state.totalConversations,
      readerSessions: state.readerSessions,
      showFurigana: state.showFurigana,
      autoTts: state.autoTts,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nihongo-sensei-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadApkg = (blob: Blob, filenameSuffix: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nihongo-sensei-${filenameSuffix}-${new Date().toISOString().split('T')[0]}.apkg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAnkiExport = async () => {
    const state = useStore.getState()
    const allWords = [...VOCAB_DATA, ...state.customWords]
    const words = state.vocabCards
      .map(card => allWords.find(w => w.id === card.wordId))
      .filter((w): w is typeof allWords[number] => !!w)
      .map(w => ({
        japanese: w.japanese,
        reading: w.reading,
        english: w.english,
        sentenceJp: w.sentenceJp,
        sentenceEn: w.sentenceEn,
      }))

    if (words.length === 0) {
      toast.error('Add some words to your deck first')
      return
    }

    setExportingAnki(true)
    try {
      const { buildVocabApkg } = await import('../lib/anki-export')
      const blob = await buildVocabApkg(words)
      downloadApkg(blob, 'vocab')
      toast.success(`Exported ${words.length} card${words.length === 1 ? '' : 's'} to Anki ✓`)
    } catch {
      toast.error('Anki export failed — please try again')
    } finally {
      setExportingAnki(false)
    }
  }

  const handleKanjiAnkiExport = async () => {
    const state = useStore.getState()
    const entries = KANJI_DATA.filter(k => state.kanjiProgress[k.kanji])

    if (entries.length === 0) {
      toast.error('Practice some kanji in Kanji Study first')
      return
    }

    setExportingKanjiAnki(true)
    try {
      const { buildKanjiApkg } = await import('../lib/anki-export')
      const blob = await buildKanjiApkg(entries)
      downloadApkg(blob, 'kanji')
      toast.success(`Exported ${entries.length} kanji to Anki ✓`)
    } catch {
      toast.error('Anki export failed — please try again')
    } finally {
      setExportingKanjiAnki(false)
    }
  }

  const handleGrammarAnkiExport = async () => {
    const state = useStore.getState()
    const practicedPatterns = new Set(
      state.wrongAnswerLog
        .filter(e => e.type === 'grammar' && e.grammarPattern)
        .map(e => e.grammarPattern as string)
    )
    const entries = GRAMMAR_DATA.filter(g => practicedPatterns.has(g.pattern))

    if (entries.length === 0) {
      toast.error('Practice some grammar points in Grammar Study first')
      return
    }

    setExportingGrammarAnki(true)
    try {
      const { buildGrammarApkg } = await import('../lib/anki-export')
      const blob = await buildGrammarApkg(entries)
      downloadApkg(blob, 'grammar')
      toast.success(`Exported ${entries.length} grammar point${entries.length === 1 ? '' : 's'} to Anki ✓`)
    } catch {
      toast.error('Anki export failed — please try again')
    } finally {
      setExportingGrammarAnki(false)
    }
  }

  const handleNotifications = async (enabled: boolean) => {
    if (enabled && Notification.permission === 'default') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
    }
    setNotificationsEnabled(enabled)
    if (enabled && Notification.permission === 'granted') {
      scheduleStudyReminder(reminderTime)
      toast.success(`Reminder set for ${reminderTime} daily`)
    } else {
      clearStudyReminder()
    }
  }

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time)
    if (notificationsEnabled && Notification.permission === 'granted') {
      scheduleStudyReminder(time)
      toast.success(`Reminder updated to ${time}`)
    }
  }

  const handleReset = () => {
    resetAllProgress()
    setShowResetConfirm(false)
    toast('All progress reset', { icon: '🗑️' })
  }

  const Toggle = ({
    on, onToggle, label, disabled,
  }: { on: boolean; onToggle: () => void; label: string; disabled?: boolean }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-40 ${on ? 'bg-jade' : 'bg-ink-500'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${on ? 'left-[1.625rem]' : 'left-0.5'}`} />
    </button>
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="page-title">
          <span className="japanese-text text-sakura">設定</span> Settings
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">Configure your learning experience · changes save automatically</p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>👤</span> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-ink-300 text-sm mb-1.5 block" htmlFor="settings-name">Your name</label>
              <input
                id="settings-name"
                type="text"
                className="input-field"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-ink-300 text-sm mb-1.5 block">JLPT Target Level</label>
              <div className="grid grid-cols-5 gap-2" role="group" aria-label="JLPT target level">
                {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map(l => (
                  <button key={l} type="button" onClick={() => setJlptLevel(l)}
                    aria-pressed={jlptLevel === l}
                    className={`py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      jlptLevel === l ? 'border-sakura bg-sakura/8 text-sakura shadow-sm' : 'border-border text-ink-300 hover:border-border-light bg-white'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Key */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>🔑</span> Anthropic API Key
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                className="input-field pr-20 font-mono text-sm"
                value={localApiKey}
                onChange={e => setLocalApiKey(e.target.value)}
                onBlur={saveApiKey}
                placeholder="sk-ant-..."
                aria-label="Anthropic API key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 hover:text-ink-200 transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-ink-400 text-xs leading-relaxed">
              Saved locally when you leave this field. Never sent anywhere except Anthropic.
              Get a key at <span className="text-sakura">console.anthropic.com</span>.
            </p>
            {!localApiKey && (
              <p className="text-sakura text-xs font-medium">
                No API key set — AI conversation with Sakura will not work.
              </p>
            )}
          </div>
        </motion.div>

        {/* SRS Settings */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>📚</span> Study Settings
          </h2>
          <div>
            <label className="text-ink-300 text-sm mb-1 block" htmlFor="settings-daily-limit">
              New cards per day: <span className="text-sakura font-bold">{dailyNewCardLimit}</span>
            </label>
            <input
              id="settings-daily-limit"
              type="range"
              min={5}
              max={50}
              step={5}
              value={dailyNewCardLimit}
              onChange={e => setDailyNewCardLimit(Number(e.target.value))}
              className="w-full accent-sakura"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>5 (easy pace)</span>
              <span>25 (standard)</span>
              <span>50 (intense)</span>
            </div>
            <div className="mt-3 p-3 bg-gold/8 border border-gold/20 rounded-lg text-sm text-ink-200">
              <p className="font-medium text-gold mb-1">💡 Research-backed recommendation</p>
              <p className="text-ink-300 text-xs">
                Start with <strong>10 cards/day</strong>. At that pace you'll learn ~3,650 words/year.
                Increase to 20–25 only after you're comfortable with your daily review load.
                Consistency beats intensity — burnout is the #1 reason people quit.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Display Preferences */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>🖥️</span> Display
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-200 text-sm font-medium">Show Furigana</p>
              <p className="text-ink-400 text-xs">Display reading hints above kanji in reading practice</p>
            </div>
            <Toggle on={showFurigana} onToggle={() => setShowFurigana(!showFurigana)} label="Show furigana" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-ink-200 text-sm font-medium">Auto-play audio</p>
              <p className="text-ink-400 text-xs">Speak Japanese automatically when flipping vocab cards</p>
            </div>
            <Toggle on={autoTts} onToggle={() => setAutoTts(!autoTts)} label="Auto-play audio" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-ink-200 text-sm font-medium">Dark Mode</p>
              <p className="text-ink-400 text-xs">Switch to a dark theme for night studying</p>
            </div>
            <Toggle
              on={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
              label="Dark mode"
            />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>🔔</span> Notifications
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-200 text-sm font-medium">Daily Study Reminder</p>
              <p className="text-ink-400 text-xs">
                {typeof Notification !== 'undefined' && Notification.permission === 'denied'
                  ? 'Notifications blocked — allow in browser settings'
                  : 'Get a reminder when you have reviews due (while the app is open)'}
              </p>
            </div>
            <Toggle
              on={notificationsEnabled}
              onToggle={() => handleNotifications(!notificationsEnabled)}
              label="Daily study reminder"
              disabled={typeof Notification !== 'undefined' && Notification.permission === 'denied'}
            />
          </div>
          {notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted' && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div>
                <p className="text-ink-200 text-sm font-medium">Reminder Time</p>
                <p className="text-ink-400 text-xs">What time to send the daily reminder</p>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={e => handleReminderTimeChange(e.target.value)}
                className="input-field w-auto py-1.5 text-sm"
                aria-label="Reminder time"
              />
            </div>
          )}
        </motion.div>

        {/* Learning method info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card bg-bg-primary border-border">
          <h2 className="text-ink-200 font-semibold mb-3 flex items-center gap-2">
            <span>🧠</span> How Your SRS Works
          </h2>
          <div className="space-y-2 text-sm text-ink-300">
            <p><span className="font-medium text-ink-200">Sentence-first cards:</span> You see the word in a real sentence before the definition. This forces deeper processing and better retention.</p>
            <p><span className="font-medium text-ink-200">Learning steps (1m → 10m → 1d):</span> New cards go through a learning pipeline before entering the main review queue.</p>
            <p><span className="font-medium text-ink-200">90% retention target:</span> Intervals are calculated to keep ~90% of known words in long-term memory.</p>
            <p><span className="font-medium text-ink-200">4 ratings:</span> Again (relearn) · Hard (slow interval) · Good (normal) · Easy (fast interval + ease boost)</p>
          </div>
        </motion.div>

        {/* Cloud Sync */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-1 flex items-center gap-2">
            <span>☁️</span> Cloud Sync
          </h2>
          <p className="text-ink-400 text-xs mb-4">Sync your progress between your phone and computer</p>

          {!firebaseReady ? (
            <div className="p-4 bg-gold/8 border border-gold/20 rounded-xl">
              <p className="text-gold font-semibold text-sm mb-2">⚙️ Firebase setup required</p>
              <p className="text-ink-300 text-xs leading-relaxed">
                Follow the setup guide below to enable cloud sync. Once configured, your progress will automatically save to the cloud every time you leave the app.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-ink-300 text-sm font-medium mb-2">Your Sync Code</p>
                {syncCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 font-mono text-ink-100 font-bold tracking-widest text-center text-lg">
                      {syncCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(syncCode); toast('Copied!', { icon: '📋' }) }}
                      className="btn-secondary px-3 py-2.5 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleGenerateCode} className="btn-primary w-full">
                    Generate My Sync Code
                  </button>
                )}
                {syncCode && (
                  <p className="text-ink-400 text-xs mt-1.5 text-center">
                    Enter this code on your other devices to link them
                    {lastSynced > 0 && <> · Last synced {new Date(lastSynced).toLocaleTimeString()}</>}
                  </p>
                )}
              </div>

              {syncCode && (
                <div className="flex gap-2">
                  <button type="button" onClick={handleUpload} disabled={syncing} className="btn-secondary flex-1 text-sm disabled:opacity-50">
                    {syncing ? '...' : '↑ Upload now'}
                  </button>
                  <button type="button" onClick={handleDownload} disabled={syncing} className="btn-secondary flex-1 text-sm disabled:opacity-50">
                    {syncing ? '...' : '↓ Download now'}
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <p className="text-ink-300 text-sm font-medium mb-2">Link this device to an existing account</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 font-mono uppercase tracking-widest"
                    placeholder="XXXX-XXXX"
                    value={syncInput}
                    onChange={e => setSyncInput(e.target.value.toUpperCase())}
                    maxLength={9}
                    aria-label="Sync code to link"
                  />
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={syncing || syncInput.length < 9}
                    className="btn-primary px-4 disabled:opacity-40"
                  >
                    {syncing ? '...' : 'Link'}
                  </button>
                </div>
                <p className="text-ink-400 text-xs mt-1.5">
                  This will download and apply progress from the other device
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>💾</span> Data
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-200 text-sm font-medium">Export Backup</p>
                <p className="text-ink-400 text-xs">Download all your progress as a JSON file</p>
              </div>
              <button type="button" onClick={handleExport} className="btn-secondary text-sm px-4">
                ↓ Export
              </button>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <div>
                <p className="text-ink-200 text-sm font-medium">Import Backup</p>
                <p className="text-ink-400 text-xs">Restore progress from a previously exported file</p>
              </div>
              <label className="btn-secondary text-sm px-4 cursor-pointer">
                ↑ Import
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </div>
            <div className="border-t border-border pt-3 space-y-3">
              <div>
                <p className="text-ink-200 text-sm font-medium">Export to Anki</p>
                <p className="text-ink-400 text-xs">Download .apkg decks to import into Anki (uses Anki&apos;s built-in Japanese TTS)</p>
              </div>
              {[
                {
                  key: 'vocab',
                  label: 'Vocab deck',
                  desc: 'Words currently in your SRS deck',
                  onClick: handleAnkiExport,
                  busy: exportingAnki,
                },
                {
                  key: 'kanji',
                  label: 'Kanji deck',
                  desc: 'Kanji you\'ve practiced in Kanji Study',
                  onClick: handleKanjiAnkiExport,
                  busy: exportingKanjiAnki,
                },
                {
                  key: 'grammar',
                  label: 'Grammar deck',
                  desc: 'Grammar points from your wrong-answer log',
                  onClick: handleGrammarAnkiExport,
                  busy: exportingGrammarAnki,
                },
              ].map(row => (
                <div key={row.key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-ink-200 text-sm">{row.label}</p>
                    <p className="text-ink-400 text-xs truncate">{row.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={row.onClick}
                    disabled={row.busy}
                    className="btn-secondary text-sm px-4 flex-shrink-0 disabled:opacity-50"
                  >
                    {row.busy ? 'Exporting…' : 'Export'}
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <div>
                <p className="text-sakura text-sm font-medium">Reset All Progress</p>
                <p className="text-ink-400 text-xs">Permanently delete all learning data</p>
              </div>
              <button type="button" onClick={() => setShowResetConfirm(true)} className="px-4 py-1.5 rounded-lg border-2 border-sakura/30 text-sakura text-sm font-medium hover:bg-sakura/8 transition-all">
                Reset
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <span className="text-4xl">⚠️</span>
                <h2 id="reset-dialog-title" className="text-ink-100 font-bold text-lg mt-3">Reset All Progress?</h2>
                <p className="text-ink-400 text-sm mt-2">
                  This will permanently delete your SRS cards, kana/kanji progress, XP, streaks, conversations, and reading history. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowResetConfirm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="button" onClick={handleReset} className="flex-1 py-2 rounded-xl bg-sakura text-white font-semibold hover:bg-sakura/90 transition-all">
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
