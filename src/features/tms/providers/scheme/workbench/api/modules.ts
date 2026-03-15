// src/features/tms/providers/scheme/workbench/api/modules.ts
//
// 运价工作台（单 scheme 主线）接口封装。
// 只使用后端终态合同：ranges / groups / matrix-cells。

import { apiDelete, apiGet, apiPost, apiPut } from "../../../../../../lib/api";
import type {
  ModuleGroupApi,
  ModuleGroupsResponse,
  ModuleMatrixCellsPutPayload,
  ModuleMatrixCellsResponse,
  ModuleRangesPutPayload,
  ModuleRangesResponse,
} from "./types";

export interface ModuleGroupWritePayload {
  sort_order?: number | null;
  active?: boolean;
  provinces: Array<{
    province_code?: string | null;
    province_name?: string | null;
  }>;
}

export interface ModuleGroupSingleResponse {
  ok: boolean;
  group: ModuleGroupApi;
}

export interface ModuleGroupDeleteResponse {
  ok: boolean;
  deleted_group_id: number;
}

export async function fetchSchemeRanges(
  schemeId: number,
): Promise<ModuleRangesResponse> {
  return apiGet<ModuleRangesResponse>(`/pricing-schemes/${schemeId}/ranges`);
}

export async function putSchemeRanges(
  schemeId: number,
  payload: ModuleRangesPutPayload,
): Promise<ModuleRangesResponse> {
  return apiPut<ModuleRangesResponse>(`/pricing-schemes/${schemeId}/ranges`, payload);
}

export async function fetchSchemeGroups(
  schemeId: number,
): Promise<ModuleGroupsResponse> {
  return apiGet<ModuleGroupsResponse>(`/pricing-schemes/${schemeId}/groups`);
}

export async function createSchemeGroup(
  schemeId: number,
  payload: ModuleGroupWritePayload,
): Promise<ModuleGroupSingleResponse> {
  return apiPost<ModuleGroupSingleResponse>(`/pricing-schemes/${schemeId}/groups`, payload);
}

export async function updateSchemeGroup(
  schemeId: number,
  groupId: number,
  payload: ModuleGroupWritePayload,
): Promise<ModuleGroupSingleResponse> {
  return apiPut<ModuleGroupSingleResponse>(
    `/pricing-schemes/${schemeId}/groups/${groupId}`,
    payload,
  );
}

export async function deleteSchemeGroup(
  schemeId: number,
  groupId: number,
): Promise<ModuleGroupDeleteResponse> {
  return apiDelete<ModuleGroupDeleteResponse>(
    `/pricing-schemes/${schemeId}/groups/${groupId}`,
  );
}

export async function fetchSchemeMatrixCells(
  schemeId: number,
): Promise<ModuleMatrixCellsResponse> {
  return apiGet<ModuleMatrixCellsResponse>(`/pricing-schemes/${schemeId}/matrix-cells`);
}

export async function putSchemeMatrixCells(
  schemeId: number,
  payload: ModuleMatrixCellsPutPayload,
): Promise<ModuleMatrixCellsResponse> {
  return apiPut<ModuleMatrixCellsResponse>(
    `/pricing-schemes/${schemeId}/matrix-cells`,
    payload,
  );
}
