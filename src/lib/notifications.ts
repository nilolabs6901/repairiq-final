import { isNative } from './platform';
import type { MaintenanceReminder } from '@/types';

/**
 * Request push notification permission on iOS.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) {
    // Web: use Notification API
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  }

  const { PushNotifications } = await import('@capacitor/push-notifications');
  const result = await PushNotifications.requestPermissions();
  return result.receive === 'granted';
}

/**
 * Schedule a local notification for a maintenance reminder.
 * On web, uses the Notification API. On native, uses Capacitor Local Notifications.
 */
export async function scheduleMaintenanceNotification(reminder: MaintenanceReminder): Promise<void> {
  if (!isNative()) {
    // Web fallback: show immediately if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Maintenance Due: ${reminder.taskName}`, {
        body: `${reminder.applianceName} - ${reminder.description}`,
        icon: '/icon-192.png',
      });
    }
    return;
  }

  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const dueDate = new Date(reminder.dueDate);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: hashString(reminder.id),
        title: `Maintenance Due: ${reminder.taskName}`,
        body: `${reminder.applianceName} - ${reminder.description}`,
        schedule: { at: dueDate },
      },
    ],
  });
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
