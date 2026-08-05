import { useState, useMemo } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

const NAV_ITEMS = [
  { path: '/',             label: 'ホーム',  labelEn: 'Home',         icon: '🏠' },
  { path: '/kana',         label: 'かな',    labelEn: 'Kana',         icon: 'あ' },
  { path: '/vocab',        label: '単語',    labelEn: 'Vocab',        icon: '📚' },
  { path: '/kanji',        label: '漢字',    labelEn: 'Kanji',        icon: '漢' },
  { path: '/grammar',      label: '文法',    labelEn: 'Grammar',      icon: '✍️' },
  { path: '/reading',      label: '読書',    labelEn: 'Reading',      icon: '📰' },
  { path: '/reader',       label: '読解',    labelEn: 'Reader',       icon: '🎮' },
  { path: '/conversation', label: '会話',    labelEn: 'Chat',         icon: '💬', badge: 'AI' },
  { path: '/progress',     label: '進捗',    labelEn: 'Progress',     icon: '📊' },
  { path: '/guide',        label: 'ガイド',  labelEn: 'Guide',        icon: '📖' },
  { path: '/resources',    label: '資料',    labelEn: 'Resources',    icon: '🔗' },
  { path: '/settings',     label: '設定',    labelEn: 'Settings',     icon: '⚙️' },
]

// 5 items always visible in the mobile bottom bar
const BOTTOM_NAV = [
  { path: '/',             labelEn: 'Home',     icon: '🏠' },
  { path: '/vocab',        labelEn: 'Vocab',    icon: '📚' },
  { path: '/conversation', labelEn: 'Chat',     icon: '💬' },
  { path: '/progress',     labelEn: 'Progress', icon: '📊' },
  { path: '/kanji',        labelEn: 'Kanji',    icon: '漢' },
]

export default function Layout() {
  const [showMore, setShowMore] = useState(false)
  const { streak, xp, username, getDueCards, streakFreezes, vocabCards } = useStore()
  const xpLevel = Math.floor(xp / 100)
  const xpProgress = xp % 100
  const dueCount = useMemo(() => getDueCards().length, [vocabCards])

  return (
    <div className="md:flex md:h-screen md:overflow-hidden bg-bg-primary">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r border-border bg-white shadow-sm">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sakura/10 border border-sakura/20 flex items-center justify-center text-lg shadow-sm">
              🌸
            </div>
            <div>
              <h1 className="text-ink-100 font-bold text-sm japanese-text">日本語先生</h1>
              <p className="text-ink-400 text-xs">Nihongo Sensei</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-border bg-bg-primary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ink-200 text-sm font-semibold">{username}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-base streak-flame">🔥</span>
                <span className="text-sakura font-bold text-sm">{streak}</span>
              </div>
              {streakFreezes > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="text-sm">🛡️</span>
                  <span className="text-blue-500 font-bold text-xs">{streakFreezes}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gold text-xs font-bold">Lv.{xpLevel}</span>
            <div className="xp-bar flex-1">
              <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
            </div>
            <span className="text-ink-400 text-xs">{xpProgress}/100</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="japanese-text text-sm font-medium">{item.label}</span>
                <span className="ml-1.5 text-xs text-ink-400">{item.labelEn}</span>
              </div>
              {item.badge && <span className="tag-sakura text-xs">AI</span>}
              {item.path === '/vocab' && dueCount > 0 && (
                <span className="tag-gold">{dueCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border text-xs text-ink-400">
          {xp} XP total · <span className="text-jade font-medium">Keep going!</span>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:overflow-y-auto bg-bg-primary mobile-main">
        {/* Mobile top header */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌸</span>
              <span className="japanese-text text-sm font-bold text-ink-100">日本語先生</span>
            </div>
            <div className="flex items-center gap-3">
              {streakFreezes > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="text-sm">🛡️</span>
                  <span className="text-blue-500 font-bold text-xs">{streakFreezes}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="streak-flame text-sm">🔥</span>
                <span className="text-sakura font-bold text-sm">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gold text-xs font-bold">Lv.{xpLevel}</span>
                <div className="w-16 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sakura to-sakura-bright rounded-full transition-all duration-700"
                    style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border mobile-bottom-nav">
        <div className="flex items-stretch h-full">
          {BOTTOM_NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 text-center transition-colors relative
                 ${isActive ? 'text-sakura' : 'text-ink-400'}`
              }
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.labelEn}</span>
              {item.path === '/vocab' && dueCount > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-14px)] w-4 h-4 rounded-full bg-sakura text-white text-[9px] font-bold flex items-center justify-center">
                  {dueCount > 9 ? '9+' : dueCount}
                </span>
              )}
            </NavLink>
          ))}
          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-ink-400 transition-colors"
          >
            <span className="text-xl leading-none">⋯</span>
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* ── MORE DRAWER (mobile) ── */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              key="drawer"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl more-drawer"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <p className="text-center text-xs text-ink-400 pb-3">All sections</p>
              <div className="grid grid-cols-4 gap-1 px-3 pb-3">
                {NAV_ITEMS.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                       ${isActive ? 'bg-sakura/10 text-sakura' : 'text-ink-300 hover:bg-bg-secondary'}`
                    }
                  >
                    <span className="text-2xl leading-none">{item.icon}</span>
                    <span className="text-[11px] font-medium text-center leading-tight">{item.labelEn}</span>
                    {item.path === '/vocab' && dueCount > 0 && (
                      <span className="text-[9px] text-sakura font-bold">{dueCount} due</span>
                    )}
                    {item.badge && (
                      <span className="text-[9px] text-sakura font-bold">AI</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
