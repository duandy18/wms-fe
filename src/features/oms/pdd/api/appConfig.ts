// src/features/oms/platforms/api_pdd.ts

import { apiGet, apiPut } from "../../../../lib/api";
import { assertOk } from "../../../../lib/assertOk";
import type {
  PddAppConfigCurrent,
  PddAuthorizeStartResult,
  PddConnectionStatus,
  SavePddAppConfigInput,
} from "../types/appConfig";

export async function fetchCurrentPddAppConfig(): Promise<PddAppConfigCurrent> {
  const resp = await apiGet<{ ok: boolean; data: PddAppConfigCurrent }>(
    "/oms/pdd/app-config/current",
  );
  return assertOk(resp, "GET /oms/pdd/app-config/current");
}

export async function saveCurrentPddAppConfig(
  input: SavePddAppConfigInput,
): Promise<PddAppConfigCurrent> {
  const resp = await apiPut<{ ok: boolean; data: PddAppConfigCurrent }>(
    "/oms/pdd/app-config/current",
    {
      client_id: input.client_id,
      client_secret: input.client_secret,
      redirect_uri: input.redirect_uri,
      api_base_url: input.api_base_url,
      sign_method: input.sign_method,
    },
  );
  return assertOk(resp, "PUT /oms/pdd/app-config/current");
}

export async function fetchPddConnection(
  storeId: number,
): Promise<PddConnectionStatus> {
  const resp = await apiGet<{ ok: boolean; data: PddConnectionStatus }>(
    `/oms/stores/${storeId}/pdd/connection`,
  );
  return assertOk(resp, "GET /oms/stores/{store_id}/pdd/connection");
}

export async function fetchPddAuthorizeStart(
  storeId: number,
): Promise<PddAuthorizeStartResult> {
  const resp = await apiGet<{ ok: boolean; data: PddAuthorizeStartResult }>(
    `/oms/pdd/oauth/start?store_id=${storeId}`,
  );
  return assertOk(resp, "GET /oms/pdd/oauth/start");
}
