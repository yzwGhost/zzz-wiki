export interface DesktopAppInfo {
  appName: string;
  bridgeStatus: 'connected' | 'unavailable';
  platform: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
}

export interface DesktopApi {
  getAppInfo: () => Promise<DesktopAppInfo>;
}
