import { poiRequest } from "../../../shared/api/http";
import type { JdAppConfigCurrent } from "../contracts/appConfig";

export async function fetchCurrentJdAppConfig(): Promise<JdAppConfigCurrent> {
  return poiRequest<JdAppConfigCurrent>("/oms/jd/app-config/current", {
    ctx: "GET /oms/jd/app-config/current",
  });
}
