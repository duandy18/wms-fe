import { poiRequest } from "./http";
import type { PlatformOrderIngestionStoreStatus } from "../contracts/status";

export async function fetchPlatformOrderIngestionStoreStatus(
  storeId: number,
): Promise<PlatformOrderIngestionStoreStatus> {
  return poiRequest<PlatformOrderIngestionStoreStatus>(
    `/oms/stores/${storeId}/platform-order-ingestion/status`,
    {
      ctx: "GET /oms/stores/{store_id}/platform-order-ingestion/status",
    },
  );
}
