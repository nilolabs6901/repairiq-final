import { isNative } from './platform';

/**
 * Secure storage abstraction.
 * On iOS: uses Capacitor Preferences (Keychain-backed on iOS).
 * On web: falls back to localStorage.
 */

async function getNativePreferences() {
  const { Preferences } = await import('@capacitor/preferences');
  return Preferences;
}

export async function secureGet(key: string): Promise<string | null> {
  if (isNative()) {
    const Preferences = await getNativePreferences();
    const { value } = await Preferences.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (isNative()) {
    const Preferences = await getNativePreferences();
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function secureRemove(key: string): Promise<void> {
  if (isNative()) {
    const Preferences = await getNativePreferences();
    await Preferences.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}
