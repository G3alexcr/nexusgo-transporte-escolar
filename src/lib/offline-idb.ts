import type { OfflineSyncQueueItem } from './platform-state';

const DB_NAME = 'linkbus_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';
const QUEUE_KEY = 'pending_items';

function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
  });
}

export async function loadOfflineQueueFromIdb(): Promise<OfflineSyncQueueItem[]> {
  if (!isIndexedDbAvailable()) return [];
  try {
    const db = await openOfflineDb();
    return await new Promise<OfflineSyncQueueItem[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(QUEUE_KEY);
      req.onsuccess = () => {
        db.close();
        resolve(Array.isArray(req.result) ? (req.result as OfflineSyncQueueItem[]) : []);
      };
      req.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

export async function saveOfflineQueueToIdb(items: OfflineSyncQueueItem[]): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  try {
    const db = await openOfflineDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      if (items.length === 0) {
        store.delete(QUEUE_KEY);
      } else {
        store.put(items, QUEUE_KEY);
      }
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    // Graceful no-op when IndexedDB is unavailable
  }
}

export async function clearOfflineQueueFromIdb(): Promise<void> {
  await saveOfflineQueueToIdb([]);
}
