// src/features/admin/stores/components/storeMerchantCodeGovernance/types.ts

import type { Fsku, MerchantCodeBindingRow, Platform } from "../../../shop-bundles/types";

export type Banner = { kind: "success" | "error"; message: string } | null;

export type RowState = {
  checked: boolean;
  merchantCode: string;
  expanded: boolean;
};

export type GovernanceProps = {
  platform: Platform;
  shopId: string;
  storeName: string;
  canWrite: boolean;
};

export type CurrentBindingsIndex = Map<string, MerchantCodeBindingRow>;

export type GovernanceActions = {
  refreshFskus: () => Promise<void>;
  refreshBindings: () => Promise<void>;
  setReason: (v: string) => void;
  setCheckedAll: (checked: boolean) => void;
  setRowChecked: (fskuId: number, checked: boolean) => void;
  setRowMerchantCode: (fskuId: number, merchantCode: string) => void;
  toggleExpanded: (fskuId: number) => void;
  bindOne: (f: Fsku) => Promise<void>;
  bindSelected: () => Promise<void>;
  closeCurrentByMerchantCode: (merchantCode: string) => Promise<void>;
};

export type GovernanceState = {
  fskus: Fsku[]; // ✅ 已过滤为 published
  rowState: Record<string, RowState>;
  banner: Banner;
  loading: boolean;
  reason: string;
  selectedCount: number;
  currentByMerchantCode: CurrentBindingsIndex;
};

export function toMsg(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "发生未知错误";
  const s = String(msg || "").trim();
  return s || "发生未知错误";
}

export function safeFskus(v: unknown): Fsku[] {
  return Array.isArray(v) ? (v as Fsku[]) : [];
}
