import { API_BASE_URL, getAccessToken } from "../../../../lib/api";
import { assertOk, type OkEnvelope } from "../../../../lib/assertOk";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];

export type PoiQueryParams = Record<string, QueryValue>;

type PoiRequestOptions = {
  method?: HttpMethod;
  query?: PoiQueryParams;
  body?: unknown;
  ctx: string;
};

function buildPathWithQuery(path: string, query?: PoiQueryParams): string {
  if (!query) return path;

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        search.append(key, String(item));
      }
      continue;
    }

    search.append(key, String(value));
  }

  const queryText = search.toString();
  if (!queryText) return path;

  return `${path}${path.includes("?") ? "&" : "?"}${queryText}`;
}

function parseErrorPayload(payload: unknown, fallback: string): string {
  if (payload == null) return fallback;
  if (typeof payload === "string") return payload;

  if (typeof payload === "object" && !Array.isArray(payload)) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return fallback;
  }
}

async function readResponsePayload(resp: Response): Promise<unknown> {
  try {
    return await resp.json();
  } catch {
    try {
      return await resp.text();
    } catch {
      return null;
    }
  }
}

export async function poiRequest<T>(
  path: string,
  options: PoiRequestOptions,
): Promise<T> {
  const method = options.method ?? "GET";
  const pathWithQuery = buildPathWithQuery(path, options.query);
  const url = pathWithQuery.startsWith("http")
    ? pathWithQuery
    : `${API_BASE_URL}${pathWithQuery}`;

  const headers = new Headers();
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  const resp = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const payload = await readResponsePayload(resp);

  if (!resp.ok) {
    throw new Error(
      `${options.ctx} 失败：${parseErrorPayload(payload, resp.statusText)}`,
    );
  }

  return assertOk(payload as OkEnvelope<T>, options.ctx);
}
