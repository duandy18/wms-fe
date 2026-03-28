// src/features/oms/platforms/api.ts

import { apiGet, apiPost, apiPut } from "../../../lib/api";
import { assertOk } from "../../../lib/assertOk";
import { fetchStoreDetail, fetchStores } from "../shops/api";
import type { StoreDetailData, StoreListItem } from "../shops/types";
import type {
  PlatformAuthStatus,
  PlatformIntegrationDetail,
  PlatformIntegrationListItem,
  SavePlatformCredentialInput,
  SaveTaobaoAppConfigInput,
  TaobaoAppConfigCurrent,
  TaobaoConnectionStatus,
  TaobaoPullCheckResult,
} from "./types";

function mapListItem(
  store: StoreListItem,
  auth: PlatformAuthStatus | null,
): PlatformIntegrationListItem {
  return {
    store_id: store.id,
    platform: store.platform,
    shop_id: store.shop_id,
    store_name: store.name,
    active: store.active,
    shop_type: store.shop_type,
    auth_source: auth?.auth_source ?? "NONE",
    expires_at: auth?.expires_at ?? null,
    mall_id: auth?.mall_id ?? null,
  };
}

function mapDetail(
  detail: StoreDetailData,
  auth: PlatformAuthStatus | null,
): PlatformIntegrationDetail {
  const mallId = auth?.mall_id ?? null;
  const authSource = auth?.auth_source ?? "NONE";
  const expiresAt = auth?.expires_at ?? null;

  return {
    summary: {
      store_id: detail.store_id,
      platform: detail.platform,
      shop_id: detail.shop_id,
      store_name: detail.name,
      active: true,
      shop_type: detail.shop_type ?? "PROD",
    },
    contact: {
      email: detail.email ?? null,
      contact_name: detail.contact_name ?? null,
      contact_phone: detail.contact_phone ?? null,
    },
    auth: {
      auth_source: authSource,
      expires_at: expiresAt,
    },
    identity: {
      mall_id: mallId,
      confirmed: Boolean(mallId),
    },
    pull_status: {
      ready: authSource !== "NONE",
      message:
        authSource === "NONE"
          ? "当前未完成平台接入，暂不具备拉单前置条件。"
          : "当前已具备基础接入条件，拉单状态明细待后端 pull 主线补齐。",
    },
  };
}

export async function fetchPlatformAuthStatus(
  storeId: number,
): Promise<PlatformAuthStatus> {
  const resp = await apiGet<{ ok: boolean; data: PlatformAuthStatus }>(
    `/oms/stores/${storeId}/platform-auth`,
  );
  return assertOk(resp, "GET /oms/stores/{store_id}/platform-auth");
}

export async function fetchCurrentTaobaoAppConfig(): Promise<TaobaoAppConfigCurrent> {
  const resp = await apiGet<{ ok: boolean; data: TaobaoAppConfigCurrent }>(
    "/oms/taobao/app-config/current",
  );
  return assertOk(resp, "GET /oms/taobao/app-config/current");
}

export async function saveCurrentTaobaoAppConfig(
  input: SaveTaobaoAppConfigInput,
): Promise<TaobaoAppConfigCurrent> {
  const resp = await apiPut<{ ok: boolean; data: TaobaoAppConfigCurrent }>(
    "/oms/taobao/app-config/current",
    {
      app_key: input.app_key,
      app_secret: input.app_secret,
      callback_url: input.callback_url,
      api_base_url: input.api_base_url,
      sign_method: input.sign_method,
    },
  );
  return assertOk(resp, "PUT /oms/taobao/app-config/current");
}

export async function fetchTaobaoConnection(
  storeId: number,
): Promise<TaobaoConnectionStatus> {
  const resp = await apiGet<{ ok: boolean; data: TaobaoConnectionStatus }>(
    `/oms/stores/${storeId}/taobao/connection`,
  );
  return assertOk(resp, "GET /oms/stores/{store_id}/taobao/connection");
}

export async function runTaobaoTestPull(
  storeId: number,
  allowRealRequest = false,
): Promise<TaobaoPullCheckResult> {
  const resp = await apiPost<{ ok: boolean; data: TaobaoPullCheckResult }>(
    `/oms/stores/${storeId}/taobao/test-pull`,
    {},
    { allow_real_request: allowRealRequest },
  );
  return assertOk(resp, "POST /oms/stores/{store_id}/taobao/test-pull");
}

export async function savePlatformIntegrationCredential(
  input: SavePlatformCredentialInput,
): Promise<void> {
  await apiPost("/oms/platform-shops/credentials", {
    platform: input.platform,
    shop_id: input.shopId,
    access_token: input.accessToken,
    status: "ACTIVE",
  });
}

export async function fetchPlatformIntegrations(): Promise<PlatformIntegrationListItem[]> {
  const storesResp = await fetchStores();
  const stores = storesResp.data ?? [];

  const rows = await Promise.all(
    stores.map(async (store) => {
      try {
        const auth = await fetchPlatformAuthStatus(store.id);
        return mapListItem(store, auth);
      } catch (error) {
        console.warn("fetch platform auth failed for store", store.id, error);
        return mapListItem(store, null);
      }
    }),
  );

  return rows;
}

export async function fetchPlatformIntegrationDetail(
  storeId: number,
): Promise<PlatformIntegrationDetail> {
  const [detailResp, auth] = await Promise.all([
    fetchStoreDetail(storeId),
    fetchPlatformAuthStatus(storeId).catch((error) => {
      console.warn("fetch platform auth failed for detail", storeId, error);
      return null as PlatformAuthStatus | null;
    }),
  ]);

  return mapDetail(detailResp.data, auth);
}
