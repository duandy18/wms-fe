// src/features/admin/stores/components/order-sim/execute/RowDetail.tsx

import React from "react";
import type { ResolvedRow } from "../../../api_order_ingest";
import { ActionButtons } from "./ActionButtons";

export function RowDetail(props: { row: ResolvedRow; storeId: number }) {
  const r = props.row;

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-700">
        <span className="font-semibold">reason：</span>
        <span className="font-mono">{r.reason ?? "-"}</span>
        {r.hint ? <span className="ml-2 text-slate-500">（{r.hint}）</span> : null}
      </div>

      {r.risk_level || r.risk_reason ? (
        <div className="mt-1 text-xs">
          <span className="font-semibold text-slate-700">risk：</span>
          <span className="font-mono text-slate-700">{r.risk_level ?? "-"}</span>
          {r.risk_reason ? <span className="ml-2 text-slate-600">{r.risk_reason}</span> : null}
        </div>
      ) : null}

      {r.risk_flags && r.risk_flags.length ? (
        <div className="mt-1 text-xs text-slate-500">
          flags：<span className="font-mono">{r.risk_flags.join(", ")}</span>
        </div>
      ) : null}

      <ActionButtons actions={r.next_actions} storeId={props.storeId} />
    </div>
  );
}
