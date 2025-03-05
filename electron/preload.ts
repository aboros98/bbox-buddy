
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = ['open-file-dialog', 'save-file-dialog', 'load-image'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
    },
    send: (channel: string, ...args: any[]) => {
      const validChannels = ['open-file-dialog', 'save-file-dialog', 'load-image'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['file-opened', 'file-saved', 'image-loaded'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        return () => {
          ipcRenderer.removeListener(channel, func as any);
        };
      }
      return () => {};
    },
  },
});
