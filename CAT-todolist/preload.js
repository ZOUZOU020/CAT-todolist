const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
  setAlwaysOnTop: (isAlwaysOnTop) => ipcRenderer.send('set-always-on-top', isAlwaysOnTop),
  
  toggleGhostMode: () => ipcRenderer.send('toggle-ghost-mode'),
  onGhostModeState: (callback) => ipcRenderer.on('ghost-mode-state', (event, isGhostMode) => callback(isGhostMode)),

  closeApp: () => ipcRenderer.send('close-app'),
  onWindowMoved: (callback) => ipcRenderer.on('window-moved', callback),
  onKeyDown: (key) => ipcRenderer.send('keydown', key)
});