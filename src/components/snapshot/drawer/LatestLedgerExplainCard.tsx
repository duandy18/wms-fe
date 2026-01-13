// src/components/snapshot/drawer/LatestLedgerExplainCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import type {
  ItemDetailResponse,
  ItemSlice,
} from "../../../features/inventory/snapshot/api";

import { fetchLedgerList } from "../../../features/inventory/ledger/api";
import type {
  LedgerQueryPayload,
} from "../../../features/inventory/ledger/api";
import type { LedgerRow } from "../../../features/inventory/ledger/types";

function pickExplainSlice(slices: ItemSlice[]): ItemSlice | null {
  if (!slices || slices.length === 0) return null;
  // 解释优先：TOP 切片（通常最相关），否则就第一条
  const top = slices.find((s) => s.is_top);
  return top ?? slices[0];
}

type Props = {
  open: boolean;
  item: ItemDetailResponse;
};

export function LatestLedgerExplainCard({ open, item }: Props) {
  const [latestLoading, setLatestLoading] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [latest, setLatest] = useState<LedgerRow | null>(null);

  const explainSlice = useMemo(
    () => pickExplainSlice(item.slices),
    [item],
  );

  // 用于解释的过滤口径：尽量贴近“你正在看的切片”
  const ledgerFilter = useMemo(() => {
    const base: LedgerQueryPayload = { item_id: item.item_id };
    if (explainSlice) {
      base.warehouse_id = explainSlice.warehouse_id;
      base.batch_code = explainSlice.batch_code;
    }
    return base;
  }, [item, explainSlice]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      if (!open) return;

      setLatestLoading(true);
      setLatestError(null);
      setLatest(null);

      try {
        // 只取最新一条，由后端排序保证语义（occurred_at desc, id desc）
        const payload: LedgerQueryPayload = {
          ...ledgerFilter,
          limit: 1,
          offset: 0,
        };

        const res = await fetchLedgerList(payload);
        if (cancelled) return;

        setLatest(res.items?.[0] ?? null);
      } catch (err) {
        if (cancelled) return;
         
        console.error("Failed to fetch latest ledger:", err);
        setLatestError("加载最近台账失败（用于解释来源）");
      } finally {
        if (!cancelled) setLatestLoading(false);
      }
    }

    void loadLatest();

    return () => {
      cancelled = true;
    };
  }, [open, ledgerFilter]);

  return (
    <section className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-slate-800">
          最近变动（台账事实）
        </div>
        <div className="text-xs text-slate-500">
          过滤口径：
          {explainSlice
            ? `仓=${explainSlice.warehouse_name} 批次=${explainSlice.batch_code}`
            : "按商品"}
        </div>
      </div>

      {latestLoading && (
        <div className="mt-3 text-sm text-slate-500">正在加载最近台账…</div>
      )}

      {!latestLoading && latestError && (
        <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          {latestError}
        </div>
      )}

      {!latestLoading && !latestError && !latest && (
        <div className="mt-3 text-sm text-slate-500">
          暂无台账记录（或当前过滤条件无法命中）。
        </div>
      )}

      {!latestLoading && !latestError && latest && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-slate-500 mb-1">口径</div>
            <div className="text-slate-900">
              {latest.reason_canon ?? latest.reason}
              {latest.sub_reason ? ` · ${latest.sub_reason}` : ""}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">引用 ref</div>
            <div className="text-slate-900">{latest.ref ?? "-"}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">变动 delta</div>
            <div className="text-slate-900">{latest.delta}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">变动后 after_qty</div>
            <div className="text-slate-900">{latest.after_qty}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">时间</div>
            <div className="text-slate-900">{latest.occurred_at}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">批次</div>
            <div className="text-slate-900">{latest.batch_code ?? "-"}</div>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        解释只来自台账事实（/stock/ledger/query），前端不推导。
      </div>
    </section>
  );
}
