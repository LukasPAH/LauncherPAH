"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
    on: (channel, callback) => {
        const subscription = (_event, ...args) => callback(...args);
        electron_1.ipcRenderer.on(channel, subscription);
        return () => electron_1.ipcRenderer.removeListener(channel, subscription); // Return a function to unsubscribe
    },
    invoke: (channel, data) => electron_1.ipcRenderer.invoke(channel, data),
});
//# sourceMappingURL=preload.js.map