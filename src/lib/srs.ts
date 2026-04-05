// FSRS-inspired SRS with learning steps
// Research-backed: 90% target retention, learning pipeline before main queue
// Based on Animecards/Refold best practices

export type SRSRating = 'again' | 'hard' | 'good' | 'easy'
export type CardState = 'new' | 'learning' | 'review' | 'relearning'

// Learning steps in minutes before entering main review queue
// Based on Animecards recommendation: 1m → 10m → 1d
const LEARNING_STEPS_MIN = [1, 10]
const RELEARNING_STEPS_MIN = [10]

export interface SRSCard {
  id: string
  state: CardState
  stepIndex: number       // which learning step we're on
  easeFactor: number      // 1.3 to 5.0, default 2.5
  interval: number        // days until next review (for review cards)
  repetitions: number
  dueDate: number         // timestamp ms
  lapses: number
}

const MIN_MS = 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export function createSRSCard(id: string): SRSCard {
  return {
    id,
    state: 'new',
    stepIndex: 0,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: Date.now(),
    lapses: 0,
  }
}

export function reviewCard(card: SRSCard, rating: SRSRating): SRSCard {
  const now = Date.now()

  // --- LEARNING / RELEARNING ---
  if (card.state === 'new' || card.state === 'learning') {
    const steps = LEARNING_STEPS_MIN
    if (rating === 'again') {
      return { ...card, state: 'learning', stepIndex: 0, dueDate: now + steps[0] * MIN_MS }
    }
    if (rating === 'easy') {
      // Jump straight to review with 4-day interval
      return { ...card, state: 'review', stepIndex: 0, interval: 4, repetitions: 1,
               easeFactor: card.easeFactor + 0.15, dueDate: now + 4 * DAY_MS }
    }
    // good/hard: advance through steps
    const nextStep = card.stepIndex + 1
    if (nextStep >= steps.length) {
      // Graduate to review queue
      return { ...card, state: 'review', stepIndex: 0, interval: 1, repetitions: 1,
               dueDate: now + 1 * DAY_MS }
    }
    return { ...card, state: 'learning', stepIndex: nextStep,
             dueDate: now + steps[nextStep] * MIN_MS }
  }

  if (card.state === 'relearning') {
    const steps = RELEARNING_STEPS_MIN
    if (rating === 'again') {
      return { ...card, stepIndex: 0, dueDate: now + steps[0] * MIN_MS }
    }
    const nextStep = card.stepIndex + 1
    if (nextStep >= steps.length) {
      // Re-graduate: short interval after lapse
      const interval = Math.max(1, Math.floor(card.interval * 0.5))
      return { ...card, state: 'review', stepIndex: 0, interval,
               dueDate: now + interval * DAY_MS }
    }
    return { ...card, stepIndex: nextStep, dueDate: now + steps[nextStep] * MIN_MS }
  }

  // --- REVIEW (main queue) ---
  if (rating === 'again') {
    return {
      ...card,
      state: 'relearning',
      stepIndex: 0,
      easeFactor: Math.max(1.3, card.easeFactor - 0.2),
      lapses: card.lapses + 1,
      dueDate: now + RELEARNING_STEPS_MIN[0] * MIN_MS,
    }
  }

  // FSRS-inspired interval calculation targeting ~90% retention
  let newInterval: number
  let newEase = card.easeFactor

  if (rating === 'hard') {
    newInterval = Math.max(1, Math.floor(card.interval * 1.2))
    newEase = Math.max(1.3, card.easeFactor - 0.15)
  } else if (rating === 'good') {
    newInterval = Math.max(1, Math.round(card.interval * card.easeFactor))
  } else { // easy
    newInterval = Math.max(4, Math.round(card.interval * card.easeFactor * 1.3))
    newEase = Math.min(5.0, card.easeFactor + 0.15)
  }

  // Apply jitter (±5%) to spread reviews and avoid clustering
  const jitter = 1 + (Math.random() * 0.1 - 0.05)
  newInterval = Math.round(newInterval * jitter)

  return {
    ...card,
    state: 'review',
    interval: newInterval,
    repetitions: card.repetitions + 1,
    easeFactor: newEase,
    dueDate: now + newInterval * DAY_MS,
  }
}

export function isDue(card: SRSCard): boolean {
  return Date.now() >= card.dueDate
}

export function daysUntilDue(card: SRSCard): number {
  const diff = card.dueDate - Date.now()
  return Math.max(0, Math.ceil(diff / DAY_MS))
}

export function minutesUntilDue(card: SRSCard): number {
  const diff = card.dueDate - Date.now()
  return Math.max(0, Math.ceil(diff / MIN_MS))
}

export function getMaturityLabel(card: SRSCard): string {
  if (card.state === 'new') return 'New'
  if (card.state === 'learning' || card.state === 'relearning') return 'Learning'
  if (card.interval < 7) return 'Young'
  if (card.interval < 21) return 'Maturing'
  if (card.interval < 60) return 'Mature'
  return 'Mastered'
}

export function getMaturityColor(card: SRSCard): string {
  const label = getMaturityLabel(card)
  switch (label) {
    case 'New':      return 'text-ink-400'
    case 'Learning': return 'text-blue-500'
    case 'Young':    return 'text-jade'
    case 'Maturing': return 'text-jade-bright'
    case 'Mature':   return 'text-gold'
    case 'Mastered': return 'text-sakura'
    default:         return 'text-ink-400'
  }
}

// How many new cards to show today (respects daily limit)
export function getNewCardsForToday(
  cards: SRSCard[],
  dailyLimit: number,
  newCardsSeenToday: number
): SRSCard[] {
  const remaining = Math.max(0, dailyLimit - newCardsSeenToday)
  return cards.filter(c => c.state === 'new').slice(0, remaining)
}
