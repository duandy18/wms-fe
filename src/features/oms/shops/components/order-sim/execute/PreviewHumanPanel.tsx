// src/features/admin/stores/components/order-sim/execute/PreviewHumanPanel.tsx

import React from "react";
import type { CustomerInfo } from "./CustomerInfoCard";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { LinesTable } from "./LinesTable";
import type { OrderSimPreviewOut } from "../../../api_order_ingest";
import { asObj, asStr, copyText } from "./utils";
import { JsonBox } from "./JsonBox";

export function PreviewHumanPanel(props: { storeId: number; data: OrderSimPreviewOut }) {
  const { data } = props;
  const p = data.preview;
  const ir = data.ingest_result;

  const addr = asObj(p.address) ?? {};
  const info: CustomerInfo = {
    receiver_name: asStr(addr.receiver_name),
    receiver_phone: asStr(addr.receiver_phone),
    province: asStr(addr.province),
    city: asStr(addr.city),
    district: asStr(addr.district),
    detail: asStr(addr.detail),
    zipcode: asStr(addr.zipcode),
  };

  const blocked = ir.blocked_reasons?.join(", ") ?? "";
  const reasonCode = ir.reason_code ?? "-";
  const summary = `dry_run=true · reason_code=${reasonCode} · unresolved=${ir.unresolved.length} · blocked=${blocked || "-"}`;

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-800">订单预览（不落库）</div>
          <div className="mt-1 text-xs text-slate-600">{summary}</div>
          <div className="mt-1 text-xs text-slate-700">
            <span className="font-semibold">ext_order_no：</span> <span className="font-mono">{p.ext_order_no}</span>
          </div>
        </div>

        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          onClick={async () => {
            const ok = await copyText(p.ext_order_no);
            if (!ok) window.prompt("复制 ext_order_no：", p.ext_order_no);
          }}
        >
          复制 ext_order_no
        </button>
      </div>

      <CustomerInfoCard info={info} />

      {ir.next_actions && ir.next_actions.length ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="text-sm font-semibold text-amber-900">下一步动作（建议）</div>
          <div className="mt-2 text-xs text-amber-800 whitespace-pre-wrap break-words">{JSON.stringify(ir.next_actions, null, 2)}</div>
        </div>
      ) : null}

      <LinesTable storeId={props.storeId} preview={p} resolved={ir.resolved} unresolved={ir.unresolved} />

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">查看原始 JSON（排障用）</summary>
        <JsonBox title="preview（raw）" value={p} />
        <JsonBox title="ingest_result（raw）" value={ir} />
      </details>
    </div>
  );
}
