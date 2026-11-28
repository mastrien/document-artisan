import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime } from '../engine/compiler';
import { CustomFontVariantFile, FontVariantKey } from '../types/template';

export interface PersistedFontFamilyMeta {
  id: string;
  familyName: string;
  variants: Partial<
    Record<FontVariantKey, { fileName: string; format: CustomFontVariantFile['format']; assetKey: string }>
  >;
}

export interface PersistedLogoMeta {
  fileName: string;
  assetKey: string;
  mimeType: string;
}

export interface PersistedAssetManifest {
  customFonts: PersistedFontFamilyMeta[];
  headerLogo?: PersistedLogoMeta;
  footerLogo?: PersistedLogoMeta;
}

const MANIFEST_STORAGE_KEY = 'document-artisan:asset-manifest:v1';
const MANIFEST_TAURI_PATH = 'manifest.json';
const IDB_NAME = 'document-artisan-assets';
const IDB_STORE = 'blobs';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out.buffer;
}

function openAssetDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, buffer: ArrayBuffer): Promise<void> {
  const db = await openAssetDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(buffer.slice(0), key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGet(key: string): Promise<ArrayBuffer | null> {
  const db = await openAssetDb();
  const res = await new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result instanceof ArrayBuffer ? req.result : null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return res;
}

async function idbDelete(key: string): Promise<void> {
  const db = await openAssetDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function savePersistedAsset(relPath: string, buffer: ArrayBuffer): Promise<void> {
  try {
    if (isTauriRuntime()) {
      await invoke('save_local_asset', {
        relPath,
        contentBase64: bytesToBase64(new Uint8Array(buffer)),
      });
      return;
    }
    if (typeof indexedDB !== 'undefined') {
      await idbPut(relPath, buffer);
    }
  } catch {
    // Non-fatal persistence miss
  }
}

export async function loadPersistedAsset(relPath: string): Promise<ArrayBuffer | null> {
  try {
    if (isTauriRuntime()) {
      const b64 = await invoke<string | null>('load_local_asset', { relPath });
      return b64 ? base64ToArrayBuffer(b64) : null;
    }
    if (typeof indexedDB !== 'undefined') {
      return await idbGet(relPath);
    }
    return null;
  } catch {
    return null;
  }
}

export async function deletePersistedAsset(relPath: string): Promise<void> {
  try {
    if (isTauriRuntime()) {
      await invoke('delete_local_asset', { relPath });
      return;
    }
    if (typeof indexedDB !== 'undefined') {
      await idbDelete(relPath);
    }
  } catch {
    // Non-fatal
  }
}

export async function savePersistedManifest(manifest: PersistedAssetManifest): Promise<void> {
  const json = JSON.stringify(manifest);
  try {
    localStorage.setItem(MANIFEST_STORAGE_KEY, json);
  } catch {
    // ignore storage errors
  }
  if (isTauriRuntime()) {
    try {
      const bytes = new TextEncoder().encode(json);
      await savePersistedAsset(MANIFEST_TAURI_PATH, bytes.buffer);
    } catch {
      // ignore
    }
  }
}

export async function loadPersistedManifest(): Promise<PersistedAssetManifest | null> {
  if (isTauriRuntime()) {
    const buf = await loadPersistedAsset(MANIFEST_TAURI_PATH);
    if (buf) {
      try {
        return JSON.parse(new TextDecoder().decode(buf)) as PersistedAssetManifest;
      } catch {
        // fall back to localStorage
      }
    }
  }
  try {
    const raw = localStorage.getItem(MANIFEST_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedAssetManifest;
    }
  } catch {
    // ignore
  }
  return null;
}

export function arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string): string {
  return `data:${mimeType};base64,${bytesToBase64(new Uint8Array(buffer))}`;
}

export function mimeTypeForLogoFile(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'image/png';
}
