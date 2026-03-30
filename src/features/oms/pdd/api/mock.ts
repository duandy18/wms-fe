import type {
  PddMockAuthorizeResponse,
  PddMockClearResponse,
  PddMockIngestResponse,
  PddMockScenario,
} from "../types/mock";

type OkEnvelope<T> = {
  ok: boolean;
  data: T;
};

function getAccessToken(): string | null {
  const candidates = [
    window.localStorage.getItem("access_token"),
    window.localStorage.getItem("token"),
    window.localStorage.getItem("authToken"),
  ];

  for (const value of candidates) {
    const text = String(value || "").trim();
    if (text) {
      return text;
    }
  }
  return null;
}

async function requestJson<T>(input: string, init: RequestInit): Promise<T> {
  const token = getAccessToken();

  const resp = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const payload = (await resp.json()) as OkEnvelope<T> | { detail?: string };

  if (!resp.ok) {
    const detail =
      typeof (payload as { detail?: string }).detail === "string"
        ? (payload as { detail?: string }).detail
        : `${init.method || "REQUEST"} ${input} failed`;
    throw new Error(detail);
  }

  if (!("ok" in payload) || !payload.ok) {
    throw new Error(`${init.method || "REQUEST"} ${input} returned non-ok payload`);
  }

  return payload.data;
}

export async function authorizePddStoreMock(
  storeId: number,
): Promise<PddMockAuthorizeResponse> {
  return requestJson<PddMockAuthorizeResponse>(`/oms/pdd/mock/stores/${storeId}/authorize`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function ingestPddOrdersMock(params: {
  storeId: number;
  scenario: PddMockScenario;
  count: number;
}): Promise<PddMockIngestResponse> {
  const { storeId, scenario, count } = params;
  return requestJson<PddMockIngestResponse>(`/oms/pdd/mock/stores/${storeId}/orders/ingest`, {
    method: "POST",
    body: JSON.stringify({
      scenario,
      count,
    }),
  });
}

export async function clearPddOrdersMock(params: {
  storeId: number;
  clearConnection?: boolean;
  clearCredential?: boolean;
}): Promise<PddMockClearResponse> {
  const { storeId, clearConnection = false, clearCredential = false } = params;
  return requestJson<PddMockClearResponse>(`/oms/pdd/mock/stores/${storeId}/orders`, {
    method: "DELETE",
    body: JSON.stringify({
      clear_connection: clearConnection,
      clear_credential: clearCredential,
    }),
  });
}
