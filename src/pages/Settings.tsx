import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useStore, VocabCardState, KanaProgress, WrongAnswerEntry, CustomVocabWord, DailyXpEntry, ConversationSession } from '../store'
import {
  isFirebaseConfigured, initFirebase,
  generateSyncCode, uploadProgress, downloadProgress,
} from '../lib/firebase'

export default function Settings() {
  const { username, setUsername, jlptLevel, setJlptLevel,
          dailyNewCardLimit, setDailyNewCardLimit,
          notificationsEnabled, setNotificationsEnabled,
          reminderTime, setReminderTime,
          showFurigana, setShowFurigana,
          darkMode, setDarkMode,
          resetAllProgress, apiKey, setApiKey,
          syncCode, setSyncCode, lastSynced, setLastSynced } = useStore()
  const [localName, setLocalName] = useState(username)
  const [localLimit, setLocalLimit] = useState(dailyNewCardLimit)
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [syncInput, setSyncInput] = useState('')
  const [syncing, setSyncing] = useState(false)
  const firebaseReady = isFirebaseConfigured()

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

  const save = () => {
    setUsername(localName)
    setDailyNewCardLimit(localLimit)
    if (localApiKey !== apiKey) setApiKey(localApiKey)
    toast.success('Settings saved!')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.username || !Array.isArray(data.vocabCards)) throw new Error('Invalid backup file')
        // Whitelist only known fields — never spread unknown data into store
        useStore.setState({
          username: typeof data.username === 'string' ? data.username : useStore.getState().username,
          jlptLevel: ['N5','N4','N3','N2','N1'].includes(data.jlptLevel) ? data.jlptLevel : 'N5',
          dailyNewCardLimit: typeof data.dailyNewCardLimit === 'number' ? data.dailyNewCardLimit : 10,
          streak: typeof data.streak === 'number' ? data.streak : 0,
          xp: typeof data.xp === 'number' ? data.xp : 0,
          totalXp: typeof data.totalXp === 'number' ? data.totalXp : 0,
          vocabCards: Array.isArray(data.vocabCards) ? data.vocabCards as VocabCardState[] : [],
          customWords: Array.isArray(data.customWords) ? data.customWords as CustomVocabWord[] : [],
          kanaProgress: data.kanaProgress && typeof data.kanaProgress === 'object' ? data.kanaProgress as Record<string, KanaProgress> : {},
          wrongAnswerLog: Array.isArray(data.wrongAnswerLog) ? data.wrongAnswerLog as WrongAnswerEntry[] : [],
          dailyXpHistory: Array.isArray(data.dailyXpHistory) ? data.dailyXpHistory as DailyXpEntry[] : [],
          conversations: Array.isArray(data.conversations) ? data.conversations as ConversationSession[] : [],
          totalConversations: typeof data.totalConversations === 'number' ? data.totalConversations : 0,
        })
        toast.success('Backup restored successfully!')
        setLocalName(data.username)
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
      streak: state.streak,
      xp: state.xp,
      totalXp: state.totalXp,
      vocabCards: state.vocabCards,
      customWords: state.customWords,
      kanaProgress: state.kanaProgress,
      wrongAnswerLog: state.wrongAnswerLog,
      dailyXpHistory: state.dailyXpHistory,
      conversations: state.conversations,
      totalConversations: state.totalConversations,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nihongo-sensei-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const scheduleNotification = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const now = new Date()
    const next = new Date()
    next.setHours(h, m, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const msUntil = next.getTime() - now.getTime()
    setTimeout(() => {
      if (Notification.permission === 'granted' && useStore.getState().notificationsEnabled) {
        new Notification('日本語先生 — Time to study! 🌸', {
          body: 'Your reviews are waiting. Keep your streak alive!',
          icon: '/icon-192.png',
        })
        scheduleNotification(useStore.getState().reminderTime)
      }
    }, msUntil)
  }

  const handleNotifications = async (enabled: boolean) => {
    if (enabled && Notification.permission === 'default') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
    }
    setNotificationsEnabled(enabled)
    if (enabled && Notification.permission === 'granted') {
      scheduleNotification(reminderTime)
      toast.success(`Reminder set for ${reminderTime} daily`)
    }
  }

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time)
    if (notificationsEnabled && Notification.permission === 'granted') {
      scheduleNotification(time)
      toast.success(`Reminder updated to ${time}`)
    }
  }

  const handleReset = () => {
    resetAllProgress()
    setShowResetConfirm(false)
    toast('All progress reset', { icon: '🗑️' })
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="page-title">
          <span className="japanese-text text-sakura">設定</span> Settings
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">Configure your learning experience</p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="text-ink-200 font-semibold mb-4 flex items-center gap-2">
            <span>👤</span> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-ink-300 text-sm mb-1.5 block">Your name</label>
              <input type="text" className="input-field" value={localName}
                onChange={e => setLocalName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-ink-300 text-sm mb-1.5 block">JLPT Target Level</label>
              <div className="grid grid-cols-5 gap-2">
                {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map(l => (
                  <button key={l} onClick={() => setJlptLevel(l)}
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
                placeholder="sk-ant-..."
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
              Your key is stored locally in your browser and never sent anywhere except directly to Anthropic.
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
            <label className="text-ink-300 text-sm mb-1 block">
              New cards per day: <span className="text-sakura font-bold">{localLimit}</span>
            </label>
            <input type="range" min={5} max={50} step={5} value={localLimit}
              onChange={e => setLocalLimit(Number(e.target.value))}
              className="w-full accent-sakura" />
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
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${showFurigana ? 'bg-jade' : 'bg-ink-500'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${showFurigana ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-ink-200 text-sm font-medium">Dark Mode</p>
              <p className="text-ink-400 text-xs">Switch to a dark theme for night studying</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-ink-200' : 'bg-ink-500'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${darkMode ? 'left-6.5' : 'left-0.5'}`} />
            </button>
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
                {Notification.permission === 'denied'
                  ? 'Notifications blocked — allow in browser settings'
                  : 'Get a reminder when you have reviews due'}
              </p>
            </div>
            <button
              onClick={() => handleNotifications(!notificationsEnabled)}
              disabled={Notification.permission === 'denied'}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-40 ${notificationsEnabled ? 'bg-jade' : 'bg-ink-500'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${notificationsEnabled ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>
          {notificationsEnabled && Notification.permission === 'granted' && (
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
              {/* Current sync code */}
              <div>
                <p className="text-ink-300 text-sm font-medium mb-2">Your Sync Code</p>
                {syncCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 font-mono text-ink-100 font-bold tracking-widest text-center text-lg">
                      {syncCode}
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(syncCode); toast('Copied!', { icon: '📋' }) }}
                      className="btn-secondary px-3 py-2.5 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <button onClick={handleGenerateCode} className="btn-primary w-full">
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

              {/* Upload / Download */}
              {syncCode && (
                <div className="flex gap-2">
                  <button onClick={handleUpload} disabled={syncing} className="btn-secondary flex-1 text-sm disabled:opacity-50">
                    {syncing ? '...' : '↑ Upload now'}
                  </button>
                  <button onClick={handleDownload} disabled={syncing} className="btn-secondary flex-1 text-sm disabled:opacity-50">
                    {syncing ? '...' : '↓ Download now'}
                  </button>
                </div>
              )}

              {/* Link another device */}
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
                  />
                  <button
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
              <button onClick={handleExport} className="btn-secondary text-sm px-4">
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
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <div>
                <p className="text-sakura text-sm font-medium">Reset All Progress</p>
                <p className="text-ink-400 text-xs">Permanently delete all learning data</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)} className="px-4 py-1.5 rounded-lg border-2 border-sakura/30 text-sakura text-sm font-medium hover:bg-sakura/8 transition-all">
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        <button onClick={save} className="btn-primary w-full py-3 rounded-xl font-semibold text-base">
          Save Settings
        </button>
      </div>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-ink-100 font-bold text-lg mt-3">Reset All Progress?</h2>
                <p className="text-ink-400 text-sm mt-2">
                  This will permanently delete your SRS cards, kana progress, XP, streaks, conversations, and wrong answer log. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleReset} className="flex-1 py-2 rounded-xl bg-sakura text-white font-semibold hover:bg-sakura/90 transition-all">
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
