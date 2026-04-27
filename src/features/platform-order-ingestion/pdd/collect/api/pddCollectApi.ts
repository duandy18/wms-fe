import { poiRequest } from "../../../shared/api/http";
import type { PddAppConfigCurrent } from "../contracts/appConfig";

export async function fetchCurrentPddAppConfig(): Promise<PddAppConfigCurrent> {
  return poiRequest<PddAppConfigCurrent>("/oms/pdd/app-config/current", {
    ctx: "GET /oms/pdd/app-config/current",
  });
}
