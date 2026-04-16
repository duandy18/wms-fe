// src/features/wms/inbound/api/inboundWorkbenchApi.ts

import { fetchActiveWarehouses } from "../../warehouses/api";
import type {
  InboundEventDetail,
  InboundEventSummary,
} from "../types";

export type InboundEventListQuery = {
  warehouseId?: number | null;
  sourceType?: string | null;
  sourceRef?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  limit?: number;
  offset?: number;
};

export type InboundCommitDraftLine = {
  itemId: number | null;
  barcode: string | null;
  uomId: number | null;
  qtyInput: number;
  lotCodeInput: string | null;
  productionDate: string | null;
  expiryDate: string | null;
  poLineId: number | null;
  remark: string | null;
};

export type InboundCommitDraft = {
  warehouseId: number;
  sourceType: string;
  sourceRef: string | null;
  occurredAt: string;
  remark: string | null;
  lines: InboundCommitDraftLine[];
};

export type InboundCommitResult = {
  ok: boolean;
  eventId: number;
  eventNo: string;
  traceId: string;
  warehouseId: number;
  sourceType: string;
  sourceRef: string | null;
  occurredAt: string;
  remark: string | null;
  rows: Array<{
    lineNo: number;
    itemId: number;
    uomId: number;
    qtyInput: number;
    ratioToBaseSnapshot: number;
    qtyBase: number;
    lotId: number | null;
    lotCode: string | null;
    poLineId: number | null;
    remark: string | null;
  }>;
};

export type InboundWarehouseOption = {
  id: number;
  name: string;
  code: string | null;
  label: string;
};

export type PurchaseOrderSourceOption = {
  poId: number;
  poNo: string;
  warehouseId: number;
  supplierId: number;
  supplierName: string;
  purchaseTime: string;
  poStatus: string;
  completionStatus: "NOT_RECEIVED" | "PARTIAL" | "RECEIVED";
  lastReceivedAt: string | null;
  label: string;
};

export type PurchaseOrderCompletionLoadedLine = {
  poLineId: number;
  lineNo: number;
  itemId: number;
  itemName: string | null;
  itemSku: string | null;
  uomId: number;
  uomName: string | null;
  ratioToBaseSnapshot: number;
  qtyOrderedInput: number;
  qtyOrderedBase: number;
  qtyRemainingBase: number;
  qtyRemainingInput: string;
  lineCompletionStatus: string;
  lastReceivedAt: string | null;
};

type WarehouseListItemLite = {
  id: number;
  name: string;
  code?: string | null;
};

type InboundEventSummaryDto = {
  event_id: number;
  event_no: string;
  event_type: "INBOUND";
  warehouse_id: number;
  source_type: string | null;
  source_ref: string | null;
  occurred_at: string;
  committed_at: string | null;
  trace_id: string;
  event_kind: string;
  status: string;
  remark: string | null;
};

type InboundEventLineDto = {
  line_no: number;
  item_id: number;
  item_name: string | null;
  item_sku: string | null;
  uom_id: number;
  uom_name: string | null;
  barcode_input: string | null;
  qty_input: number;
  ratio_to_base_snapshot: number;
  qty_base: number;
  lot_id: number | null;
  lot_code_input: string | null;
  lot_code: string | null;
  production_date: string | null;
  expiry_date: string | null;
  po_line_id: number | null;
  remark: string | null;
};

type InboundEventListDto = {
  total: number;
  items: InboundEventSummaryDto[];
};

type InboundEventDetailDto = {
  event: InboundEventSummaryDto;
  lines: InboundEventLineDto[];
};

type InboundCommitRowDto = {
  line_no: number;
  item_id: number;
  uom_id: number;
  qty_input: number;
  ratio_to_base_snapshot: number;
  qty_base: number;
  lot_id: number | null;
  lot_code: string | null;
  po_line_id: number | null;
  remark: string | null;
};

type InboundCommitOutDto = {
  ok: boolean;
  event_id: number;
  event_no: string;
  trace_id: string;
  warehouse_id: number;
  source_type: string;
  source_ref: string | null;
  occurred_at: string;
  remark: string | null;
  rows: InboundCommitRowDto[];
};

type PurchaseOrderSourceOptionDto = {
  po_id: number;
  po_no: string;
  warehouse_id: number;
  supplier_id: number;
  supplier_name: string;
  purchase_time: string;
  po_status: string;
  completion_status: "NOT_RECEIVED" | "PARTIAL" | "RECEIVED";
  last_received_at: string | null;
};

type PurchaseOrderSourceOptionsDto = {
  items: PurchaseOrderSourceOptionDto[];
};

