// src/features/admin/shipping-providers/api/copy/index.ts
import { apiPost } from "../../../../../lib/api";

export type BracketsCopyConflictPolicy = "skip" | "overwrite";
export type BracketsCopyActivePolicy = "keep" | "force_active";

export type CopyZoneBracketsIn = {
  source_zone_id: number;
  conflict_policy?: BracketsCopyConflictPolicy; // 默认 skip
  active_policy?: BracketsCopyActivePolicy; // 默认 keep
  pricing_modes?: string[]; // e.g. ["flat","linear_total"]
  include_inactive?: boolean; // 默认 false
};

export type CopyZoneBracketsOut = {
  ok: boolean;
  summary?: {
    created_count?: number;
    skipped_count?: number;
    updated_count?: number;
    failed_count?: number;
  };
  created?: unknown[];
  skipped?: unknown[];
  updated?: unknown[];
  failed?: unknown[];
};

export async function copyZoneBrackets(targetZoneId: number, payload: CopyZoneBracketsIn): Promise<CopyZoneBracketsOut> {
  return apiPost<CopyZoneBracketsOut>(`/zones/${targetZoneId}/brackets:copy`, payload);
}
