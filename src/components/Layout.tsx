import { useState, useMemo, useEffect, type ComponentType } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import {
  IconHome, IconChat, IconReader, IconVocab, IconKana, IconKanji,
  IconGrammar, IconReading, IconProgress, IconGuide, IconResources,
  IconSettings, IconMore, IconStreak, IconFreeze, IconSakura,
} from './Icons'

type NavIcon = ComponentType<{ className?: string; size?: number }>

type NavItem = {
  path: string
  label: string
  labelEn: string
  Icon: NavIcon
  badge?: string
}

const PRACTICE: NavItem[] = [
  { path: '/',             label: 'ホーム', labelEn: 'Home',   Icon: IconHome },
  { path: '/conversation', label: '会話',   labelEn: 'Chat',   Icon: IconChat, badge: 'AI' },
  { path: '/reader',       label: '読解',   labelEn: 'Reader', Icon: IconReader },
  { path: '/vocab',        label: '単語',   labelEn: 'Vocab',  Icon: IconVocab },
]

const STUDY: NavItem[] = [
  { path: '/kana',    label: 'かな', labelEn: 'Kana',    Icon: IconKana },
  { path: '/kanji',   label: '漢字', labelEn: 'Kanji',   Icon: IconKanji },
  { path: '/grammar', label: '文法', labelEn: 'Grammar', Icon: IconGrammar },
  { path: '/reading', label: '読書', labelEn: 'Reading', Icon: IconReading },
]

const MORE: NavItem[] = [
  { path: '/progress',  label: '進捗',   labelEn: 'Progress',  Icon: IconProgress },
  { path: '/guide',     label: 'ガイド', labelEn: 'Guide',     Icon: IconGuide },
  { path: '/resources', label: '資料',   labelEn: 'Resources', Icon: IconResources },
  { path: '/settings',  label: '設定',   labelEn: 'Settings',  Icon: IconSettings },
]

const BOTTOM_NAV: NavItem[] = [
  { path: '/',             label: 'ホーム', labelEn: 'Home',   Icon: IconHome },
  { path: '/vocab',        label: '単語',   labelEn: 'Vocab',  Icon: IconVocab },
  { path: '/conversation', label: '会話',   labelEn: 'Chat',   Icon: IconChat },
  { path: '/reader',       label: '読解',   labelEn: 'Reader', Icon: IconReader },
]

function NavRow({ item, dueCount, onNavigate }: { item: NavItem; dueCount: number; onNavigate?: () => void }) {
  const { Icon } = item
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      aria-label={item.labelEn}
      onClick={onNavigate}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon className="flex-shrink-0 text-current" size={18} />
      <div className="flex-1 min-w-0">
        <span className="japanese-text text-sm font-medium">{item.label}</span>
        <span className="ml-1.5 text-xs text-ink-400">{item.labelEn}</span>
      </div>
      {item.badge && <span className="tag-sakura text-xs">AI</span>}
      {item.path === '/vocab' && dueCount > 0 && (
        <span className="tag-gold">{dueCount}</span>
      )}
    </NavLink>
  )
}

function NavGroup({ title, items, dueCount }: { title: string; items: NavItem[]; dueCount: number }) {
  return (
    <div className="mb-3">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{title}</p>
      <div className="space-y-0.5">
        {items.map(item => (
          <NavRow key={item.path} item={item} dueCount={dueCount} />
        ))}
      </div>
    </div>
  )
}

