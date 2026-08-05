const { contextBridge, ipcRenderer } = require('electron')

// Narrow, whitelisted bridge — no raw ipcRenderer/Node access reaches the page.
contextBridge.exposeInMainWorld('electronAPI', {
  startCapture: () => ipcRenderer.invoke('capture:start'),
  stopCapture: () => ipcRenderer.invoke('capture:stop'),
  onCaptureText: (callback) => {
    const listener = (_event, text) => callback(text)
    ipcRenderer.on('capture:text', listener)
    return () => ipcRenderer.removeListener('capture:text', listener)
  },
})
