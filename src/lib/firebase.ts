import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore, doc, setDoc, getDoc } from 'firebase/firestore'

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function isFirebaseConfigured(): boolean {
  return !!import.meta.env.VITE_FIREBASE_PROJECT_ID
}

export function initFirebase(): boolean {
  if (!isFirebaseConfigured()) return false
  if (db) return true // already initialised
  try {
    app = initializeApp({
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    })
    db = getFirestore(app)
    return true
  } catch (e) {
    console.error('[Firebase] Init failed:', e)
    return false
  }
}

/** Upload the full app state to Firestore under the user's sync code. */
export async function uploadProgress(syncCode: string, state: Record<string, unknown>): Promise<boolean> {
  if (!db) return false
  try {
    await setDoc(doc(db, 'progress', syncCode), {
      lastModified: Date.now(),
      state: JSON.stringify(state),
    })
    return true
  } catch (e) {
    console.error('[Firebase] Upload failed:', e)
    return false
  }
}

/** Download app state from Firestore for the given sync code. Returns null if not found. */
export async function downloadProgress(
  syncCode: string
): Promise<{ lastModified: number; state: Record<string, unknown> } | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'progress', syncCode))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      lastModified: data.lastModified as number,
      state: JSON.parse(data.state as string) as Record<string, unknown>,
    }
  } catch (e) {
    console.error('[Firebase] Download failed:', e)
    return null
  }
}

/** Generate a human-readable 9-char sync code (XXXX-XXXX). */
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous 0/O, 1/I
  const raw = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${raw.slice(0, 4)}-${raw.slice(4)}`
}
