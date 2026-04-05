// Web Speech API TTS — free, browser-native, works great for Japanese
// No backend or API key needed

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, options?: { rate?: number; slow?: boolean }) {
  if (!window.speechSynthesis) return

  // Cancel any current speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = options?.slow ? 0.7 : (options?.rate ?? 0.9)
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to find a Japanese voice
  const voices = window.speechSynthesis.getVoices()
  const japaneseVoice = voices.find(v => v.lang === 'ja-JP' && v.localService) ||
                        voices.find(v => v.lang === 'ja-JP') ||
                        voices.find(v => v.lang.startsWith('ja'))
  if (japaneseVoice) utterance.voice = japaneseVoice

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function speakSlow(text: string) {
  speak(text, { slow: true })
}

export function stopSpeech() {
  window.speechSynthesis?.cancel()
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// SpeakButton component helper — returns onClick handler
export function createSpeakHandler(text: string, slow = false) {
  return (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(text, { slow })
  }
}
