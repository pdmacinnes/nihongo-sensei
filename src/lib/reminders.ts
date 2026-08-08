// Daily study reminder scheduler. Keeps a single timeout so toggles don't stack,
// and can be re-armed from App on startup after a refresh.

import { useStore } from '../store'

let reminderTimer: ReturnType<typeof setTimeout> | null = null

export function clearStudyReminder() {
  if (reminderTimer !== null) {
    clearTimeout(reminderTimer)
    reminderTimer = null
  }
}

export function scheduleStudyReminder(time: string) {
  clearStudyReminder()
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return

  const now = new Date()
  const next = new Date()
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)

  reminderTimer = setTimeout(() => {
    reminderTimer = null
    const { notificationsEnabled, reminderTime } = useStore.getState()
    if (!notificationsEnabled || Notification.permission !== 'granted') return
    new Notification('日本語先生 — Time to study! 🌸', {
      body: 'Your reviews are waiting. Keep your streak alive!',
      icon: './icon-192.png',
    })
    scheduleStudyReminder(reminderTime)
  }, next.getTime() - now.getTime())
}
