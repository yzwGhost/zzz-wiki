import type { DesktopAppInfo } from '@shared/schemas/desktop';

export async function getDesktopAppInfo(): Promise<DesktopAppInfo> {
  if (!window.zzzDesktop) {
    return {
      appName: '绝区零攻略站',
      bridgeStatus: 'unavailable',
      platform: navigator.platform,
      electronVersion: 'N/A',
      nodeVersion: 'N/A',
      chromeVersion: 'N/A',
    };
  }

  return window.zzzDesktop.getAppInfo();
}
