/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ElectronAPI {
  startCapture: () => Promise<void>
  stopCapture: () => Promise<void>
  onCaptureText: (callback: (text: string) => void) => () => void
}

interface Window {
  electronAPI?: ElectronAPI
}
