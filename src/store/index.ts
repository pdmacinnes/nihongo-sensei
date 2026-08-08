import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { SRSCard, createSRSCard, reviewCard, isDue, SRSRating, getNewCardsForToday } from '../lib/srs'
import { VOCAB_DATA } from '../lib/vocab-data'
import type { Token } from '../lib/tokenizer'

export interface VocabCardState extends SRSCard {
  wordId: string
  addedAt: number
}

export interface KanaProgress {
  kana: string
  correct: number
  incorrect: number
  lastSeen: number
  mastered: boolean
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  corrections?: string
  timestamp: number
}

export interface ConversationSession {
  id: string
  scenario: string
  level: string
  messages: ConversationMessage[]
  startedAt: number
  endedAt?: number
}

export interface WrongAnswerEntry {
  id: string
  type: 'vocab' | 'grammar'
  wordId?: string
  grammarPattern?: string
  userAnswer?: string
  correctAnswer?: string
  label: string
  reading?: string
  english?: string
  timestamp: number
}

export interface CustomVocabWord {
  id: string
  japanese: string
  reading: string
  english: string
  sentenceJp: string
  sentenceEn: string
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  category: string
  pos?: string
  // How often the word comes up in everyday Japanese speech: 'very common' | 'common' | 'uncommon' | 'rare'
  frequency?: string
  // Set when the word's meaning/nuance shifts significantly depending on context
  contextNote?: string
}

export interface DailyXpEntry {
  date: string
  xp: number
}

export interface ReaderSession {
  id: string
  startedAt: number
  updatedAt: number
  source: 'manual' | 'capture'
  sourceTitle?: string
  linesRead: number
  charsRead: number
  uniqueWordIds: string[]
  newWordsAdded: number
}

export interface ReaderLine {
  id: string
  text: string
  tokens: Token[] | null
  translation: string | null
}

export const READER_JAPANESE_RE = /[぀-ヿ一-鿿]/
export const READER_CHAR_CAP = 2000
// Tracks the most recently added Japanese line so a later, separate non-Japanese
// capture event can be paired to it as its translation. Plain module variable rather
// than store state since it's an internal pointer, not something components read/render.
let lastJpLineId: string | null = null

interface AppState {
  // Settings
  apiKey: string
  setApiKey: (key: string) => void
  dailyNewCardLimit: number
  setDailyNewCardLimit: (n: number) => void

  // User profile
  username: string
  setUsername: (name: string) => void
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  setJlptLevel: (level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') => void

  // Streak & XP
  streak: number
  xp: number
  totalXp: number
  lastStudyDate: string
  streakFreezes: number
  addXP: (amount: number) => void
  checkAndUpdateStreak: () => void

  // Daily XP history (last 30 days)
  dailyXpHistory: DailyXpEntry[]

  // Daily new card tracking
  newCardsSeenToday: number
  newCardsSeenDate: string
  incrementNewCardsSeen: () => void

  // Vocabulary SRS
  vocabCards: VocabCardState[]
  addVocabCard: (wordId: string) => void
  reviewVocabCard: (cardId: string, rating: SRSRating) => void
  getDueCards: () => VocabCardState[]
  addVocabFromConversation: (wordIds: string[]) => void

  // Custom vocabulary
  customWords: CustomVocabWord[]
  addCustomWord: (word: Omit<CustomVocabWord, 'id'>) => void
  removeCustomWord: (id: string) => void

  // Undo last rating
  lastVocabCardSnapshot: { card: VocabCardState; xpSpent: number } | null
  undoLastVocabRating: () => void

  // Wrong answer log
  wrongAnswerLog: WrongAnswerEntry[]
  logWrongAnswer: (entry: Omit<WrongAnswerEntry, 'id' | 'timestamp'>) => void
  clearWrongAnswerLog: () => void

  // Kana progress
  kanaProgress: Record<string, KanaProgress>
  updateKanaProgress: (kana: string, correct: boolean) => void
  getKanaMastery: () => number

  // Kanji progress
  kanjiProgress: Record<string, { correct: number; incorrect: number; mastered: boolean }>
  updateKanjiProgress: (kanji: string, correct: boolean) => void

  // Conversation history
  conversations: ConversationSession[]
  currentConversation: ConversationSession | null
  startConversation: (scenario: string, level: string) => void
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void
  endConversation: () => void

  // Stats
  totalConversations: number
  totalKanaCorrect: number
  totalKanaIncorrect: number

  // Preferences
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
  reminderTime: string  // 'HH:MM' 24h format
  setReminderTime: (time: string) => void
  showFurigana: boolean
  setShowFurigana: (show: boolean) => void
  autoTts: boolean
  setAutoTts: (on: boolean) => void
  darkMode: boolean
  setDarkMode: (dark: boolean) => void

  // Derived
  getLeeches: () => VocabCardState[]
  resetAllProgress: () => void

  // Cloud sync
  syncCode: string
  setSyncCode: (code: string) => void
  lastSynced: number
  setLastSynced: (ts: number) => void

  // Onboarding
  hasCompletedOnboarding: boolean
  completeOnboarding: () => void

  // VN/Immersion Reader
  readerSessions: ReaderSession[]
  startReaderSession: (source: 'manual' | 'capture', sourceTitle?: string) => string
  updateReaderSession: (id: string, patch: Partial<Omit<ReaderSession, 'id' | 'startedAt' | 'updatedAt'>>) => void

  // Reader live session — deliberately NOT persisted to disk (see partialize below).
  // Lives in the store rather than component state so it survives navigating to other
  // tabs and back; the store module itself never unmounts while the app is running.
  readerLines: ReaderLine[]
  readerCaptureOn: boolean
  setReaderCaptureOn: (on: boolean) => void
  readerPendingOverflow: string | null
  readerNewWordsAdded: number
  incrementReaderNewWordsAdded: () => void
  readerSessionId: string | null
  readerSessionStart: number
  ingestReaderTexts: (texts: string[]) => void
  addReaderText: (raw: string) => void
  loadMoreReaderOverflow: () => void
}

/** Local calendar date YYYY-MM-DD (not UTC — avoids streak/limit flips mid-evening). */
const todayStr = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
      setApiKey: (key) => set({ apiKey: key }),
      dailyNewCardLimit: 10,
      setDailyNewCardLimit: (n) => set({ dailyNewCardLimit: n }),

