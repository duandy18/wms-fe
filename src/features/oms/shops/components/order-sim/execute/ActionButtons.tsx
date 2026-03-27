// src/features/admin/stores/components/order-sim/execute/ActionButtons.tsx

import React from "react";
import type { NextAction } from "../../../api_order_ingest";
import { copyText } from "./utils";

function asObj(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}
function asString(x: unknown): string | null {
  return typeof x === "string" ? x : null;
}
function asNumber(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}
function getPayload(a: NextAction): unknown {
  return (a as unknown as { payload?: unknown }).payload;
}

export function ActionButtons(props: { actions: NextAction[] | null; storeId: number }) {
  const actions = props.actions ?? [];
  if (!actions.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {actions.map((a, i) => {
        if (a.action === "go_store_fsku_binding_governance") {
          const p = asObj(getPayload(a));
          const storeId = asNumber(p?.store_id) ?? props.storeId;
          const mc = asString(p?.merchant_code) ?? "";
          const href = `/stores/${storeId}?focus_merchant_code=${encodeURIComponent(mc)}`;
          return (
            <button
              key={`${a.action}-${i}`}
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => {
                window.location.href = href;
              }}
            >
              {a.label}
            </button>
          );
        }

        if (a.action === "bind_merchant_code") {
          const endpoint = (a as unknown as { endpoint?: unknown }).endpoint;
          const payload = getPayload(a);
          const payloadText = JSON.stringify(
            { endpoint: typeof endpoint === "string" ? endpoint : undefined, payload },
            null,
            2
          );

          return (
            <button
              key={`${a.action}-${i}`}
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              onClick={async () => {
                const ok = await copyText(payloadText);
                if (!ok) window.prompt("复制以下内容用于人工绑定：", payloadText);
              }}
            >
              复制：{a.label}
            </button>
          );
        }

        const raw = JSON.stringify(a, null, 2);
        return (
          <button
            key={`${a.action}-${i}`}
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            onClick={async () => {
              const ok = await copyText(raw);
              if (!ok) window.prompt("复制动作信息：", raw);
            }}
          >
            复制动作：{a.label || a.action}
          </button>
        );
      })}
    </div>
  );
}
