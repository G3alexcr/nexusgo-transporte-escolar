export const APP_VERSION = "1.0.1";

/**
 * Compares two dotted semver-like strings (e.g. "1.0.2" vs "1.0.1").
 * Returns true when `remote` is strictly newer than `local`.
 */
export function isNewerVersion(remote: string, local: string = APP_VERSION): boolean {
  const rParts = remote.trim().split(".").map((n) => Number.parseInt(n, 10) || 0);
  const lParts = local.trim().split(".").map((n) => Number.parseInt(n, 10) || 0);
  const maxLen = Math.max(rParts.length, lParts.length);

  for (let i = 0; i < maxLen; i++) {
    const r = rParts[i] ?? 0;
    const l = lParts[i] ?? 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

/**
 * Clears Service Worker caches and forces a clean reload so the client
 * picks up the latest deployed bundle without losing Supabase auth storage.
 */
export async function applyAppUpdate(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if ("caches" in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch {
    // Proceed with reload even if cache/SW cleanup is partially restricted
  }

  const url = new URL(window.location.href);
  url.searchParams.set("_v", String(Date.now()));
  window.location.replace(url.toString());
}
