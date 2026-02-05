const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  toggleFullscreen: () => ipcRenderer.send('window-toggle-fullscreen'),
  checkFullscreen: () => ipcRenderer.invoke('get-fullscreen-status'),
  onFullscreenChange: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('fullscreen-changed', subscription);
    return () => ipcRenderer.removeListener('fullscreen-changed', subscription);
  }
});
