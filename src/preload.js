const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('localbox', {
    getPort: () => ipcRenderer.invoke('get-port'),
    startRPC: (nickname, room) => ipcRenderer.invoke('start-rpc', nickname, room),
    updateRPC: (state) => ipcRenderer.invoke('update-rpc', state)
});