      // User profile
      username: 'Learner',
      setUsername: (name) => set({ username: name }),
      jlptLevel: 'N5',
      setJlptLevel: (level) => set({ jlptLevel: level }),

      // Streak & XP
      streak: 0,
      xp: 0,
      totalXp: 0,
      lastStudyDate: '',
      streakFreezes: 0,

      addXP: (amount) => {
        const today = todayStr()
        set(state => {
          const history = [...state.dailyXpHistory]
          const idx = history.findIndex(e => e.date === today)
          if (idx >= 0) history[idx] = { date: today, xp: history[idx].xp + amount }
          else history.push({ date: today, xp: amount })
          // Award 1 freeze per 50 total XP milestone
          const prevMilestone = Math.floor(state.totalXp / 50)
          const newMilestone = Math.floor((state.totalXp + amount) / 50)
          const newFreezes = newMilestone > prevMilestone ? state.streakFreezes + 1 : state.streakFreezes
          return {
            xp: state.xp + amount,
            totalXp: state.totalXp + amount,
            dailyXpHistory: history.slice(-30),
            streakFreezes: newFreezes,
          }
        })
        get().checkAndUpdateStreak()
      },

      checkAndUpdateStreak: () => {
        const today = todayStr()
        const state = get()
        if (state.lastStudyDate === today) return
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = todayStr(yesterday)
        if (state.lastStudyDate === yesterdayStr) {
          set({ streak: state.streak + 1, lastStudyDate: today })
        } else if (state.lastStudyDate !== '' && state.lastStudyDate !== today) {
          // Streak broken — consume a freeze if available
          if (state.streakFreezes > 0) {
            set({ streakFreezes: state.streakFreezes - 1, lastStudyDate: today })
          } else {
            set({ streak: 1, lastStudyDate: today })
          }
        } else {
          set({ streak: Math.max(1, state.streak), lastStudyDate: today })
        }
      },

      dailyXpHistory: [],

      // Daily new card tracking
      newCardsSeenToday: 0,
      newCardsSeenDate: '',

      incrementNewCardsSeen: () => {
        const today = todayStr()
        set(state => ({
          newCardsSeenToday: state.newCardsSeenDate === today ? state.newCardsSeenToday + 1 : 1,
          newCardsSeenDate: today,
        }))
      },

      // Vocabulary SRS — seed with first 10 N5 words (persisted state overrides this for returning users)
      vocabCards: VOCAB_DATA.filter(w => w.level === 'N5').slice(0, 10).map(w => ({
        ...createSRSCard(w.id),
        wordId: w.id,
        addedAt: Date.now(),
      })),

