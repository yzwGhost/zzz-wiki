import type { DesktopApi } from '@shared/schemas/desktop';

declare global {
  interface Window {
    zzzDesktop?: DesktopApi;
  }
}

export {};
