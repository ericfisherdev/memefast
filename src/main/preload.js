const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('memefast', {
  saveImage: (bytes, suggestedName) => ipcRenderer.invoke('image:save', bytes, suggestedName),
});
