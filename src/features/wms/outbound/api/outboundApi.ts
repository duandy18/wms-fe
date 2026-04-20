import { apiGet, apiPost } from "../../../../lib/api";
import type {
  ManualOutboundDocCreateIn,
  ManualOutboundDocOut,
  ManualOutboundSubmitIn,
  ManualOutboundSubmitOut,
  OrderOutboundSubmitIn,
  OrderOutboundSubmitOut,
  OrderOutboundViewResponse,
  OutboundLotCandidatesOut,
  OutboundSummaryDetailOut,
  OutboundSummaryListOut,
  PublicItemAggregateOut,
  PublicItemBasicOut,
  PublicSupplierBasicOut,
} from "../contracts/outbound";

export interface OutboundSummaryQuery {
  source_type?: string;
  warehouse_id?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function fetchOutboundSummary(
  query: OutboundSummaryQuery = {},
): Promise<OutboundSummaryListOut> {
  return apiGet<OutboundSummaryListOut>("/wms/outbound/summary", query);
}

export async function fetchOutboundSummaryDetail(
  eventId: number,
): Promise<OutboundSummaryDetailOut> {
  return apiGet<OutboundSummaryDetailOut>(
    `/wms/outbound/summary/${encodeURIComponent(String(eventId))}`,
  );
}

export interface OrderOutboundOptionOut {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  status?: string | null;
  buyer_name?: string | null;
  created_at: string;
}

export interface OrderOutboundOptionsOut {
  items: OrderOutboundOptionOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderOutboundOptionsQuery {
  q?: string;
  platform?: string;
  shop_id?: string;
  limit?: number;
  offset?: number;
}

export async function fetchOrderOutboundOptions(
  query: OrderOutboundOptionsQuery = {},
): Promise<OrderOutboundOptionsOut> {
  return apiGet<OrderOutboundOptionsOut>("/oms/orders/outbound-options", query);
}

export async function fetchOrderOutboundView(
  orderId: number,
): Promise<OrderOutboundViewResponse> {
  return apiGet<OrderOutboundViewResponse>(
    `/oms/orders/${encodeURIComponent(String(orderId))}/outbound-view`,
  );
}

export async function fetchOutboundLotCandidates(
  warehouseId: number,
  itemId: number,
): Promise<OutboundLotCandidatesOut> {
  return apiGet<OutboundLotCandidatesOut>("/wms/outbound/lot-candidates", {
    warehouse_id: warehouseId,
    item_id: itemId,
  });
}

export interface PublicSuppliersQuery {
  q?: string;
}

export async function fetchPublicSuppliers(
  query: PublicSuppliersQuery = {},
): Promise<PublicSupplierBasicOut[]> {
  return apiGet<PublicSupplierBasicOut[]>("/public/suppliers", {
    active: true,
    q: query.q,
  });
}

export interface ManualDocItemOptionsQuery {
  supplier_id?: number;
  q?: string;
  limit?: number;
}

export async function fetchManualDocItemOptions(
  query: ManualDocItemOptionsQuery = {},
): Promise<PublicItemBasicOut[]> {
  return apiGet<PublicItemBasicOut[]>("/public/items", {
    enabled: true,
    supplier_id: query.supplier_id,
    q: query.q,
    limit: query.limit ?? 100,
  });
}

export async function submitOrderOutbound(
  orderId: number,
  payload: OrderOutboundSubmitIn,
): Promise<OrderOutboundSubmitOut> {
  return apiPost<OrderOutboundSubmitOut>(
    `/wms/outbound/orders/${encodeURIComponent(String(orderId))}/submit`,
    payload,
  );
}

export interface BarcodeProbeItemBasic {
  id: number;
  sku: string;
  name: string;
  spec?: string | null;
}

export interface BarcodeProbeOut {
  ok: boolean;
  status: string;
  barcode: string;
  item_id?: number | null;
  item_uom_id?: number | null;
  ratio_to_base?: number | null;
  symbology?: string | null;
  active?: boolean | null;
  item_basic?: BarcodeProbeItemBasic | null;
}

export async function fetchBarcodeProbe(barcode: string): Promise<BarcodeProbeOut> {
  return apiPost<BarcodeProbeOut>("/items/barcode-probe", { barcode });
}

export async function fetchPublicItemAggregate(
  itemId: number,
): Promise<PublicItemAggregateOut> {
  return apiGet<PublicItemAggregateOut>(
    `/public/items/${encodeURIComponent(String(itemId))}/aggregate`,
  );
}

export interface ManualOutboundDocsQuery {
  limit?: number;
  offset?: number;
}

export async function fetchManualOutboundDocs(
  query: ManualOutboundDocsQuery = {},
): Promise<ManualOutboundDocOut[]> {
  return apiGet<ManualOutboundDocOut[]>("/wms/outbound/manual-docs", query);
}

export async function fetchManualOutboundDoc(
  docId: number,
): Promise<ManualOutboundDocOut> {
  return apiGet<ManualOutboundDocOut>(
    `/wms/outbound/manual-docs/${encodeURIComponent(String(docId))}`,
  );
}

export async function createManualOutboundDoc(
  payload: ManualOutboundDocCreateIn,
): Promise<ManualOutboundDocOut> {
  return apiPost<ManualOutboundDocOut>("/wms/outbound/manual-docs", payload);
}

export async function releaseManualOutboundDoc(
  docId: number,
): Promise<ManualOutboundDocOut> {
  return apiPost<ManualOutboundDocOut>(
    `/wms/outbound/manual-docs/${encodeURIComponent(String(docId))}/release`,
    {},
  );
}

export async function voidManualOutboundDoc(
  docId: number,
): Promise<ManualOutboundDocOut> {
  return apiPost<ManualOutboundDocOut>(
    `/wms/outbound/manual-docs/${encodeURIComponent(String(docId))}/void`,
    {},
  );
}

export async function submitManualOutbound(
  docId: number,
  payload: ManualOutboundSubmitIn,
): Promise<ManualOutboundSubmitOut> {
  return apiPost<ManualOutboundSubmitOut>(
    `/wms/outbound/manual/${encodeURIComponent(String(docId))}/submit`,
    payload,
  );
}
