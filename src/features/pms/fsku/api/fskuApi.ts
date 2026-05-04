// src/features/pms/fsku/api/fskuApi.ts

import { apiGet, apiPatch, apiPost } from "../../../../lib/api";
import type {
  PmsFskuCreateInput,
  PmsFskuDetail,
  PmsFskuExpressionInput,
  PmsFskuListOut,
  PmsFskuStatus,
} from "../types";

export type PmsFskuListParams = {
  query?: string;
  status?: PmsFskuStatus | "all";
  limit?: number;
  offset?: number;
};

function buildListPath(params: PmsFskuListParams = {}): string {
  const sp = new URLSearchParams();

  const query = params.query?.trim();
  if (query) sp.set("query", query);

  if (params.status && params.status !== "all") {
    sp.set("status", params.status);
  }

  sp.set("limit", String(params.limit ?? 200));
  sp.set("offset", String(params.offset ?? 0));

  const qs = sp.toString();
  return qs ? `/pms/fskus?${qs}` : "/pms/fskus";
}

export async function listPmsFskus(params: PmsFskuListParams = {}): Promise<PmsFskuListOut> {
  return apiGet<PmsFskuListOut>(buildListPath(params));
}

export async function createPmsFskuDraft(input: PmsFskuCreateInput): Promise<PmsFskuDetail> {
  return apiPost<PmsFskuDetail>("/pms/fskus", {
    name: input.name.trim(),
    code: input.code?.trim() || null,
    shape: input.shape,
    fsku_expr: input.fsku_expr.trim(),
  });
}

export async function patchPmsFskuName(id: number, name: string): Promise<PmsFskuDetail> {
  return apiPatch<PmsFskuDetail>(`/pms/fskus/${Math.trunc(id)}`, {
    name: name.trim(),
  });
}

export async function replacePmsFskuExpression(
  id: number,
  input: PmsFskuExpressionInput,
): Promise<PmsFskuDetail> {
  return apiPost<PmsFskuDetail>(`/pms/fskus/${Math.trunc(id)}/expression`, {
    fsku_expr: input.fsku_expr.trim(),
  });
}

export async function publishPmsFsku(id: number): Promise<PmsFskuDetail> {
  return apiPost<PmsFskuDetail>(`/pms/fskus/${Math.trunc(id)}/publish`, {});
}

export async function retirePmsFsku(id: number): Promise<PmsFskuDetail> {
  return apiPost<PmsFskuDetail>(`/pms/fskus/${Math.trunc(id)}/retire`, {});
}
