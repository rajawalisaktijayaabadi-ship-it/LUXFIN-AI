import { logger } from '../services/loggerService';

export interface PWAInstallState {
  isSupported: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  canPrompt: boolean;
}

let deferredPrompt: any = null;
const listeners = new Set<(canPrompt: boolean) => void>();

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          logger.info('PWA', 'Service Worker registered successfully', reg.scope);
          
          // Check for SW updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  logger.info('PWA', 'New Service Worker version available!');
                  window.dispatchEvent(new CustomEvent('luxfin_sw_updated', { detail: reg }));
                }
              };
            }
          };
        })
        .catch((err) => {
          logger.warn('PWA', 'Service Worker registration failed', err);
        });
    });
  }
}

export function setupPWAInstallPrompt(onPromptReady: (deferredPrompt: any) => void) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    onPromptReady(e);
    listeners.forEach((fn) => fn(true));
    logger.info('PWA', 'App install prompt available');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn(false));
    logger.info('PWA', 'LUXFIN AI app installed successfully');
  });
}

export function subscribePWAInstallState(callback: (canPrompt: boolean) => void) {
  listeners.add(callback);
  callback(!!deferredPrompt);
  return () => listeners.delete(callback);
}

export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt = null;
    listeners.forEach((fn) => fn(false));
    return true;
  }
  return false;
}

export function getPWAState(): PWAInstallState {
  const ua = window.navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  return {
    isSupported: 'serviceWorker' in navigator,
    isInstalled: isStandalone,
    isIOS,
    isAndroid,
    canPrompt: !!deferredPrompt,
  };
}
