import { apiGet, apiPost } from "../../../../lib/api";
import type {
  OutboundReversalDetailOut,
  OutboundReversalIn,
  OutboundReversalOptionsOut,
  OutboundReversalOptionsQuery,
  OutboundReversalOut,
} from "../contracts/outboundReversal";

function buildOutboundReversalOptionsQuery(query?: OutboundReversalOptionsQuery): string {
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

export async function fetchOutboundReversalOptions(
  query?: OutboundReversalOptionsQuery,
): Promise<OutboundReversalOptionsOut> {
  return apiGet<OutboundReversalOptionsOut>(
    `/inventory-adjustment/outbound-reversal/options${buildOutboundReversalOptionsQuery(query)}`,
  );
}

export async function fetchOutboundReversalDetail(
  eventId: number,
): Promise<OutboundReversalDetailOut> {
  return apiGet<OutboundReversalDetailOut>(
    `/inventory-adjustment/outbound-reversal/events/${encodeURIComponent(String(eventId))}`,
  );
}

export async function submitOutboundReversal(
  eventId: number,
  payload: OutboundReversalIn,
): Promise<OutboundReversalOut> {
  return apiPost<OutboundReversalOut>(
    `/inventory-adjustment/outbound-reversal/events/${encodeURIComponent(String(eventId))}/reverse`,
    payload,
  );
}
