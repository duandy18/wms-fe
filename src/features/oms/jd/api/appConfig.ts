import { apiGet, apiPut } from "../../../../lib/api";
import { assertOk } from "../../../../lib/assertOk";
import type {
  JdAppConfigCurrent,
  JdAuthorizeStartResult,
  JdConnectionStatus,
  SaveJdAppConfigInput,
} from "../types/appConfig";

export async function fetchCurrentJdAppConfig(): Promise<JdAppConfigCurrent> {
  const resp = await apiGet<{ ok: boolean; data: JdAppConfigCurrent }>(
    "/oms/jd/app-config/current",
  );
  return assertOk(resp, "GET /oms/jd/app-config/current");
}

export async function saveCurrentJdAppConfig(
  input: SaveJdAppConfigInput,
): Promise<JdAppConfigCurrent> {
  const resp = await apiPut<{ ok: boolean; data: JdAppConfigCurrent }>(
    "/oms/jd/app-config/current",
    {
      client_id: input.client_id,
      client_secret: input.client_secret,
      callback_url: input.callback_url,
      gateway_url: input.gateway_url,
      sign_method: input.sign_method,
    },
  );
  return assertOk(resp, "PUT /oms/jd/app-config/current");
}

export async function fetchJdConnection(
  storeId: number,
): Promise<JdConnectionStatus> {
  const resp = await apiGet<{ ok: boolean; data: JdConnectionStatus }>(
    `/oms/stores/${storeId}/jd/connection`,
  );
  return assertOk(resp, "GET /oms/stores/{store_id}/jd/connection");
}

export async function fetchJdAuthorizeStart(
  storeId: number,
): Promise<JdAuthorizeStartResult> {
  const resp = await apiGet<{ ok: boolean; data: JdAuthorizeStartResult }>(
    `/oms/jd/oauth/start?store_id=${storeId}`,
  );
  return assertOk(resp, "GET /oms/jd/oauth/start");
}
