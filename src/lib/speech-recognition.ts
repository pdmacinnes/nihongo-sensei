// Web Speech API speech-to-text — free, browser-native, same approach as tts.ts.
// Chrome/Edge only (webkitSpeechRecognition); Firefox and Safari don't implement it, so callers
// must feature-detect with isSpeechRecognitionAvailable() and hide the mic UI rather than error.
// Not in TS's DOM lib (still non-standard), hence the `any`s here — kept isolated to this file.

function getRecognitionCtor(): (new () => any) | undefined {
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition
}

export function isSpeechRecognitionAvailable(): boolean {
  return typeof window !== 'undefined' && !!getRecognitionCtor()
}

export interface RecognitionHandle {
  stop: () => void
}

export function startRecognition(opts: {
  onResult: (transcript: string) => void
  onEnd?: () => void
  onError?: (error: string) => void
}): RecognitionHandle | null {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return null

  const recognition = new Ctor()
  recognition.lang = 'ja-JP'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (e: any) => {
    const transcript = e.results?.[0]?.[0]?.transcript
    if (transcript) opts.onResult(transcript)
  }
  recognition.onerror = (e: any) => opts.onError?.(e.error ?? 'unknown')
  recognition.onend = () => opts.onEnd?.()

  recognition.start()
  return { stop: () => recognition.stop() }
}
