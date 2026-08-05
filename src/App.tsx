import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import KanaStudy from './pages/KanaStudy'
import VocabReview from './pages/VocabReview'
import Conversation from './pages/Conversation'
import ProgressPage from './pages/ProgressPage'
import Settings from './pages/Settings'
import GrammarStudy from './pages/GrammarStudy'
import Guide from './pages/Guide'
import ReadingPractice from './pages/ReadingPractice'
import Reader from './pages/Reader'
import KanjiStudy from './pages/KanjiStudy'
import Resources from './pages/Resources'
import Onboarding from './pages/Onboarding'
import { useStore } from './store'
import { initFirebase, uploadProgress, downloadProgress, isFirebaseConfigured } from './lib/firebase'

function DarkModeInit() {
  const darkMode = useStore(s => s.darkMode)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])
  return null
}

function CloudSyncManager() {
  const syncCode = useStore(s => s.syncCode)

  useEffect(() => {
    if (!isFirebaseConfigured() || !syncCode) return
    initFirebase()

    // On startup: download from cloud if it's newer than local
    const state = useStore.getState()
    downloadProgress(syncCode).then(cloud => {
      if (cloud && cloud.lastModified > state.lastSynced) {
        const { syncCode: _sc, lastSynced: _ls, apiKey: _ak, ...rest } = cloud.state as any
        useStore.setState({ ...rest, syncCode, lastSynced: cloud.lastModified })
      }
    })

    // On page hide (switching apps, closing tab): upload to cloud
    const handleHide = () => {
      const s = useStore.getState()
      if (!s.syncCode) return
      const { apiKey: _a, lastVocabCardSnapshot: _l, syncCode: _sc, lastSynced: _ls, ...data } = s as any
      uploadProgress(s.syncCode, data).then(ok => {
        if (ok) useStore.getState().setLastSynced(Date.now())
      })
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') handleHide()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', handleHide)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleHide)
    }
  }, [syncCode])

  return null
}

function LevelUpTracker() {
  const xp = useStore(s => s.xp)
  const level = Math.floor(xp / 100)
  const prevLevelRef = useRef(level)

  useEffect(() => {
    if (level > prevLevelRef.current) {
      confetti({ particleCount: 130, spread: 70, origin: { y: 0.6 }, colors: ['#c94b4b', '#b07d1a', '#2d8a5e'] })
      toast(`Level ${level} reached!`, {
        icon: '🎉',
        style: { background: '#c94b4b', color: 'white', fontWeight: 700 },
        duration: 4000,
      })
    }
    prevLevelRef.current = level
  }, [level])

  return null
}

export default function App() {
  const hasCompletedOnboarding = useStore(s => s.hasCompletedOnboarding)

  return (
    <ErrorBoundary>
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />
      <DarkModeInit />
      <LevelUpTracker />
      <CloudSyncManager />
      <HashRouter>
        {!hasCompletedOnboarding ? (
          <Onboarding />
        ) : (
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="kana" element={<KanaStudy />} />
              <Route path="vocab" element={<VocabReview />} />
              <Route path="conversation" element={<Conversation />} />
              <Route path="grammar" element={<GrammarStudy />} />
              <Route path="guide" element={<Guide />} />
              <Route path="reading" element={<ReadingPractice />} />
              <Route path="reader" element={<Reader />} />
              <Route path="kanji" element={<KanjiStudy />} />
              <Route path="resources" element={<Resources />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        )}
      </HashRouter>
    </>
    </ErrorBoundary>
  )
}