      addVocabCard: (wordId) => {
        if (get().vocabCards.find(c => c.wordId === wordId)) return
        set(s => ({
          vocabCards: [...s.vocabCards, {
            ...createSRSCard(wordId),
            wordId,
            addedAt: Date.now(),
          }],
        }))
      },

      reviewVocabCard: (cardId, rating) => {
        const state = get()
        const card = state.vocabCards.find(c => c.id === cardId)
        if (!card) return

        if (card.state === 'new') get().incrementNewCardsSeen()

        const xpEarned = rating === 'again' ? 1 : rating === 'hard' ? 3 : rating === 'good' ? 5 : 8

        // Save snapshot for undo
        set({ lastVocabCardSnapshot: { card: { ...card }, xpSpent: xpEarned } })

        set(s => ({
          vocabCards: s.vocabCards.map(c =>
            c.id === cardId ? { ...reviewCard(c, rating), wordId: c.wordId, addedAt: c.addedAt } : c
          ),
        }))

        // Log wrong answers
        if (rating === 'again') {
          const allWords = [...VOCAB_DATA, ...get().customWords]
          const word = allWords.find(w => w.id === card.wordId)
          if (word) get().logWrongAnswer({
            type: 'vocab', wordId: card.wordId,
            label: word.japanese, reading: word.reading, english: word.english,
          })
        }

        get().addXP(xpEarned)
      },

      getDueCards: () => {
        const state = get()
        const today = todayStr()
        const seenToday = state.newCardsSeenDate === today ? state.newCardsSeenToday : 0
        const reviewDue = state.vocabCards.filter(c => c.state !== 'new' && isDue(c))
        const newDue = getNewCardsForToday(state.vocabCards, state.dailyNewCardLimit, seenToday) as VocabCardState[]
        return [...reviewDue, ...newDue]
      },

      addVocabFromConversation: (wordIds) => {
        wordIds.forEach(id => get().addVocabCard(id))
      },

      // Custom vocabulary
      customWords: [],
      addCustomWord: (word) => {
        const id = `cw_${Date.now()}`
        const newWord = { ...word, id }
        set(s => ({ customWords: [...s.customWords, newWord] }))
        get().addVocabCard(id)
      },
      removeCustomWord: (id) => set(s => ({
        customWords: s.customWords.filter(w => w.id !== id),
        vocabCards: s.vocabCards.filter(c => c.wordId !== id),
      })),

      // Undo
      lastVocabCardSnapshot: null,
      undoLastVocabRating: () => {
        const snap = get().lastVocabCardSnapshot
        if (!snap) return
        const today = todayStr()
        const wasNew = snap.card.state === 'new'
        set(s => ({
          vocabCards: s.vocabCards.map(c => c.id === snap.card.id ? snap.card : c),
          xp: Math.max(0, s.xp - snap.xpSpent),
          totalXp: Math.max(0, s.totalXp - snap.xpSpent),
          dailyXpHistory: s.dailyXpHistory.map(e =>
            e.date === today ? { ...e, xp: Math.max(0, e.xp - snap.xpSpent) } : e
          ),
          // Rating a new card consumes a daily slot — restore it on undo
          newCardsSeenToday: wasNew && s.newCardsSeenDate === today
            ? Math.max(0, s.newCardsSeenToday - 1)
            : s.newCardsSeenToday,
          lastVocabCardSnapshot: null,
        }))
      },

      // Wrong answer log
      wrongAnswerLog: [],
      logWrongAnswer: (entry) => set(s => ({
        wrongAnswerLog: [
          { ...entry, id: `wa_${Date.now()}`, timestamp: Date.now() },
          ...s.wrongAnswerLog,
        ].slice(0, 100),
      })),
      clearWrongAnswerLog: () => set({ wrongAnswerLog: [] }),

      // Kana progress
      kanaProgress: {},
      // Kanji progress
      kanjiProgress: {},
      updateKanjiProgress: (kanji, correct) => {
        set(state => {
          const prev = state.kanjiProgress[kanji] || { correct: 0, incorrect: 0, mastered: false }
          const newCorrect = prev.correct + (correct ? 1 : 0)
          return {
            kanjiProgress: {
              ...state.kanjiProgress,
              [kanji]: { correct: newCorrect, incorrect: prev.incorrect + (correct ? 0 : 1), mastered: newCorrect >= 5 },
            },
          }
        })
        if (correct) get().addXP(3)
      },

