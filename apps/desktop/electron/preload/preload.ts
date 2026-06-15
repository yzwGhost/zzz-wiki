import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../../../shared/constants/ipc';
import type { DesktopApi } from '../../../../shared/schemas/desktop';

const api: DesktopApi = {
  getAppInfo() {
    return ipcRenderer.invoke(IPC_CHANNELS.app.getInfo);
  },
  catalog: {
    getOverview() {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.getOverview);
    },
    queryAgents(filters) {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.queryAgents, filters);
    },
    getAgentDetailBySlug(slug) {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.getAgentDetailBySlug, slug);
    },
    queryWeapons(filters) {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.queryWeapons, filters);
    },
    getWeaponDetailBySlug(slug) {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.getWeaponDetailBySlug, slug);
    },
    queryDriveDiscs(filters) {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.queryDriveDiscs, filters);
    },
    getDriveDiscDetailBySlug(slug) {
      return ipcRenderer.invoke(IPC_CHANNELS.catalog.getDriveDiscDetailBySlug, slug);
    },
  },
  sync: {
    runTask(request) {
      return ipcRenderer.invoke(IPC_CHANNELS.sync.runTask, request);
    },
    getOverview() {
      return ipcRenderer.invoke(IPC_CHANNELS.sync.getOverview);
    },
    getRecentLogs(limit) {
      return ipcRenderer.invoke(IPC_CHANNELS.sync.getRecentLogs, limit);
    },
  },
};

contextBridge.exposeInMainWorld('zzzDesktop', api);
