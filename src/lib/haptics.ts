import { isNative } from './platform';

/**
 * Trigger a light haptic tap. No-op on web.
 */
export async function hapticTap(): Promise<void> {
  if (!isNative()) return;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  await Haptics.impact({ style: ImpactStyle.Light });
}

/**
 * Trigger a success haptic notification. No-op on web.
 */
export async function hapticSuccess(): Promise<void> {
  if (!isNative()) return;
  const { Haptics, NotificationType } = await import('@capacitor/haptics');
  await Haptics.notification({ type: NotificationType.Success });
}

/**
 * Trigger an error haptic notification. No-op on web.
 */
export async function hapticError(): Promise<void> {
  if (!isNative()) return;
  const { Haptics, NotificationType } = await import('@capacitor/haptics');
  await Haptics.notification({ type: NotificationType.Error });
}