      updateKanaProgress: (kana, correct) => {
        set(state => {
          const prev = state.kanaProgress[kana] || { kana, correct: 0, incorrect: 0, lastSeen: 0, mastered: false }
          const newCorrect = prev.correct + (correct ? 1 : 0)
          const updated: KanaProgress = {
            ...prev,
            correct: newCorrect,
            incorrect: prev.incorrect + (correct ? 0 : 1),
            lastSeen: Date.now(),
            mastered: newCorrect >= 5,
          }
          return {
            kanaProgress: { ...state.kanaProgress, [kana]: updated },
            totalKanaCorrect: state.totalKanaCorrect + (correct ? 1 : 0),
            totalKanaIncorrect: state.totalKanaIncorrect + (correct ? 0 : 1),
          }
        })
        if (correct) get().addXP(2)
      },

      getKanaMastery: () => {
        const state = get()
        const total = 92
        const mastered = Object.values(state.kanaProgress).filter(p => p.mastered).length
        return Math.round((mastered / total) * 100)
      },

      // Conversations
      conversations: [],
      currentConversation: null,

      startConversation: (scenario, level) => {
        set({
          currentConversation: {
            id: `conv_${Date.now()}`,
            scenario, level,
            messages: [],
            startedAt: Date.now(),
          },
        })
      },

      addMessage: (msg) => {
        set(state => {
          if (!state.currentConversation) return state
          return {
            currentConversation: {
              ...state.currentConversation,
              messages: [...state.currentConversation.messages, {
                ...msg,
                id: `msg_${Date.now()}`,
                timestamp: Date.now(),
              }],
            },
          }
        })
      },

      endConversation: () => {
        const state = get()
        if (!state.currentConversation) return
        const ended = { ...state.currentConversation, endedAt: Date.now() }
        set(s => ({
          conversations: [ended, ...s.conversations].slice(0, 50),
          currentConversation: null,
          totalConversations: s.totalConversations + 1,
        }))
        get().addXP(25)
      },

      // Stats
      totalConversations: 0,
      totalKanaCorrect: 0,
      totalKanaIncorrect: 0,

      // Preferences
      notificationsEnabled: false,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      reminderTime: '20:00',
      setReminderTime: (time) => set({ reminderTime: time }),
      showFurigana: true,
      setShowFurigana: (show) => set({ showFurigana: show }),
      autoTts: true,
      setAutoTts: (on) => set({ autoTts: on }),
      darkMode: false,
      setDarkMode: (dark) => {
        set({ darkMode: dark })
        document.documentElement.classList.toggle('dark', dark)
      },

      // Derived
      getLeeches: () => get().vocabCards.filter(c => c.lapses >= 4),

      resetAllProgress: () => set({
        vocabCards: VOCAB_DATA.filter(w => w.level === (get().jlptLevel ?? 'N5')).slice(0, 10).map(w => ({
          ...createSRSCard(w.id),
          wordId: w.id,
          addedAt: Date.now(),
        })),
        kanaProgress: {},
        kanjiProgress: {},
        xp: 0, totalXp: 0, streak: 0, streakFreezes: 0,
        lastStudyDate: '',
        conversations: [],
        currentConversation: null,
        totalConversations: 0,
        totalKanaCorrect: 0, totalKanaIncorrect: 0,
        newCardsSeenToday: 0, newCardsSeenDate: '',
        wrongAnswerLog: [],
        dailyXpHistory: [],
        customWords: [],
        lastVocabCardSnapshot: null,
        readerSessions: [],
        readerLines: [],
        readerCaptureOn: false,
        readerPendingOverflow: null,
        readerNewWordsAdded: 0,
      }),

      // Cloud sync
      syncCode: '',
      setSyncCode: (code) => set({ syncCode: code }),
      lastSynced: 0,
      setLastSynced: (ts) => set({ lastSynced: ts }),

      // Onboarding
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      // VN/Immersion Reader
      readerSessions: [],
      startReaderSession: (source, sourceTitle) => {
        const id = `rs_${Date.now()}`
        const now = Date.now()
        set(s => ({
          // Cap history so this doesn't grow localStorage forever across months of daily use.
          readerSessions: [...s.readerSessions, {
            id, startedAt: now, updatedAt: now, source, sourceTitle,
            linesRead: 0, charsRead: 0, uniqueWordIds: [], newWordsAdded: 0,
          }].slice(-200),
          readerSessionId: id,
          readerSessionStart: now,
        }))
        return id
      },
      updateReaderSession: (id, patch) => set(s => ({
        readerSessions: s.readerSessions.map(rs => rs.id === id ? { ...rs, ...patch, updatedAt: Date.now() } : rs),
      })),

