// src/features/shipping-assist/handoffs/api.ts

import { apiGet } from "../../../lib/api";
import type {
  ShippingHandoffListResponse,
  ShippingHandoffQuery,
} from "./types";

export async function fetchShippingHandoffs(
  query: ShippingHandoffQuery = {},
): Promise<ShippingHandoffListResponse> {
  return await apiGet<ShippingHandoffListResponse>(
    "/shipping-assist/handoffs",
    {
      limit: query.limit ?? 500,
      offset: query.offset ?? 0,
    },
  );
}
