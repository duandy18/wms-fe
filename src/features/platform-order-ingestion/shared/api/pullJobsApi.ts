import { poiRequest } from "./http";
import type { PlatformCode } from "../contracts/common";
import type {
  PullJob,
  PullJobCreateInput,
  PullJobDetailData,
  PullJobListData,
  PullJobRunCreateInput,
  PullJobRunData,
  PullJobRunPagesCreateInput,
  PullJobRunPagesData,
} from "../contracts/pullJobs";

export async function createPlatformOrderPullJob(
  input: PullJobCreateInput,
): Promise<PullJob> {
  return poiRequest<PullJob>("/oms/platform-order-ingestion/pull-jobs", {
    method: "POST",
    body: input,
    ctx: "POST /oms/platform-order-ingestion/pull-jobs",
  });
}

export async function fetchPlatformOrderPullJobs(params: {
  platform?: PlatformCode;
  storeId?: number | null;
  status?: string | null;
  limit?: number;
  offset?: number;
}): Promise<PullJobListData> {
  return poiRequest<PullJobListData>("/oms/platform-order-ingestion/pull-jobs", {
    query: {
      platform: params.platform,
      store_id: params.storeId ?? undefined,
      status: params.status || undefined,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    },
    ctx: "GET /oms/platform-order-ingestion/pull-jobs",
  });
}

export async function fetchPlatformOrderPullJobDetail(
  jobId: number,
): Promise<PullJobDetailData> {
  return poiRequest<PullJobDetailData>(
    `/oms/platform-order-ingestion/pull-jobs/${jobId}`,
    {
      ctx: "GET /oms/platform-order-ingestion/pull-jobs/{job_id}",
    },
  );
}

export async function runPlatformOrderPullJobOnce(
  jobId: number,
  input: PullJobRunCreateInput,
): Promise<PullJobRunData> {
  return poiRequest<PullJobRunData>(
    `/oms/platform-order-ingestion/pull-jobs/${jobId}/runs`,
    {
      method: "POST",
      body: input,
      ctx: "POST /oms/platform-order-ingestion/pull-jobs/{job_id}/runs",
    },
  );
}

export async function runPlatformOrderPullJobPages(
  jobId: number,
  input: PullJobRunPagesCreateInput,
): Promise<PullJobRunPagesData> {
  return poiRequest<PullJobRunPagesData>(
    `/oms/platform-order-ingestion/pull-jobs/${jobId}/run-pages`,
    {
      method: "POST",
      body: input,
      ctx: "POST /oms/platform-order-ingestion/pull-jobs/{job_id}/run-pages",
    },
  );
}
