import * as kuromoji from 'kuromoji'
// @ts-expect-error kuromoji doesn't ship types for its internal loader
import BrowserDictionaryLoader from 'kuromoji/src/loader/BrowserDictionaryLoader.js'

// kuromoji's own gzip decompressor (zlibjs, a minified Closure-Compiler UMD bundle) fails
// under Rollup's production CJS interop — Zlib.Gunzip comes back undefined at runtime,
// even though it works fine in dev (esbuild pre-bundling papers over it). Rather than
// depend on that, decompress the dictionary files ourselves with the browser's native
// DecompressionStream and hand kuromoji's own loader the raw bytes.
BrowserDictionaryLoader.prototype.loadArrayBuffer = function (
  url: string,
  callback: (err: unknown, buffer: ArrayBuffer | null) => void
) {
  fetch(url)
    .then(res => {
      if (!res.ok || !res.body) throw new Error(res.statusText)
      const decompressed = res.body.pipeThrough(new DecompressionStream('gzip'))
      return new Response(decompressed).arrayBuffer()
    })
    .then(buffer => callback(null, buffer))
    .catch(err => callback(err, null))
}

export interface Token {
  surface: string      // as it appears in the text
  reading: string       // hiragana reading (empty for symbols/whitespace)
  basicForm: string     // dictionary form, for lookups/gloss
  pos: string            // part of speech (noun, verb, particle, ...)
  hasKanji: boolean
}

const KANJI_RE = /[一-龯㐀-䶿]/

function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  )
}

let tokenizerPromise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null

function loadTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: './kuromoji-dict/' }).build((err, tokenizer) => {
        if (err) reject(err)
        else resolve(tokenizer)
      })
    })
  }
  return tokenizerPromise
}

// Warm the dictionary early (call once, e.g. when the Reader page mounts) so
// the first tokenize() call isn't the one paying the ~15MB load cost.
export function preloadTokenizer(): Promise<void> {
  return loadTokenizer().then(() => undefined)
}

export async function tokenize(text: string): Promise<Token[]> {
  const tokenizer = await loadTokenizer()
  return tokenizer.tokenize(text).map(t => ({
    surface: t.surface_form,
    reading: t.reading ? katakanaToHiragana(t.reading) : '',
    basicForm: t.basic_form === '*' ? t.surface_form : t.basic_form,
    pos: t.pos,
    hasKanji: KANJI_RE.test(t.surface_form),
  }))
}
