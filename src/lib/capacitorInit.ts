import { isNative, getPlatform } from './platform';

/**
 * Initialize Capacitor native plugins on app startup.
 * Call this once in the root layout or _app component.
 */
export async function initCapacitor(): Promise<void> {
  if (!isNative()) return;

  // Configure status bar on iOS
  if (getPlatform() === 'ios') {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
  }

  // Hide splash screen after app loads
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide();

  // Listen for app URL open events (deep links)
  const { App } = await import('@capacitor/app');
  App.addListener('appUrlOpen', (data) => {
    const url = new URL(data.url);
    if (url.pathname) {
      window.location.href = url.pathname;
    }
  });

  // Handle hardware back button on Android
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    }
  });
}
