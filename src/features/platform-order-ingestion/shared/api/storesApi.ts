import { poiRequest } from "./http";
import type { PlatformCode } from "../contracts/common";

export interface PlatformOrderIngestionStoreOption {
  id: number;
  platform: string;
  shop_id: string;
  name: string;
  active: boolean;
  shop_type: string;
}

export async function fetchPlatformOrderIngestionStores(
  platform?: PlatformCode,
): Promise<PlatformOrderIngestionStoreOption[]> {
  const rows = await poiRequest<PlatformOrderIngestionStoreOption[]>("/oms/stores", {
    ctx: "GET /oms/stores",
  });

  if (!platform) return rows;

  return rows.filter(
    (row) => String(row.platform || "").trim().toLowerCase() === platform,
  );
}
