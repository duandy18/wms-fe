// src/domains/pms/export/itemAggregateClient.ts
import { apiGet } from "../../../lib/api";
import type { PublicItemAggregate } from "./contracts/itemAggregate";

export async function fetchItemAggregate(itemId: number): Promise<PublicItemAggregate> {
  if (!Number.isFinite(itemId) || itemId <= 0) {
    throw new Error(`invalid itemId: ${String(itemId)}`);
  }
  return apiGet<PublicItemAggregate>(`/pms/export/items/${itemId}/aggregate`);
}
