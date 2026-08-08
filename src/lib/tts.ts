// Web Speech API TTS — free, browser-native, works great for Japanese
// No backend or API key needed

let currentUtterance: SpeechSynthesisUtterance | null = null
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve([])
  }
  if (!voicesReady) {
    voicesReady = new Promise(resolve => {
      const syn = window.speechSynthesis
      const ready = () => {
        const list = syn.getVoices()
        if (list.length > 0) {
          syn.removeEventListener('voiceschanged', ready)
          resolve(list)
        }
      }
      // Chrome often returns [] until voiceschanged fires
      ready()
      if (syn.getVoices().length === 0) {
        syn.addEventListener('voiceschanged', ready)
        // Fallback if the event never fires
        setTimeout(() => resolve(syn.getVoices()), 1000)
      }
    })
  }
  return voicesReady
}

// Warm the voice list as soon as the module loads in the browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
}

function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find(v => v.lang === 'ja-JP' && v.localService) ||
    voices.find(v => v.lang === 'ja-JP') ||
    voices.find(v => v.lang.startsWith('ja'))
}

export async function speak(text: string, options?: { rate?: number; slow?: boolean }) {
  if (!window.speechSynthesis || !text.trim()) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = options?.slow ? 0.7 : (options?.rate ?? 0.9)
  utterance.pitch = 1.0
  utterance.volume = 1.0

  const voices = await loadVoices()
  const japaneseVoice = pickJapaneseVoice(voices)
  if (japaneseVoice) utterance.voice = japaneseVoice

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function speakSlow(text: string) {
  void speak(text, { slow: true })
}

export function stopSpeech() {
  window.speechSynthesis?.cancel()
  currentUtterance = null
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** SpeakButton helper — returns onClick handler */
export function createSpeakHandler(text: string, slow = false) {
  return (e: React.MouseEvent) => {
    e.stopPropagation()
    void speak(text, { slow })
  }
}
