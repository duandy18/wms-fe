// src/features/oms/platforms/api_taobao.ts

import { apiGet, apiPost, apiPut } from "../../../lib/api";
import { assertOk } from "../../../lib/assertOk";
import type {
  SaveTaobaoAppConfigInput,
  TaobaoAppConfigCurrent,
  TaobaoConnectionStatus,
  TaobaoPullCheckResult,
} from "./types_taobao";

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
