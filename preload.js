const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('themeAPI', {
  notifyTheme: (theme) => ipcRenderer.send('theme-updated', theme),
  notifyView: (view) => ipcRenderer.send('view-changed', view),
  onSetTheme: (callback) => {
    ipcRenderer.on('set-theme', (_e, theme) => callback(theme));
  },
});
