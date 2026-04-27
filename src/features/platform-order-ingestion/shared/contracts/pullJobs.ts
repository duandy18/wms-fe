import type { JsonRecord, NullableString, PlatformCode } from "./common";

export type PullJobType = "manual" | "scheduled" | "repair";

export interface PullJobCreateInput {
  platform: PlatformCode;
  store_id: number;
  job_type: PullJobType;
  time_from?: string | null;
  time_to?: string | null;
  order_status?: number | null;
  page_size: number;
  request_payload?: JsonRecord | null;
}

export interface PullJobRunCreateInput {
  page?: number | null;
}

export interface PullJobRunPagesCreateInput {
  max_pages: number;
}

export interface PullJob {
  id: number;
  platform: string;
  store_id: number;
  job_type: string;
  status: string;
  time_from: NullableString;
  time_to: NullableString;
  order_status: number | null;
  page_size: number;
  cursor_page: number;
  request_payload: JsonRecord | null;
  created_by: number | null;
  last_run_at: NullableString;
  last_success_at: NullableString;
  last_error_at: NullableString;
  last_error_message: NullableString;
  created_at: NullableString;
  updated_at: NullableString;
}

export interface PullJobRun {
  id: number;
  job_id: number;
  platform: string;
  store_id: number;
  status: string;
  page: number;
  page_size: number;
  has_more: boolean;
  started_at: NullableString;
  finished_at: NullableString;
  orders_count: number;
  success_count: number;
  failed_count: number;
  request_payload: JsonRecord | null;
  result_payload: JsonRecord | null;
  error_message: NullableString;
  created_at: NullableString;
}

export interface PullJobRunLog {
  id: number;
  job_id: number;
  run_id: number;
  level: string;
  event_type: string;
  platform_order_no: NullableString;
  native_order_id: number | null;
  message: NullableString;
  payload: JsonRecord | null;
  created_at: NullableString;
}

export interface PullJobListData {
  rows: PullJob[];
  total: number;
  limit: number;
  offset: number;
}

export interface PullJobDetailData {
  job: PullJob;
  runs: PullJobRun[];
  logs: PullJobRunLog[];
}

export interface PullJobRunData {
  job: PullJob;
  run: PullJobRun;
  logs: PullJobRunLog[];
}

export interface PullJobRunPagesData {
  job: PullJob;
  runs: PullJobRun[];
  logs: PullJobRunLog[];
  pages_executed: number;
  stopped_reason: string;
}
