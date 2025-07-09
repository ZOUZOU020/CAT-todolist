const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
  setAlwaysOnTop: (isAlwaysOnTop) => ipcRenderer.send('set-always-on-top', isAlwaysOnTop),
  closeApp: () => ipcRenderer.send('close-app'),
  onWindowMoved: (callback) => ipcRenderer.on('window-moved', callback)
});