// src/features/admin/shipping-providers/scheme/workbench/api/modules.ts
//
// 运价工作台（新主线）modules 三阶段接口封装。
// 只使用后端终态合同：ranges / groups / matrix-cells。

import { apiGet, apiPut } from "../../../../../../lib/api";
import type {
  ModuleCode,
  ModuleGroupsPutPayload,
  ModuleGroupsResponse,
  ModuleMatrixCellsPutPayload,
  ModuleMatrixCellsResponse,
  ModuleRangesPutPayload,
  ModuleRangesResponse,
} from "./types";

export async function fetchModuleRanges(
  schemeId: number,
  moduleCode: ModuleCode,
): Promise<ModuleRangesResponse> {
  return apiGet<ModuleRangesResponse>(`/pricing-schemes/${schemeId}/modules/${moduleCode}/ranges`);
}

export async function putModuleRanges(
  schemeId: number,
  moduleCode: ModuleCode,
  payload: ModuleRangesPutPayload,
): Promise<ModuleRangesResponse> {
  return apiPut<ModuleRangesResponse>(`/pricing-schemes/${schemeId}/modules/${moduleCode}/ranges`, payload);
}

export async function fetchModuleGroups(
  schemeId: number,
  moduleCode: ModuleCode,
): Promise<ModuleGroupsResponse> {
  return apiGet<ModuleGroupsResponse>(`/pricing-schemes/${schemeId}/modules/${moduleCode}/groups`);
}

export async function putModuleGroups(
  schemeId: number,
  moduleCode: ModuleCode,
  payload: ModuleGroupsPutPayload,
): Promise<ModuleGroupsResponse> {
  return apiPut<ModuleGroupsResponse>(`/pricing-schemes/${schemeId}/modules/${moduleCode}/groups`, payload);
}

export async function fetchModuleMatrixCells(
  schemeId: number,
  moduleCode: ModuleCode,
): Promise<ModuleMatrixCellsResponse> {
  return apiGet<ModuleMatrixCellsResponse>(`/pricing-schemes/${schemeId}/modules/${moduleCode}/matrix-cells`);
}

export async function putModuleMatrixCells(
  schemeId: number,
  moduleCode: ModuleCode,
  payload: ModuleMatrixCellsPutPayload,
): Promise<ModuleMatrixCellsResponse> {
  return apiPut<ModuleMatrixCellsResponse>(
    `/pricing-schemes/${schemeId}/modules/${moduleCode}/matrix-cells`,
    payload,
  );
}
