// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, callback: (...args: any[]) => void) => {
        const subscription = (_event: Electron.IpcRendererEvent, ...args: any[]) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription); // Return a function to unsubscribe
    },
    invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
});



