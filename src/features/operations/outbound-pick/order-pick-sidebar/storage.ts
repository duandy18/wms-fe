// src/features/operations/outbound-pick/order-pick-sidebar/storage.ts

export const LS_AUTO_KEY = "wms.pick.auto.enabled.v1";
export const LS_AUTO_PROCESSED = "wms.pick.auto.processed_order_ids.v1";
export const LS_AUTO_LAST = "wms.pick.auto.last.v1";

export type AutoLast = {
  ts: string;
  msg: string;
};

export function loadBool(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "1" || raw.toLowerCase() === "true";
  } catch {
    return fallback;
  }
}

export function saveBool(key: string, v: boolean): void {
  try {
    window.localStorage.setItem(key, v ? "1" : "0");
  } catch {
    // ignore
  }
}

export function loadProcessedIds(): number[] {
  try {
    const raw = window.localStorage.getItem(LS_AUTO_PROCESSED);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
  } catch {
    return [];
  }
}

export function saveProcessedIds(ids: number[]): void {
  try {
    // 控制长度，避免无限增长
    const trimmed = ids.slice(-300);
    window.localStorage.setItem(LS_AUTO_PROCESSED, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function loadLast(): AutoLast | null {
  try {
    const raw = window.localStorage.getItem(LS_AUTO_LAST);
    if (!raw) return null;
    const obj = JSON.parse(raw) as unknown as Partial<AutoLast>;
    if (!obj || typeof obj !== "object") return null;
    if (!obj.ts || !obj.msg) return null;
    return { ts: String(obj.ts), msg: String(obj.msg) };
  } catch {
    return null;
  }
}

export function saveLast(msg: string): void {
  try {
    const obj: AutoLast = { ts: new Date().toISOString(), msg };
    window.localStorage.setItem(LS_AUTO_LAST, JSON.stringify(obj));
  } catch {
    // ignore
  }
}
