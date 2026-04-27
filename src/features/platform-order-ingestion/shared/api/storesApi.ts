import { poiRequest } from "./http";
import type { PlatformCode } from "../contracts/common";

export interface PlatformOrderIngestionStoreOption {
  id: number;
  platform: string;
  store_code: string;
  store_name: string;
  active: boolean;
  route_mode: string | null;
  store_type: string | null;
  email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
}

function normalizePlatform(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "tb") return "taobao";
  return normalized;
}

export async function fetchPlatformOrderIngestionStores(
  platform?: PlatformCode,
): Promise<PlatformOrderIngestionStoreOption[]> {
  const rows = await poiRequest<PlatformOrderIngestionStoreOption[]>("/oms/stores", {
    ctx: "GET /oms/stores",
  });

  if (!platform) return rows;

  return rows.filter((row) => normalizePlatform(row.platform) === platform);
}