type PurchaseOrderCompletionLineDto = {
  po_line_id: number;
  line_no: number;
  item_id: number;
  item_name: string | null;
  item_sku: string | null;
  spec_text: string | null;
  purchase_uom_id_snapshot: number;
  purchase_uom_name_snapshot: string;
  purchase_ratio_to_base_snapshot: number;
  qty_ordered_input: number;
  qty_ordered_base: number;
  qty_received_base: number;
  qty_remaining_base: number;
  line_completion_status: string;
  last_received_at: string | null;
};

type PurchaseOrderCompletionDetailDto = {
  summary: {
    po_id: number;
    po_no: string;
    po_status: string;
    warehouse_id: number;
    supplier_id: number;
    supplier_name: string;
    purchaser: string;
    purchase_time: string;
    total_amount: string | null;
    total_ordered_base: number;
    total_received_base: number;
    total_remaining_base: number;
    completion_status: string;
    last_received_at: string | null;
  };
  lines: PurchaseOrderCompletionLineDto[];
  receipt_events: Array<unknown>;
};

function mapSummary(dto: InboundEventSummaryDto): InboundEventSummary {
  return {
    eventId: dto.event_id,
    eventNo: dto.event_no,
    eventType: dto.event_type,
    sourceType: dto.source_type,
    sourceRef: dto.source_ref,
    occurredAt: dto.occurred_at,
    committedAt: dto.committed_at,
    traceId: dto.trace_id,
    status: dto.status,
  };
}

function mapDetail(dto: InboundEventDetailDto): InboundEventDetail {
  return {
    event: mapSummary(dto.event),
    lines: dto.lines.map((line) => ({
      lineNo: line.line_no,
      itemId: line.item_id,
      itemName: line.item_name,
      sku: line.item_sku,
      uomId: line.uom_id,
      uomName: line.uom_name,
      barcodeInput: line.barcode_input,
      qtyInput: line.qty_input,
      ratioToBaseSnapshot: line.ratio_to_base_snapshot,
      qtyBase: line.qty_base,
      lotId: line.lot_id,
      lotCode: line.lot_code ?? line.lot_code_input,
      productionDate: line.production_date,
      expiryDate: line.expiry_date,
      poLineId: line.po_line_id,
      remark: line.remark,
    })),
  };
}

function mapCommitResult(dto: InboundCommitOutDto): InboundCommitResult {
  return {
    ok: dto.ok,
    eventId: dto.event_id,
    eventNo: dto.event_no,
    traceId: dto.trace_id,
    warehouseId: dto.warehouse_id,
    sourceType: dto.source_type,
    sourceRef: dto.source_ref,
    occurredAt: dto.occurred_at,
    remark: dto.remark,
    rows: dto.rows.map((row) => ({
      lineNo: row.line_no,
      itemId: row.item_id,
      uomId: row.uom_id,
      qtyInput: row.qty_input,
      ratioToBaseSnapshot: row.ratio_to_base_snapshot,
      qtyBase: row.qty_base,
      lotId: row.lot_id,
      lotCode: row.lot_code,
      poLineId: row.po_line_id,
      remark: row.remark,
    })),
  };
}

function buildWarehouseLabel(item: WarehouseListItemLite): string {
  const code = String(item.code ?? "").trim();
  const name = String(item.name ?? "").trim();
  if (name && code) return `${name}（${code}）`;
  if (name) return name;
  if (code) return code;
  return `仓库 ${item.id}`;
}

function mapWarehouseOption(item: WarehouseListItemLite): InboundWarehouseOption {
  return {
    id: Number(item.id),
    name: String(item.name ?? ""),
    code: item.code ?? null,
    label: buildWarehouseLabel(item),
  };
}

function completionStatusLabel(
  status: PurchaseOrderSourceOption["completionStatus"],
): string {
  switch (status) {
    case "NOT_RECEIVED":
      return "未收货";
    case "PARTIAL":
      return "部分收货";
    case "RECEIVED":
      return "已收满";
    default:
      return status;
  }
}

function mapPurchaseOrderSourceOption(
  dto: PurchaseOrderSourceOptionDto,
): PurchaseOrderSourceOption {
  return {
    poId: dto.po_id,
    poNo: dto.po_no,
    warehouseId: dto.warehouse_id,
    supplierId: dto.supplier_id,
    supplierName: dto.supplier_name,
    purchaseTime: dto.purchase_time,
    poStatus: dto.po_status,
    completionStatus: dto.completion_status,
    lastReceivedAt: dto.last_received_at,
    label: `${dto.po_no} · ${dto.supplier_name} · ${completionStatusLabel(dto.completion_status)}`,
  };
}

function buildRemainingInput(
  qtyRemainingBase: number,
  ratioToBaseSnapshot: number,
): string {
  if (ratioToBaseSnapshot <= 0 || qtyRemainingBase <= 0) return "";
  if (qtyRemainingBase % ratioToBaseSnapshot !== 0) return "";
  return String(qtyRemainingBase / ratioToBaseSnapshot);
}

