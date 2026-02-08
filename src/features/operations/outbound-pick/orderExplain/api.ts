// src/features/operations/outbound-pick/orderExplain/api.ts

import { apiPost } from "@/lib/api";
import type { PlatformOrderReplayIn, PlatformOrderReplayOut } from "./types";

export async function replayPlatformOrder(
  payload: PlatformOrderReplayIn,
): Promise<PlatformOrderReplayOut> {
  // 后端会 norm_platform → upper；前端不推导、不改写
  return apiPost<PlatformOrderReplayOut>("/platform-orders/replay", payload);
}
