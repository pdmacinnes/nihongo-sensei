import { useState } from 'react'
import { motion } from 'framer-motion'

type ResourceType = 'youtube' | 'website' | 'book' | 'tool' | 'community' | 'app'

interface Resource {
  title: string
  type: ResourceType
  description: string
  url: string
  free: boolean
  note?: string
}

interface Section {
  id: string
  icon: string
  title: string
  titleJp: string
  description: string
  resources: Resource[]
}

const TYPE_META: Record<ResourceType, { label: string; color: string }> = {
  youtube:   { label: 'YouTube',   color: 'bg-red-50 text-red-600 border-red-200' },
  website:   { label: 'Website',   color: 'bg-blue-50 text-blue-600 border-blue-200' },
  book:      { label: 'Book',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  tool:      { label: 'Tool',      color: 'bg-purple-50 text-purple-600 border-purple-200' },
  community: { label: 'Community', color: 'bg-green-50 text-green-600 border-green-200' },
  app:       { label: 'App',       color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
}

const SECTIONS: Section[] = [
  {
    id: 'kana',
    icon: 'あ',
    title: 'Hiragana & Katakana',
    titleJp: '仮名',
    description: 'Master the two phonetic alphabets — the essential first step.',
    resources: [
      {
        title: 'Tofugu Hiragana Guide',
        type: 'website',
        description: 'The most thorough free hiragana guide online. Uses mnemonics for every character so you can learn all 46 in a few hours.',
        url: 'https://www.tofugu.com/japanese/hiragana/',
        free: true,
      },
      {
        title: 'Tofugu Katakana Guide',
        type: 'website',
        description: 'Same approach as their hiragana guide — mnemonic-based, beautifully illustrated, designed to stick.',
        url: 'https://www.tofugu.com/japanese/katakana/',
        free: true,
      },
      {
        title: 'Learn Hiragana in 1 Hour — JapanesePod101',
        type: 'youtube',
        description: 'A single sitting walkthrough of the complete hiragana chart with audio pronunciation for every character.',
        url: 'https://www.youtube.com/results?search_query=japanesepod101+learn+hiragana+1+hour',
        free: true,
      },
      {
        title: 'Learn Katakana in 1 Hour — JapanesePod101',
        type: 'youtube',
        description: 'Companion video covering all katakana with the same clear, structured format.',
        url: 'https://www.youtube.com/results?search_query=japanesepod101+learn+katakana+1+hour',
        free: true,
      },
    ],
  },
  {
    id: 'grammar',
    icon: '文',
    title: 'Grammar & Sentence Structure',
    titleJp: '文法',
    description: 'Learn how Japanese sentences are built — particles, verb conjugations, and more.',
    resources: [
      {
        title: "Tae Kim's Guide to Japanese Grammar",
        type: 'website',
        description: 'The most-recommended free grammar reference for beginners and intermediates. Covers everything from particles to complex conjugations in a logical order.',
        url: 'https://guidetojapanese.org/learn/grammar',
        free: true,
      },
      {
        title: 'Organic Japanese with Cure Dolly',
        type: 'youtube',
        description: 'Teaches Japanese grammar from a structural perspective, making patterns feel logical rather than memorized. Channel is archived — search for the playlist.',
        url: 'https://www.youtube.com/results?search_query=organic+japanese+cure+dolly+complete+course',
        free: true,
        note: 'Channel archived — search for the full playlist',
      },
      {
        title: 'Japanese Ammo with Misa',
        type: 'youtube',
        description: 'Native speaker breaking down grammar points in an accessible, example-heavy way. Great for beginners who find textbooks dry.',
        url: 'https://www.youtube.com/results?search_query=japanese+ammo+misa+absolute+beginner',
        free: true,
      },
      {
        title: 'ToKini Andy — Genki Textbook Lessons',
        type: 'youtube',
        description: 'Free video companion to the popular Genki textbook series. Covers N5–N4 grammar systematically with clear explanations.',
        url: 'https://www.youtube.com/results?search_query=tokini+andy+genki+grammar',
        free: true,
      },
      {
        title: 'Bunpro — Grammar SRS',
        type: 'website',
        description: 'Spaced repetition specifically for grammar points. Covers N5–N1 with example sentences, explanations, and links to external resources.',
        url: 'https://bunpro.jp',
        free: false,
        note: 'Free trial available, then paid',
      },
      {
        title: 'Genki Textbook Series',
        type: 'book',
        description: 'The gold standard classroom textbook for beginners through low-intermediate (N5–N4). Structured, thorough, with audio materials.',
        url: 'https://www.amazon.com/s?k=genki+japanese+textbook',
        free: false,
        note: 'Paid — widely available',
      },
    ],
  },
  {
    id: 'kanji',
    icon: '漢',
    title: 'Kanji Learning',
    titleJp: '漢字',
    description: 'Strategies and resources for tackling the ~2,000 kanji used in everyday Japanese.',
    resources: [
      {
        title: 'WaniKani',
        type: 'app',
        description: 'A web app that teaches kanji and vocabulary using mnemonics + SRS. Gets you through all 2,000 Jōyō kanji. Levels 1–3 are free.',
        url: 'https://www.wanikani.com',
        free: false,
        note: 'Free for first 3 levels, then subscription',
      },
      {
        title: 'Kanji Koohii',
        type: 'website',
        description: 'Community site built around "Remembering the Kanji" — share and browse user-made mnemonics (stories) for every kanji.',
        url: 'https://kanji.koohii.com',
        free: true,
      },
      {
        title: 'Remembering the Kanji (RTK)',
        type: 'book',
        description: 'Classic textbook by James Heisig that teaches kanji through imaginative stories. Focuses on writing and meaning before readings — controversial but effective for many learners.',
        url: 'https://www.amazon.com/s?k=remembering+the+kanji+heisig',
        free: false,
        note: 'Paid book',
      },
      {
        title: 'Kanji Learning Methods Compared — Tofugu',
        type: 'website',
        description: 'An in-depth article comparing RTK, WaniKani, and other approaches to help you pick the right method.',
        url: 'https://www.tofugu.com/japanese/best-way-to-learn-kanji/',
        free: true,
      },
      {
        title: 'Kanji Alive',
        type: 'website',
        description: 'Free tool from the University of Chicago with stroke order animations, readings, and example words for 2,000+ kanji.',
        url: 'https://kanjialive.com',
        free: true,
      },
    ],
  },
  {
    id: 'vocabulary',
    icon: '単',
    title: 'Vocabulary Building',
    titleJp: '語彙',
    description: 'Efficient methods and resources for expanding your Japanese word bank.',
    resources: [
      {
        title: 'Jisho — Japanese Dictionary',
        type: 'website',
        description: 'The best free Japanese–English dictionary online. Supports kanji lookup by radical, stroke count, JLPT level, and handwriting input.',
        url: 'https://jisho.org',
        free: true,
      },
      {
        title: 'Anki — Spaced Repetition Flashcards',
        type: 'app',
        description: 'The most powerful free SRS flashcard app. Use community decks like "Core 2K/6K" or "JLPT Tango" series for vocabulary, or build your own from content you encounter.',
        url: 'https://apps.ankiweb.net',
        free: true,
      },
      {
        title: 'AnkiWeb Shared Decks — Japanese',
        type: 'website',
        description: 'Thousands of community-made Anki decks for Japanese — Core 2000, Core 6000, JLPT N5–N1 vocab, and more.',
        url: 'https://ankiweb.net/shared/decks?search=japanese',
        free: true,
      },
      {
        title: 'JLPT Sensei — Vocabulary Lists',
        type: 'website',
        description: 'Complete JLPT vocabulary lists for N5 through N1 with readings, meanings, and example sentences.',
        url: 'https://jlptsensei.com/jlpt-vocabulary-list/',
        free: true,
      },
    ],
  },
  {
    id: 'listening',
    icon: '聴',
    title: 'Listening & Comprehension',
    titleJp: '聴解',
    description: 'Train your ear with graded and native content — the fastest path to fluency.',
    resources: [
      {
        title: 'Comprehensible Japanese',
        type: 'youtube',
        description: 'A massive library of i+1 input videos in Japanese — complete beginner through advanced. The host speaks slowly and clearly with visual aids. One of the best free immersion resources.',
        url: 'https://www.youtube.com/@ComprehensibleJapanese',
        free: true,
      },
      {
        title: 'NHK Web Easy',
        type: 'website',
        description: 'Real Japanese news written in simplified language with furigana over all kanji. Updated daily — great for intermediate learners who want to read/listen to authentic content.',
        url: 'https://www3.nhk.or.jp/news/easy/',
        free: true,
      },
      {
        title: 'JapanesePod101',
        type: 'youtube',
        description: 'One of the largest Japanese learning channels with lessons at every level, vocabulary videos, and cultural content. The YouTube channel is free; the full platform is paid.',
        url: 'https://www.youtube.com/@JapanesePod101',
        free: true,
        note: 'YouTube channel is free; full site is subscription',
      },
      {
        title: 'Satori Reader',
        type: 'app',
        description: 'Graded reading and listening with audio recordings by native speakers. Sentences are annotated — tap any word to see its definition and grammar notes.',
        url: 'https://www.satorireader.com',
        free: false,
        note: 'Subscription, first episodes free',
      },
      {
        title: 'Erin\'s Challenge! — Japan Foundation',
        type: 'website',
        description: 'A free video-based Japanese course from the Japan Foundation. Real actors, real situations, transcripts and exercises included.',
        url: 'https://www.erin.ne.jp/en/',
        free: true,
      },
    ],
  },
  {
    id: 'pronunciation',
    icon: '音',
    title: 'Pronunciation & Pitch Accent',
    titleJp: '発音',
    description: 'Sound natural — Japanese pitch accent is what separates good from great pronunciation.',
    resources: [
      {
        title: 'Dogen — Japanese Phonetics',
        type: 'youtube',
        description: 'The definitive resource on Japanese pitch accent. Dogen is a gaijin comedian who achieved near-native pronunciation. His Patreon course is the gold standard; his free YouTube videos are still excellent.',
        url: 'https://www.youtube.com/results?search_query=dogen+japanese+pitch+accent',
        free: true,
        note: 'Free preview videos on YouTube; full course on Patreon',
      },
      {
        title: 'Forvo — Japanese Pronunciation',
        type: 'website',
        description: 'Crowdsourced audio pronunciations of Japanese words by native speakers. Great for checking how a specific word sounds in natural speech.',
        url: 'https://forvo.com/languages/ja/',
        free: true,
      },
      {
        title: 'OJAD — Online Japanese Accent Dictionary',
        type: 'website',
        description: 'Academic tool that shows pitch accent patterns for thousands of words and verb/adjective conjugations. Includes a search and text input mode.',
        url: 'https://www.gavo.t.u-tokyo.ac.jp/ojad/eng/pages/home',
        free: true,
      },
      {
        title: 'Prosody Tutor Suzuki-kun (in OJAD)',
        type: 'website',
        description: 'Part of OJAD — paste Japanese text and it generates a pitch accent overlay for the whole passage. Very useful for reading practice.',
        url: 'https://www.gavo.t.u-tokyo.ac.jp/ojad/eng/phrasing/index',
        free: true,
      },
    ],
  },
  {
    id: 'jlpt',
    icon: '試',
    title: 'JLPT Test Preparation',
    titleJp: 'JLPT対策',
    description: 'Targeted practice for the Japanese Language Proficiency Test (N5–N1).',
    resources: [
      {
        title: 'Official JLPT Website',
        type: 'website',
        description: 'Registration info, test format, sample questions, and past test papers. Start here to understand what the test actually expects.',
        url: 'https://www.jlpt.jp/e/',
        free: true,
      },
      {
        title: 'JLPT Sensei',
        type: 'website',
        description: 'Comprehensive JLPT prep site with grammar, vocabulary, kanji, and reading lists for every level. Includes practice questions.',
        url: 'https://jlptsensei.com',
        free: true,
      },
      {
        title: 'Nihongo no Mori',
        type: 'youtube',
        description: 'Japanese teachers explain JLPT grammar points in Japanese — great once you\'re past N5. Covers N3–N1 in detail.',
        url: 'https://www.youtube.com/results?search_query=nihongo+no+mori+JLPT',
        free: true,
      },
      {
        title: 'Try! JLPT Textbook Series',
        type: 'book',
        description: 'Level-specific workbooks (N5–N1) with grammar explanations, practice questions, and mock tests. Popular alternative to the official prep books.',
        url: 'https://www.amazon.com/s?k=try+jlpt+textbook',
        free: false,
        note: 'Paid book',
      },
    ],
  },
  {
    id: 'immersion',
    icon: '浸',
    title: 'Immersion & Input Method',
    titleJp: '浸透学習',
    description: 'Acquire Japanese naturally through massive exposure to comprehensible input.',
    resources: [
      {
        title: 'Refold Japanese Roadmap',
        type: 'website',
        description: 'Structured immersion learning roadmap from Matt vs Japan and others. Explains the input hypothesis and how to go from zero to fluency through native content.',
        url: 'https://refold.la/roadmap',
        free: true,
      },
      {
        title: 'Matt vs Japan — Immersion Learning',
        type: 'youtube',
        description: 'Matt achieved native-level Japanese through immersion alone. His channel covers the methodology, tools, and mindset for immersion-based learning.',
        url: 'https://www.youtube.com/results?search_query=matt+vs+japan',
        free: true,
      },
      {
        title: 'Yomitan — Browser Extension',
        type: 'tool',
        description: 'A must-have browser extension that lets you hover over any Japanese text on the web to instantly see readings and definitions. Essential for immersion reading.',
        url: 'https://github.com/themoeway/yomitan',
        free: true,
      },
      {
        title: 'Language Reactor',
        type: 'tool',
        description: 'Browser extension for Netflix and YouTube that shows dual subtitles, lets you look up words instantly, and save them to a flashcard deck.',
        url: 'https://www.languagereactor.com',
        free: true,
        note: 'Free tier available, Pro adds more features',
      },
      {
        title: 'Migaku — Immersion Tools',
        type: 'tool',
        description: 'Suite of tools for mining vocabulary from anime, shows, and manga into Anki. Adds pitch accent, frequency, and audio to cards automatically.',
        url: 'https://www.migaku.com',
        free: false,
        note: 'Subscription',
      },
      {
        title: 'jpdb.io — Difficulty-Rated VN/Anime Lists',
        type: 'website',
        description: 'Browse visual novels and anime with machine-learning-generated difficulty ratings, so you can pick something at your actual level instead of diving into something too hard. Also doubles as a Japanese dictionary.',
        url: 'https://jpdb.io/',
        free: true,
        note: 'Manga difficulty lists not supported yet (per their FAQ)',
      },
      {
        title: 'Textractor — VN Text Hooker',
        type: 'tool',
        description: 'Free, open-source tool that extracts text live from visual novels as you play. Pairs with this app\'s Reader page (Electron build) — enable Textractor\'s Clipboard extension, then turn on Capture Mode in the Reader.',
        url: 'https://github.com/Artikash/Textractor',
        free: true,
      },
    ],
  },
  {
    id: 'community',
    icon: '人',
    title: 'Community & Speaking Practice',
    titleJp: 'コミュニティ',
    description: 'Find native speakers, tutors, and fellow learners to practice with.',
    resources: [
      {
        title: 'HelloTalk',
        type: 'app',
        description: 'Language exchange app that pairs you with native Japanese speakers who want to learn your language. Text, voice, and video chat built in.',
        url: 'https://www.hellotalk.com',
        free: true,
        note: 'Free with optional premium',
      },
      {
        title: 'Italki — Find a Tutor',
        type: 'website',
        description: 'Marketplace to book 1-on-1 lessons with professional Japanese teachers or community tutors. More affordable than local schools.',
        url: 'https://www.italki.com/en/teachers/japanese',
        free: false,
        note: 'Paid per lesson',
      },
      {
        title: 'r/LearnJapanese',
        type: 'community',
        description: 'Large, active Reddit community for Japanese learners. Great wiki with beginner resources, weekly questions thread, and progress posts for motivation.',
        url: 'https://www.reddit.com/r/LearnJapanese/',
        free: true,
      },
      {
        title: 'Tandem — Language Exchange',
        type: 'app',
        description: 'Similar to HelloTalk — connects you with native speakers for language exchange. Clean interface with built-in translation and correction tools.',
        url: 'https://www.tandem.net',
        free: true,
        note: 'Free with optional Pro',
      },
      {
        title: 'Tofugu Podcast — SpeakJapanese',
        type: 'website',
        description: 'Tofugu\'s articles on the culture of language learning, study tips, and Japanese culture. Not a podcast anymore but the archives are gold.',
        url: 'https://www.tofugu.com',
        free: true,
      },
    ],
  },
  {
    id: 'reference',
    icon: '辞',
    title: 'Quick Reference & Lookup Tools',
    titleJp: '参考資料',
    description: 'Keep these bookmarked — you\'ll use them every study session.',
    resources: [
      {
        title: 'Jisho.org',
        type: 'website',
        description: 'The best Japanese–English dictionary online. Radicals search, stroke order, JLPT levels, example sentences. Start here when you see an unknown word.',
        url: 'https://jisho.org',
        free: true,
      },
      {
        title: 'Takoboto — Mobile Dictionary',
        type: 'app',
        description: 'Offline-capable Japanese dictionary app with handwriting recognition. Great when you see kanji in the wild and can\'t look it up online.',
        url: 'https://takoboto.jp',
        free: true,
      },
      {
        title: 'Kotobank — Japanese Monolingual',
        type: 'website',
        description: 'Japanese monolingual dictionary (definitions in Japanese). Transition to this once you\'re intermediate+ to train yourself to think in Japanese.',
        url: 'https://kotobank.jp',
        free: true,
      },
      {
        title: 'Japanese Conjugation Practice',
        type: 'website',
        description: 'Drill Japanese verb and adjective conjugations across all forms — て-form, potential, passive, causative, and more.',
        url: 'https://jlptsensei.com/japanese-verb-conjugation/',
        free: true,
      },
    ],
  },
]

const ALL_TYPES: ResourceType[] = ['youtube', 'website', 'book', 'tool', 'community', 'app']

export default function Resources() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(SECTIONS.map(s => s.id)))
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all')

  const toggle = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setOpenSections(new Set(SECTIONS.map(s => s.id)))
  const collapseAll = () => setOpenSections(new Set())

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="section-header mb-6">
        <div>
          <h1 className="page-title">
            <span className="japanese-text text-sakura">資料</span> Resources
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">
            Curated external resources to accelerate your Japanese — organized by skill
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="btn-ghost text-xs text-ink-400">Expand all</button>
          <button onClick={collapseAll} className="btn-ghost text-xs text-ink-400">Collapse all</button>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-7">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
            typeFilter === 'all' ? 'bg-ink-100 text-white border-ink-100' : 'bg-white border-border text-ink-300 hover:border-ink-300'
          }`}
        >
          All types
        </button>
        {ALL_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(prev => prev === t ? 'all' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              typeFilter === t
                ? TYPE_META[t].color + ' border-current'
                : 'bg-white border-border text-ink-300 hover:border-ink-300'
            }`}
          >
            {TYPE_META[t].label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section, si) => {
          const filtered = typeFilter === 'all'
            ? section.resources
            : section.resources.filter(r => r.type === typeFilter)

          if (typeFilter !== 'all' && filtered.length === 0) return null

          const isOpen = openSections.has(section.id)

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.04 }}
              className="card overflow-hidden p-0"
            >
              {/* Section header — clickable to collapse */}
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-bg-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-sakura/10 border border-sakura/20 flex items-center justify-center flex-shrink-0">
                  <span className="japanese-text text-lg text-sakura font-bold">{section.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-ink-100 font-bold">{section.title}</h2>
                    <span className="japanese-text text-ink-400 text-sm">{section.titleJp}</span>
                    <span className="text-ink-400 text-xs ml-auto mr-2">
                      {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-ink-400 text-sm truncate">{section.description}</p>
                </div>
                <span className="text-ink-400 text-sm flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Resources grid */}
              {isOpen && (
                <div className="px-5 pb-5 grid gap-3 sm:grid-cols-2">
                  {filtered.map(resource => {
                    const meta = TYPE_META[resource.type]
                    return (
                      <a
                        key={resource.title}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl border border-border bg-bg-primary hover:border-sakura/40 hover:shadow-card-md transition-all duration-200 group"
                      >
                        {/* Type badge + free indicator */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>
                            {meta.label}
                          </span>
                          {resource.free
                            ? <span className="text-xs text-jade font-medium">Free</span>
                            : <span className="text-xs text-ink-400">Paid</span>
                          }
                          <span className="ml-auto text-ink-400 text-xs group-hover:text-sakura transition-colors">↗</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-ink-100 font-semibold text-sm mb-1.5 group-hover:text-sakura transition-colors leading-snug">
                          {resource.title}
                        </h3>

                        {/* Description */}
                        <p className="text-ink-400 text-xs leading-relaxed">
                          {resource.description}
                        </p>

                        {/* Note */}
                        {resource.note && (
                          <p className="text-gold text-xs mt-2 font-medium">⚠ {resource.note}</p>
                        )}
                      </a>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="text-ink-400 text-xs text-center mt-10">
        All links open in a new tab · Free resources are marked in green · Paid resources often have free tiers
      </p>
    </div>
  )
}
