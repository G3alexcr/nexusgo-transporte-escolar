let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function registerNexusGoServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => reg)
      .catch(() => null);
  }
  return swRegistrationPromise;
}

export async function requestPushPermissionAndSubscribe(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await registerNexusGoServiceWorker();
  if (!registration || !('pushManager' in registration)) return null;

  const vapidPublicKey = import.meta.env['VITE_VAPID_PUBLIC_KEY'] as string | undefined;
  if (!vapidPublicKey) return null;

  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
    const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: outputArray,
    });
  } catch {
    return null;
  }
}

export async function showServiceWorkerNotification(
  title: string,
  body: string,
  url = '/',
): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return;
  }
  const registration = await registerNexusGoServiceWorker();
  if (!registration) return;

  try {
    await registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url },
    });
  } catch {
    // Ignore if browser blocks notification in current context
  }
}
