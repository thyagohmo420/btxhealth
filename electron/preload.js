import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  saveOfflineData: (data) => ipcRenderer.send('save-offline-data', data),
  loadOfflineData: () => ipcRenderer.send('load-offline-data'),
  onOfflineDataLoaded: (callback) => {
    ipcRenderer.on('offline-data-loaded', (event, data) => callback(data));
  }
});