export default function Layout() {
  const [showMore, setShowMore] = useState(false)
  const { streak, xp, username, getDueCards, streakFreezes, vocabCards } = useStore()
  const xpLevel = Math.floor(xp / 100)
  const xpProgress = xp % 100
  const dueCount = useMemo(() => getDueCards().length, [vocabCards])

  useEffect(() => {
    if (!showMore) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMore(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showMore])

  return (
    <div className="md:flex md:h-screen md:overflow-hidden bg-bg-primary">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r border-border bg-white shadow-sm">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sakura/10 border border-sakura/20 flex items-center justify-center text-sakura shadow-sm">
              <IconSakura size={20} />
            </div>
            <div>
              <h1 className="text-ink-100 font-bold text-sm japanese-text">日本語先生</h1>
              <p className="text-ink-400 text-xs">Nihongo Sensei</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-border bg-bg-primary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ink-200 text-sm font-semibold">{username}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sakura">
                <IconStreak size={16} className="streak-flame" />
                <span className="font-bold text-sm">{streak}</span>
              </div>
              {streakFreezes > 0 && (
                <div className="flex items-center gap-0.5 text-blue-500">
                  <IconFreeze size={14} />
                  <span className="font-bold text-xs">{streakFreezes}</span>
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

        <nav className="flex-1 p-3 overflow-y-auto">
          <NavGroup title="Practice" items={PRACTICE} dueCount={dueCount} />
          <NavGroup title="Study" items={STUDY} dueCount={dueCount} />
          <NavGroup title="More" items={MORE} dueCount={dueCount} />
        </nav>

        <div className="p-4 border-t border-border text-xs text-ink-400">
          {xp} XP total · <span className="text-jade font-medium">Keep going!</span>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:overflow-y-auto bg-bg-primary mobile-main">
        <div className="mobile-top-header md:hidden sticky top-0 z-30 bg-white border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 text-sakura">
              <IconSakura size={18} />
              <span className="japanese-text text-sm font-bold text-ink-100">日本語先生</span>
            </div>
            <div className="flex items-center gap-3">
              {streakFreezes > 0 && (
                <div className="flex items-center gap-0.5 text-blue-500">
                  <IconFreeze size={14} />
                  <span className="font-bold text-xs">{streakFreezes}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sakura">
                <IconStreak size={14} className="streak-flame" />
                <span className="font-bold text-sm">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gold text-xs font-bold">Lv.{xpLevel}</span>
                <div className="w-16 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sakura to-sakura-bright rounded-full transition-all duration-700"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border mobile-bottom-nav" aria-label="Primary">
        <div className="flex items-stretch h-full">
          {BOTTOM_NAV.map(item => {
            const { Icon } = item
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                aria-label={item.labelEn}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 text-center transition-colors relative
                   ${isActive ? 'text-sakura' : 'text-ink-400'}`
                }
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium leading-none">{item.labelEn}</span>
                {item.path === '/vocab' && dueCount > 0 && (
                  <span className="absolute top-1.5 right-[calc(50%-14px)] w-4 h-4 rounded-full bg-sakura text-white text-[9px] font-bold flex items-center justify-center">
                    {dueCount > 9 ? '9+' : dueCount}
                  </span>
                )}
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={() => setShowMore(true)}
            aria-expanded={showMore}
            aria-haspopup="dialog"
            aria-label="More sections"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-ink-400 transition-colors"
          >
            <IconMore size={20} />
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
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="All sections"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl more-drawer"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <p className="text-center text-xs text-ink-400 pb-2">Study & more</p>
              <div className="px-3 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 px-1 mb-1">Study</p>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {STUDY.map(item => {
                    const { Icon } = item
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMore(false)}
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                           ${isActive ? 'bg-sakura/10 text-sakura' : 'text-ink-300 hover:bg-bg-secondary'}`
                        }
                      >
                        <Icon size={22} />
                        <span className="text-[11px] font-medium text-center leading-tight">{item.labelEn}</span>
                      </NavLink>
                    )
                  })}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 px-1 mb-1">More</p>
                <div className="grid grid-cols-4 gap-1 pb-3">
                  {MORE.map(item => {
                    const { Icon } = item
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMore(false)}
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                           ${isActive ? 'bg-sakura/10 text-sakura' : 'text-ink-300 hover:bg-bg-secondary'}`
                        }
                      >
                        <Icon size={22} />
                        <span className="text-[11px] font-medium text-center leading-tight">{item.labelEn}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
