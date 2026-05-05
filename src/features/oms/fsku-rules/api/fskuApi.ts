// src/features/oms/fsku-rules/api/fskuApi.ts

import { apiGet, apiPatch, apiPost } from "../../../../lib/api";
import type {
  OmsFskuCreateInput,
  OmsFskuDetail,
  OmsFskuExpressionInput,
  OmsFskuListOut,
  OmsFskuStatus,
} from "../types";

export type OmsFskuListParams = {
  query?: string;
  status?: OmsFskuStatus | "all";
  limit?: number;
  offset?: number;
};

function buildListPath(params: OmsFskuListParams = {}): string {
  const sp = new URLSearchParams();

  const query = params.query?.trim();
  if (query) sp.set("query", query);

  if (params.status && params.status !== "all") {
    sp.set("status", params.status);
  }

  sp.set("limit", String(params.limit ?? 200));
  sp.set("offset", String(params.offset ?? 0));

  const qs = sp.toString();
  return qs ? `/oms/fskus?${qs}` : "/oms/fskus";
}

export async function listOmsFskus(params: OmsFskuListParams = {}): Promise<OmsFskuListOut> {
  return apiGet<OmsFskuListOut>(buildListPath(params));
}

export async function getOmsFskuDetail(id: number): Promise<OmsFskuDetail> {
  return apiGet<OmsFskuDetail>(`/oms/fskus/${Math.trunc(id)}`);
}

export async function createOmsFskuDraft(input: OmsFskuCreateInput): Promise<OmsFskuDetail> {
  return apiPost<OmsFskuDetail>("/oms/fskus", {
    name: input.name.trim(),
    code: input.code?.trim() || null,
    shape: input.shape,
    fsku_expr: input.fsku_expr.trim(),
  });
}

export async function patchOmsFskuName(id: number, name: string): Promise<OmsFskuDetail> {
  return apiPatch<OmsFskuDetail>(`/oms/fskus/${Math.trunc(id)}`, {
    name: name.trim(),
  });
}

export async function replaceOmsFskuExpression(
  id: number,
  input: OmsFskuExpressionInput,
): Promise<OmsFskuDetail> {
  return apiPost<OmsFskuDetail>(`/oms/fskus/${Math.trunc(id)}/expression`, {
    fsku_expr: input.fsku_expr.trim(),
  });
}

export async function publishOmsFsku(id: number): Promise<OmsFskuDetail> {
  return apiPost<OmsFskuDetail>(`/oms/fskus/${Math.trunc(id)}/publish`, {});
}

export async function retireOmsFsku(id: number): Promise<OmsFskuDetail> {
  return apiPost<OmsFskuDetail>(`/oms/fskus/${Math.trunc(id)}/retire`, {});
}
