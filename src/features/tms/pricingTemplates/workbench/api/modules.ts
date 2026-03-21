// src/features/tms/pricingTemplates/workbench/api/modules.ts
//
// 分拆说明：
// - 本文件负责 workbench 下模块资源的 API 调用：
//   - ranges
//   - groups
//   - matrix-cells
// - 已统一走新后端前缀：/tms/pricing/templates
// - 严禁再使用旧路径 /templates

import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../lib/api";
import type {
  ModuleRangesResponse,
  ModuleGroupsResponse,
  ModuleGroupSingleResponse,
  ModuleGroupDeleteResponse,
  ModuleMatrixCellsResponse,
} from "./types";

/* ==================== ranges ==================== */

export async function fetchTemplateRanges(templateId: number) {
  return apiGet<ModuleRangesResponse>(
    `/tms/pricing/templates/${templateId}/ranges`,
  );
}

export async function putTemplateRanges(
  templateId: number,
  payload: unknown,
) {
  return apiPut<ModuleRangesResponse>(
    `/tms/pricing/templates/${templateId}/ranges`,
    payload,
  );
}

/* ==================== groups ==================== */

export async function fetchTemplateGroups(templateId: number) {
  return apiGet<ModuleGroupsResponse>(
    `/tms/pricing/templates/${templateId}/groups`,
  );
}

export async function createTemplateGroup(
  templateId: number,
  payload: unknown,
) {
  return apiPost<ModuleGroupSingleResponse>(
    `/tms/pricing/templates/${templateId}/groups`,
    payload,
  );
}

export async function updateTemplateGroup(
  templateId: number,
  groupId: number,
  payload: unknown,
) {
  return apiPut<ModuleGroupSingleResponse>(
    `/tms/pricing/templates/${templateId}/groups/${groupId}`,
    payload,
  );
}

export async function deleteTemplateGroup(
  templateId: number,
  groupId: number,
) {
  return apiDelete<ModuleGroupDeleteResponse>(
    `/tms/pricing/templates/${templateId}/groups/${groupId}`,
  );
}

/* ==================== matrix ==================== */

export async function fetchTemplateMatrixCells(templateId: number) {
  return apiGet<ModuleMatrixCellsResponse>(
    `/tms/pricing/templates/${templateId}/matrix-cells`,
  );
}

export async function putTemplateMatrixCells(
  templateId: number,
  payload: unknown,
) {
  return apiPut<ModuleMatrixCellsResponse>(
    `/tms/pricing/templates/${templateId}/matrix-cells`,
    payload,
  );
}
