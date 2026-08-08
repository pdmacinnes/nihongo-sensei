/** Small SVG icon set — stroke style, currentColor. */

import type { ReactNode } from 'react'

type IconProps = {
  className?: string
  size?: number
}

function Svg({ size = 20, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconHome(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </Svg>
  )
}

export function IconChat(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </Svg>
  )
}

export function IconReader(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 5h7a3 3 0 0 1 3 3v11a2.5 2.5 0 0 0-2.5-2.5H4V5z" />
      <path d="M20 5h-7a3 3 0 0 0-3 3v11a2.5 2.5 0 0 1 2.5-2.5H20V5z" />
    </Svg>
  )
}

export function IconVocab(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </Svg>
  )
}

export function IconKana(p: IconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-medium japanese-text leading-none ${p.className ?? ''}`}
      style={{ width: p.size ?? 20, height: p.size ?? 20, fontSize: (p.size ?? 20) * 0.85 }}
      aria-hidden="true"
    >
      あ
    </span>
  )
}

export function IconKanji(p: IconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-medium japanese-text leading-none ${p.className ?? ''}`}
      style={{ width: p.size ?? 20, height: p.size ?? 20, fontSize: (p.size ?? 20) * 0.8 }}
      aria-hidden="true"
    >
      漢
    </span>
  )
}

export function IconGrammar(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 19V6.5A2.5 2.5 0 0 1 7.5 4H14l5 5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M13 4v5h5M8 13h8M8 16h5" />
    </Svg>
  )
}

export function IconReading(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V7z" />
      <path d="M16 9h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2h-2" />
      <path d="M8 11h5M8 14h5" />
    </Svg>
  )
}

export function IconProgress(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" />
    </Svg>
  )
}

export function IconGuide(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4z" />
      <path d="M17 4h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2h-2" />
    </Svg>
  )
}

export function IconResources(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M3 12h18M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" />
    </Svg>
  )
}

export function IconSettings(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

export function IconMore(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconStreak(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 22c4-2.5 6-5.5 6-9.5 0-3.2-1.8-5.4-3.5-7C14 7 13 9 12.5 10.5 11.5 8.5 10 7 8.5 5.5 7.2 7.2 6 9.5 6 12.5 6 16.5 8 19.5 12 22z" />
    </Svg>
  )
}

export function IconFreeze(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v18M6.5 6.5l11 11M17.5 6.5l-11 11M4 12h16" />
    </Svg>
  )
}

export function IconSakura(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 4c1.2 2.2 1.2 4.2 0 6-1.2-1.8-1.2-3.8 0-6zM12 14c1.2 2.2 1.2 4.2 0 6-1.2-1.8-1.2-3.8 0-6zM4 12c2.2-1.2 4.2-1.2 6 0-1.8 1.2-3.8 1.2-6 0zM14 12c2.2-1.2 4.2-1.2 6 0-1.8 1.2-3.8 1.2-6 0z" />
      <path d="M6.5 6.5c2 .5 3.5 1.5 4.2 3.2-1.7-.7-3.2-.5-4.2-1.2zM13.3 14.3c.7 1.7 2.2 2.7 4.2 3.2-1-.7-2.5-.5-4.2-1.2zM17.5 6.5c-2 .5-3.5 1.5-4.2 3.2 1.7-.7 3.2-.5 4.2-1.2zM10.7 14.3c-.7 1.7-2.2 2.7-4.2 3.2 1-.7 2.5-.5 4.2-1.2z" />
    </Svg>
  )
}

export function IconArrow(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  )
}
