// src/features/admin/stores/components/order-sim/textUtils.ts

export function isBlank(s: string): boolean {
  return s.trim().length === 0;
}

export function normText(s: string | null | undefined): string {
  return (s ?? "").trim();
}

export function safeLower(s: string | null | undefined): string {
  return (s ?? "").toLowerCase();
}
