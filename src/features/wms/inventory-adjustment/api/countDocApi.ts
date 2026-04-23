import { apiGet, apiPost, apiPut } from "../../../../lib/api";
import type {
  CountDocCreateIn,
  CountDocExecutionDetailOut,
  CountDocFreezeOut,
  CountDocLinesUpdateIn,
  CountDocLinesUpdateOut,
  CountDocListOut,
  CountDocListQuery,
  CountDocOut,
  CountDocPostIn,
  CountDocPostOut,
} from "../contracts/countDoc";

function buildCountDocListQuery(query?: CountDocListQuery): string {
  const params = new URLSearchParams();

  if (query?.warehouse_id != null) {
    params.set("warehouse_id", String(query.warehouse_id));
  }
  if (query?.active_only === true) {
    params.set("active_only", "true");
  }
  if (query?.limit != null) {
    params.set("limit", String(query.limit));
  }
  if (query?.offset != null) {
    params.set("offset", String(query.offset));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchCountDocs(query?: CountDocListQuery): Promise<CountDocListOut> {
  return apiGet<CountDocListOut>(
    `/inventory-adjustment/count-docs${buildCountDocListQuery(query)}`,
  );
}

export async function fetchCountDocExecutionDetail(
  docId: number,
): Promise<CountDocExecutionDetailOut> {
  return apiGet<CountDocExecutionDetailOut>(
    `/inventory-adjustment/count-docs/${encodeURIComponent(String(docId))}/execution`,
  );
}

export async function createCountDoc(payload: CountDocCreateIn): Promise<CountDocOut> {
  return apiPost<CountDocOut>("/inventory-adjustment/count-docs", payload);
}

export async function freezeCountDoc(docId: number): Promise<CountDocFreezeOut> {
  return apiPost<CountDocFreezeOut>(
    `/inventory-adjustment/count-docs/${encodeURIComponent(String(docId))}/freeze`,
    {},
  );
}

export async function updateCountDocLines(
  docId: number,
  payload: CountDocLinesUpdateIn,
): Promise<CountDocLinesUpdateOut> {
  return apiPut<CountDocLinesUpdateOut>(
    `/inventory-adjustment/count-docs/${encodeURIComponent(String(docId))}/lines`,
    payload,
  );
}

export async function postCountDoc(
  docId: number,
  payload: CountDocPostIn,
): Promise<CountDocPostOut> {
  return apiPost<CountDocPostOut>(
    `/inventory-adjustment/count-docs/${encodeURIComponent(String(docId))}/post`,
    payload,
  );
}
