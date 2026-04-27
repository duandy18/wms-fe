import { poiRequest } from "../../../shared/api/http";
import type { TaobaoAppConfigCurrent } from "../contracts/appConfig";

export async function fetchCurrentTaobaoAppConfig(): Promise<TaobaoAppConfigCurrent> {
  return poiRequest<TaobaoAppConfigCurrent>("/oms/taobao/app-config/current", {
    ctx: "GET /oms/taobao/app-config/current",
  });
}
