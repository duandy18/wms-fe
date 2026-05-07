// src/features/shipping-assist/handoffs/types.ts

export interface ShippingHandoffShipmentItem {
  source_line_type: string;
  source_line_id: number | null;
  source_line_no: number | null;
  item_id: number | null;
  item_sku_snapshot: string | null;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  qty_outbound: number;
}

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

  source_system: string;
  request_source: string;

  platform: string | null;
  store_code: string | null;
  order_ref: string | null;
  ext_order_no: string | null;

  warehouse_id: number | null;
  warehouse_name_snapshot: string | null;

  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_province: string | null;
  receiver_city: string | null;
  receiver_district: string | null;
  receiver_address: string | null;
  receiver_postcode: string | null;

  outbound_event_id: number | null;
  outbound_source_ref: string | null;
  outbound_completed_at: string | null;

  shipment_items: ShippingHandoffShipmentItem[];

  created_at: string;
  updated_at: string;
}

export interface ShippingHandoffListResponse {
  ok: boolean;
  rows: ShippingHandoffRow[];
  total: number;
}

export interface ShippingHandoffQuery {
  source_doc_type?: string;
  export_status?: string;
  logistics_status?: string;
  source_ref?: string;
  source_doc_no?: string;
  logistics_request_no?: string;
  limit?: number;
  offset?: number;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";

  const normalized = value.replace("T", " ").replace("Z", "");
  const currentYear = String(new Date().getFullYear());

  if (normalized.startsWith(currentYear)) {
    return normalized.slice(5, 16);
  }

  return normalized.slice(0, 16);
}

export function formatText(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function formatSourceType(value: string): string {
  if (value === "ORDER_OUTBOUND") return "订单出库";
  if (value === "MANUAL_OUTBOUND") return "手工出库";
  return value;
}

export function formatAddress(row: ShippingHandoffRow): string {
  const parts = [
    row.receiver_province,
    row.receiver_city,
    row.receiver_district,
    row.receiver_address,
  ].filter((item): item is string => Boolean(item && item.trim()));

  return parts.length > 0 ? parts.join(" ") : "-";
}

export function formatItemLine(item: ShippingHandoffShipmentItem): string {
  const name =
    item.item_name_snapshot || item.item_sku_snapshot || `商品 ${item.item_id ?? "-"}`;
  const spec = item.item_spec_snapshot ? ` / ${item.item_spec_snapshot}` : "";
  return `${name}${spec} × ${item.qty_outbound}`;
}
