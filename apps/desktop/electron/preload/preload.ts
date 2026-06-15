import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../../../shared/constants/ipc';
import type { DesktopApi } from '../../../../shared/schemas/desktop';

const api: DesktopApi = {
  getAppInfo() {
    return ipcRenderer.invoke(IPC_CHANNELS.getAppInfo);
  },
};

contextBridge.exposeInMainWorld('zzzDesktop', api);
