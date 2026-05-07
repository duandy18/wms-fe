// src/features/shipping-assist/handoffs/types.ts

export interface ShippingHandoffRow {
  id: number;

  source_doc_type: string;
  source_doc_id: number;
  source_doc_no: string;
  source_ref: string;

  export_status: string;
  logistics_status: string;

  logistics_request_id: number | null;
  logistics_request_no: string | null;

  exported_at: string | null;
  logistics_completed_at: string | null;
  last_attempt_at: string | null;
  last_error: string | null;

  source_snapshot: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

export interface ShippingHandoffListResponse {
  ok: boolean;
  rows: ShippingHandoffRow[];
  total: number;
}

export interface ShippingHandoffQuery {
  limit?: number;
  offset?: number;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

export function formatJson(value: Record<string, unknown> | null | undefined): string {
  if (!value || Object.keys(value).length === 0) return "-";
  try {
    return JSON.stringify(value);
  } catch {
    return "-";
  }
}
