// src/mocks/handlers/outbound.ts
import { http, HttpResponse } from "msw";

interface OutboundCommitBody {
  ref?: string;
  item_id?: number;
  qty?: number;
}

interface GlobalWithOutRef {
  __out_ref?: Set<string>;
}

export const outboundHandlers = [
  http.post("/outbound/commit", async ({ request }) => {
    const body = (await request.json()) as OutboundCommitBody;

    if (!body?.ref || !body.item_id || !body.qty) {
      return HttpResponse.json(
        { ok: false, error: "bad request" },
        { status: 400 },
      );
    }

    const key = `ref:${body.ref}`;

    const g = globalThis as GlobalWithOutRef;
    if (!g.__out_ref) {
      g.__out_ref = new Set<string>();
    }
    const once = g.__out_ref;
    const first = !once.has(key);
    once.add(key);

    return HttpResponse.json({
      ok: true,
      idempotent: !first,
    });
  }),
];
