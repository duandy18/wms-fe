// src/domains/pms/public/itemAggregateClient.ts
import { apiGet } from "../../../lib/api";
import type { PublicItemAggregate } from "./contracts/itemAggregate";

export async function fetchItemAggregate(itemId: number): Promise<PublicItemAggregate> {
  if (!Number.isFinite(itemId) || itemId <= 0) {
    throw new Error(`invalid itemId: ${String(itemId)}`);
  }
  return apiGet<PublicItemAggregate>(`/public/items/${itemId}/aggregate`);
}
