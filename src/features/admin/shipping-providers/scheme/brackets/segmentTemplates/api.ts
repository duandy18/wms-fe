// src/features/admin/shipping-providers/scheme/brackets/segmentTemplates/api.ts
//
// Segments / Template Workbench 的 API（集中在一个目录，避免散落在 schemes/api/types）
//
// 注意：endpoint 命名以当前前端代码与既有 PUT items 路径为锚点；
// 若后端路径不同，只需要在这里集中改动即可。

import type { SegmentTemplateOut } from "./types";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const { API_BASE_URL, getAccessToken } = await import("../../../../../../lib/api");

  const token = getAccessToken();
  const url = `${API_BASE_URL}${path}`;

  const resp = await fetch(url, {
    ...(init ?? {}),
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!resp.ok) {
    const text = await resp.text();
    // ✅ 关键：错误信息带上 url，便于以后定位（不兜底、不改行为）
    throw new Error(`HTTP ${resp.status} @ ${url}: ${text}`);
  }

  const json = (await resp.json()) as { ok: boolean; data: T };
  return json.data;
}

export async function fetchSegmentTemplates(schemeId: number): Promise<SegmentTemplateOut[]> {
  return await fetchJson<SegmentTemplateOut[]>(`/pricing-schemes/${schemeId}/segment-templates`, { method: "GET" });
}

export async function fetchSegmentTemplateDetail(templateId: number): Promise<SegmentTemplateOut> {
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}`, { method: "GET" });
}

export async function createSegmentTemplate(schemeId: number, payload: { name: string }): Promise<SegmentTemplateOut> {
  return await fetchJson<SegmentTemplateOut>(`/pricing-schemes/${schemeId}/segment-templates`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function publishSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  // ✅ 后端真实路由：/segment-templates/{id}:publish
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}:publish`, { method: "POST" });
}

export async function activateSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  // ✅ 后端真实路由：/segment-templates/{id}:activate
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}:activate`, { method: "POST" });
}

export async function deactivateSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  // ✅ 语义：从“可绑定区域”移除（is_active=false）
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}:deactivate`, { method: "POST" });
}

export async function renameSegmentTemplate(templateId: number, payload: { name: string }): Promise<SegmentTemplateOut> {
  // ✅ 语义：修改模板名称（用于运营识别，不影响算价事实）
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}:rename`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function archiveSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  // ✅ 后端真实路由：/segment-templates/{id}:archive
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}:archive`, { method: "POST" });
}

export async function unarchiveSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  // ✅ 后端真实路由：/segment-templates/{id}:unarchive
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}:unarchive`, { method: "POST" });
}

export async function patchSegmentTemplateItemActive(itemId: number, active: boolean): Promise<SegmentTemplateOut> {
  return await fetchJson<SegmentTemplateOut>(`/segment-template-items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function apiPutTemplateItems(
  templateId: number,
  items: Array<{ ord: number; min_kg: string | number; max_kg: string | number | null; active: boolean }>,
): Promise<SegmentTemplateOut> {
  return await fetchJson<SegmentTemplateOut>(`/segment-templates/${templateId}/items`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}
