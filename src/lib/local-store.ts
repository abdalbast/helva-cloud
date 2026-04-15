/**
 * Generic localStorage CRUD engine for guest (offline) mode.
 *
 * Every table is stored under the key `helva_data_<table>` as a JSON array.
 * Items receive an auto-generated `_id` and `_creationTime` on creation.
 *
 * A lightweight pub/sub system (`subscribe` / `notify`) lets React hooks
 * re-render when data changes.
 */

const STORE_PREFIX = "helva_data_";

function key(table: string) {
  return STORE_PREFIX + table;
}

function generateId() {
  return (
    "local_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 9)
  );
}

// ---------------------------------------------------------------------------
// CRUD helpers
// ---------------------------------------------------------------------------

export function localGetAll<T = Record<string, unknown>>(
  table: string,
): (T & { _id: string; _creationTime: number })[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key(table)) || "[]");
  } catch {
    return [];
  }
}

export function localGetById<T = Record<string, unknown>>(
  table: string,
  id: string,
): (T & { _id: string; _creationTime: number }) | null {
  return localGetAll<T>(table).find((i) => i._id === id) ?? null;
}

export function localCount(table: string): number {
  return localGetAll(table).length;
}

export function localCreate(
  table: string,
  data: Record<string, unknown>,
): string {
  const items = localGetAll(table);
  const _id = generateId();
  items.push({ ...data, _id, _creationTime: Date.now() });
  localStorage.setItem(key(table), JSON.stringify(items));
  notify(table);
  return _id;
}

export function localUpdate(
  table: string,
  id: string,
  updates: Record<string, unknown>,
): void {
  const items = localGetAll(table);
  const idx = items.findIndex((i) => i._id === id);
  if (idx < 0) return;
  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem(key(table), JSON.stringify(items));
  notify(table);
}

export function localRemove(table: string, id: string): void {
  const items = localGetAll(table);
  localStorage.setItem(
    key(table),
    JSON.stringify(items.filter((i) => i._id !== id)),
  );
  notify(table);
}

export function localCreateMany(
  table: string,
  rows: Record<string, unknown>[],
): string[] {
  const items = localGetAll(table);
  const ids: string[] = [];
  for (const data of rows) {
    const _id = generateId();
    items.push({ ...data, _id, _creationTime: Date.now() });
    ids.push(_id);
  }
  localStorage.setItem(key(table), JSON.stringify(items));
  notify(table);
  return ids;
}

export function localClearAll(): void {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
  listeners.forEach((cbs) => cbs.forEach((cb) => cb()));
}

// ---------------------------------------------------------------------------
// Pub/sub
// ---------------------------------------------------------------------------

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function notify(table: string) {
  listeners.get(table)?.forEach((cb) => cb());
  listeners.get("*")?.forEach((cb) => cb());
}

export function localSubscribe(table: string, cb: Listener): () => void {
  if (!listeners.has(table)) listeners.set(table, new Set());
  listeners.get(table)!.add(cb);
  return () => {
    listeners.get(table)?.delete(cb);
  };
}
