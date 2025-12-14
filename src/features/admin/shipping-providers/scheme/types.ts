// src/features/admin/shipping-providers/scheme/types.ts

export type SchemeTabKey = "zones" | "members" | "brackets" | "surcharges" | "preview";

export type MutateFn = () => Promise<void>;

export function toErrorMessage(e: unknown, fallback: string): string {
  const anyErr = e as { message?: string; detail?: string } | undefined;
  return anyErr?.message ?? anyErr?.detail ?? fallback;
}