      readerLines: [],
      readerCaptureOn: false,
      setReaderCaptureOn: (on) => set({ readerCaptureOn: on }),
      readerPendingOverflow: null,
      readerNewWordsAdded: 0,
      incrementReaderNewWordsAdded: () => set(s => ({ readerNewWordsAdded: s.readerNewWordsAdded + 1 })),
      readerSessionId: null,
      readerSessionStart: 0,

      // Shared ingestion path for both pasted text and live Textractor capture events.
      // Japanese text becomes a new line (prepended — newest on top). Non-Japanese text is
      // treated as the translation for whichever Japanese line came immediately before it,
      // which is how a fan-translation patch's dual JP/EN hooks show up through Capture Mode.
      ingestReaderTexts: (texts) => {
        const cleaned = texts.map(t => t.trim()).filter(Boolean)
        if (cleaned.length === 0) return

        const newLines: ReaderLine[] = []
        const translationById = new Map<string, string>()

        for (const text of cleaned) {
          if (READER_JAPANESE_RE.test(text)) {
            const id = `ln_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
            newLines.push({ id, text, tokens: null, translation: null })
            lastJpLineId = id
          } else if (lastJpLineId) {
            translationById.set(lastJpLineId, text)
          }
        }

        if (newLines.length === 0 && translationById.size === 0) return

        const newLinesWithTranslation = newLines.map(l =>
          translationById.has(l.id) ? { ...l, translation: translationById.get(l.id)! } : l
        )

        set(s => ({
          readerLines: [
            ...newLinesWithTranslation,
            ...s.readerLines.map(l => translationById.has(l.id) ? { ...l, translation: translationById.get(l.id)! } : l),
          ],
        }))

        newLines.forEach(line => {
          import('../lib/tokenizer').then(({ tokenize }) => tokenize(line.text))
            .then(tokens => set(s => ({
              readerLines: s.readerLines.map(l => l.id === line.id ? { ...l, tokens } : l),
            })))
            .catch(() => toast.error('Failed to tokenize a line'))
        })
      },

      addReaderText: (raw) => {
        const rawTexts = raw.split('\n').map(l => l.trim()).filter(Boolean)
        if (rawTexts.length === 0) return

        // Cap how much Japanese text we tokenize in one go so pasting a whole chapter doesn't lock up the UI.
        let jpCharCount = 0
        let cutoff = rawTexts.length
        for (let i = 0; i < rawTexts.length; i++) {
          if (READER_JAPANESE_RE.test(rawTexts[i])) {
            jpCharCount += rawTexts[i].length
            if (jpCharCount > READER_CHAR_CAP) { cutoff = i; break }
          }
        }
        const toProcess = rawTexts.slice(0, Math.max(cutoff, 1))
        const overflow = rawTexts.slice(toProcess.length)

        get().ingestReaderTexts(toProcess)
        set({ readerPendingOverflow: overflow.length > 0 ? overflow.join('\n') : null })
      },

      loadMoreReaderOverflow: () => {
        const overflow = get().readerPendingOverflow
        if (!overflow) return
        set({ readerPendingOverflow: null })
        get().addReaderText(overflow)
      },
    }),
    {
      name: 'nihongo-sensei-v2',
      version: 5,
      migrate: (persisted: any) => ({
        wrongAnswerLog: [],
        dailyXpHistory: [],
        customWords: [],
        notificationsEnabled: false,
        reminderTime: '20:00',
        showFurigana: true,
        darkMode: false,
        lastVocabCardSnapshot: null,
        streakFreezes: 0,
        kanjiProgress: {},
        syncCode: '',
        lastSynced: 0,
        ...persisted,
        // Rename newCardsSeen_date -> newCardsSeenDate
        newCardsSeenDate: persisted.newCardsSeenDate ?? persisted.newCardsSeen_date ?? '',
        autoTts: persisted.autoTts ?? true,
      }),
      partialize: (state) => {
        // lastVocabCardSnapshot is ephemeral.
        // Reader live-session fields are runtime-only (see their declarations above) —
        // survive tab switches via the in-memory store, reset on app restart, never on disk.
        // apiKey is persisted locally (Settings) but never uploaded to cloud sync.
        const {
          lastVocabCardSnapshot,
          readerLines, readerCaptureOn, readerPendingOverflow, readerNewWordsAdded,
          readerSessionId, readerSessionStart,
          ...rest
        } = state as any
        return rest
      },
    }
  )
)
