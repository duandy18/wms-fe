import { apiGet, apiPost } from "../../../../lib/api";
import type {
  PmsProjectionCheckResult,
  PmsProjectionIntegrationStatus,
  PmsProjectionList,
  PmsProjectionResource,
  PmsProjectionSyncResult,
  PmsProjectionSyncRuns,
} from "../types";

const BASE_PATH = "/pms/projections";

export async function fetchPmsProjectionIntegrationStatus(): Promise<PmsProjectionIntegrationStatus> {
  return apiGet<PmsProjectionIntegrationStatus>(`${BASE_PATH}/status`);
}

export async function fetchPmsProjectionRows(params: {
  resource: PmsProjectionResource;
  limit: number;
  offset: number;
  q?: string;
}): Promise<PmsProjectionList> {
  return apiGet<PmsProjectionList>(
    `${BASE_PATH}/${params.resource}`,
    {
      limit: params.limit,
      offset: params.offset,
      q: params.q?.trim() || undefined,
    },
  );
}

export async function syncPmsProjectionResource(
  resource: PmsProjectionResource,
): Promise<PmsProjectionSyncResult> {
  return apiPost<PmsProjectionSyncResult>(
    `${BASE_PATH}/${resource}/sync`,
    {},
  );
}

export async function checkPmsProjectionResource(
  resource: PmsProjectionResource,
  limit = 200,
): Promise<PmsProjectionCheckResult> {
  return apiPost<PmsProjectionCheckResult>(
    `${BASE_PATH}/${resource}/check`,
    {},
    { limit },
  );
}

export async function fetchPmsProjectionSyncRuns(params: {
  resource?: PmsProjectionResource;
  limit?: number;
}): Promise<PmsProjectionSyncRuns> {
  return apiGet<PmsProjectionSyncRuns>(`${BASE_PATH}/sync-runs`, {
    resource: params.resource,
    limit: params.limit ?? 20,
  });
}