function mapPurchaseOrderCompletionLine(
  dto: PurchaseOrderCompletionLineDto,
): PurchaseOrderCompletionLoadedLine {
  return {
    poLineId: dto.po_line_id,
    lineNo: dto.line_no,
    itemId: dto.item_id,
    itemName: dto.item_name,
    itemSku: dto.item_sku,
    uomId: dto.purchase_uom_id_snapshot,
    uomName: dto.purchase_uom_name_snapshot,
    ratioToBaseSnapshot: dto.purchase_ratio_to_base_snapshot,
    qtyOrderedInput: dto.qty_ordered_input,
    qtyOrderedBase: dto.qty_ordered_base,
    qtyRemainingBase: dto.qty_remaining_base,
    qtyRemainingInput: buildRemainingInput(
      dto.qty_remaining_base,
      dto.purchase_ratio_to_base_snapshot,
    ),
    lineCompletionStatus: dto.line_completion_status,
    lastReceivedAt: dto.last_received_at,
  };
}

function buildEventQuery(query: InboundEventListQuery): string {
  const params = new URLSearchParams();

  if (query.warehouseId != null) {
    params.set("warehouse_id", String(query.warehouseId));
  }
  if (query.sourceType) {
    params.set("source_type", query.sourceType);
  }
  if (query.sourceRef) {
    params.set("source_ref", query.sourceRef);
  }
  if (query.dateFrom) {
    params.set("date_from", query.dateFrom);
  }
  if (query.dateTo) {
    params.set("date_to", query.dateTo);
  }
  if (query.limit != null) {
    params.set("limit", String(query.limit));
  }
  if (query.offset != null) {
    params.set("offset", String(query.offset));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function buildPurchaseOrderSourceOptionsQuery(args: {
  warehouseId?: number | null;
  q?: string | null;
  limit?: number;
}): string {
  const params = new URLSearchParams();

  if (args.warehouseId != null) {
    params.set("warehouse_id", String(args.warehouseId));
  }
  if (args.q) {
    params.set("q", args.q);
  }
  if (args.limit != null) {
    params.set("limit", String(args.limit));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function toCommitPayload(draft: InboundCommitDraft) {
  return {
    warehouse_id: draft.warehouseId,
    source_type: draft.sourceType,
    source_ref: draft.sourceRef,
    occurred_at: draft.occurredAt,
    remark: draft.remark,
    lines: draft.lines.map((line) => ({
      item_id: line.itemId,
      barcode: line.barcode,
      uom_id: line.uomId,
      qty_input: line.qtyInput,
      lot_code_input: line.lotCodeInput,
      production_date: line.productionDate,
      expiry_date: line.expiryDate,
      po_line_id: line.poLineId,
      remark: line.remark,
    })),
  };
}

export async function fetchInboundWarehouseOptions(): Promise<InboundWarehouseOption[]> {
  const rows = (await fetchActiveWarehouses()) as WarehouseListItemLite[];
  return Array.isArray(rows) ? rows.map(mapWarehouseOption) : [];
}

export async function fetchPurchaseOrderSourceOptions(args: {
  warehouseId?: number | null;
  q?: string | null;
  limit?: number;
}): Promise<PurchaseOrderSourceOption[]> {
  const resp = await fetch(
    `/purchase-orders/source-options${buildPurchaseOrderSourceOptionsQuery(args)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `读取采购来源失败：HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as PurchaseOrderSourceOptionsDto;
  return Array.isArray(data.items)
    ? data.items.map(mapPurchaseOrderSourceOption)
    : [];
}

export async function fetchPurchaseOrderCompletionLines(
  poId: number,
): Promise<PurchaseOrderCompletionLoadedLine[]> {
  const resp = await fetch(`/purchase-orders/${poId}/completion`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `读取采购单剩余行失败：HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as PurchaseOrderCompletionDetailDto;
  return Array.isArray(data.lines)
    ? data.lines.map(mapPurchaseOrderCompletionLine)
    : [];
}

export async function commitInboundDraft(
  draft: InboundCommitDraft,
): Promise<InboundCommitResult> {
  const resp = await fetch("/wms/inbound/commit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(toCommitPayload(draft)),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `提交入库失败：HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as InboundCommitOutDto;
  return mapCommitResult(data);
}

export async function listInboundEvents(
  query: InboundEventListQuery,
): Promise<InboundEventSummary[]> {
  const resp = await fetch(`/wms/inbound/events${buildEventQuery(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `读取最近事件失败：HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as InboundEventListDto;
  return Array.isArray(data.items) ? data.items.map(mapSummary) : [];
}

export async function getInboundEventDetail(
  eventId: number,
): Promise<InboundEventDetail> {
  const resp = await fetch(`/wms/inbound/events/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `读取事件详情失败：HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as InboundEventDetailDto;
  return mapDetail(data);
}
