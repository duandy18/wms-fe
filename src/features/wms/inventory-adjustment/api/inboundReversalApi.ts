import { apiGet, apiPost } from "../../../../lib/api";
import type {
  InboundReversalDetailOut,
  InboundReversalIn,
  InboundReversalOptionsOut,
  InboundReversalOptionsQuery,
  InboundReversalOut,
} from "../contracts/inboundReversal";

function buildInboundReversalOptionsQuery(query?: InboundReversalOptionsQuery): string {
  const params = new URLSearchParams();

  if (query?.days != null) {
    params.set("days", String(query.days));
  }
  if (query?.limit != null) {
    params.set("limit", String(query.limit));
  }
  if (query?.source_type) {
    params.set("source_type", query.source_type);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchInboundReversalOptions(
  query?: InboundReversalOptionsQuery,
): Promise<InboundReversalOptionsOut> {
  return apiGet<InboundReversalOptionsOut>(
    `/inventory-adjustment/inbound-reversal/options${buildInboundReversalOptionsQuery(query)}`,
  );
}

export async function fetchInboundReversalDetail(
  eventId: number,
): Promise<InboundReversalDetailOut> {
  return apiGet<InboundReversalDetailOut>(
    `/inventory-adjustment/inbound-reversal/events/${encodeURIComponent(String(eventId))}`,
  );
}

export async function submitInboundReversal(
  eventId: number,
  payload: InboundReversalIn,
): Promise<InboundReversalOut> {
  return apiPost<InboundReversalOut>(
    `/inventory-adjustment/inbound-reversal/events/${encodeURIComponent(String(eventId))}/reverse`,
    payload,
  );
}
