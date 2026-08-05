const { app, BrowserWindow, ipcMain, clipboard } = require('electron')
const path = require('node:path')

const isDev = !app.isPackaged

const JAPANESE_RE = /[぀-ヿ一-鿿]/
const CAPTURE_POLL_MS = 500

let mainWindow = null
let captureInterval = null
let lastCapturedText = ''

function startCapture() {
  if (captureInterval || !mainWindow) return
  // Ignore whatever's already sitting on the clipboard when capture turns on.
  lastCapturedText = clipboard.readText()
  captureInterval = setInterval(() => {
    const text = clipboard.readText().trim()
    if (!text || text === lastCapturedText) return
    lastCapturedText = text
    if (!JAPANESE_RE.test(text)) return
    mainWindow?.webContents.send('capture:text', text)
  }, CAPTURE_POLL_MS)
}

function stopCapture() {
  if (captureInterval) {
    clearInterval(captureInterval)
    captureInterval = null
  }
}

ipcMain.handle('capture:start', () => startCapture())
ipcMain.handle('capture:stop', () => stopCapture())

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: '日本語先生 — Nihongo Sensei',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.on('closed', () => {
    stopCapture()
    mainWindow = null
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopCapture()
  if (process.platform !== 'darwin') app.quit()
})
