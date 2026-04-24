import { apiGet } from "../../../../lib/api";
import type {
  InventoryAdjustmentSummaryDetailOut,
  InventoryAdjustmentSummaryListOut,
  InventoryAdjustmentSummaryQuery,
  InventoryAdjustmentSummaryType,
} from "../contracts/inventoryAdjustmentSummary";

function buildInventoryAdjustmentSummaryQuery(
  query?: InventoryAdjustmentSummaryQuery,
): string {
  const params = new URLSearchParams();

  if (query?.adjustment_type) {
    params.set("adjustment_type", query.adjustment_type);
  }
  if (query?.warehouse_id != null) {
    params.set("warehouse_id", String(query.warehouse_id));
  }
  if (query?.limit != null) {
    params.set("limit", String(query.limit));
  }
  if (query?.offset != null) {
    params.set("offset", String(query.offset));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchInventoryAdjustmentSummary(
  query?: InventoryAdjustmentSummaryQuery,
): Promise<InventoryAdjustmentSummaryListOut> {
  return apiGet<InventoryAdjustmentSummaryListOut>(
    `/inventory-adjustment/summary${buildInventoryAdjustmentSummaryQuery(query)}`,
  );
}

export async function fetchInventoryAdjustmentSummaryDetail(
  adjustmentType: InventoryAdjustmentSummaryType,
  objectId: number,
): Promise<InventoryAdjustmentSummaryDetailOut> {
  return apiGet<InventoryAdjustmentSummaryDetailOut>(
    `/inventory-adjustment/summary/${encodeURIComponent(adjustmentType)}/${encodeURIComponent(String(objectId))}`,
  );
}
