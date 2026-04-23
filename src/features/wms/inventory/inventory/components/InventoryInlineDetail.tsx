import React, { useEffect, useMemo, useState } from "react";
import type {
  InventoryDetailResponse,
  InventoryDetailSlice,
  InventoryExplainLedgerRow,
  InventoryExplainResponse,
} from "@/features/wms/inventory/api/contracts";
import { fetchInventoryExplain } from "@/features/wms/inventory/api/inventory";
import {
  actionLabel,
  actionPillClass,
  canonLabel,
  formatQtyWithUnit,
  movementLabel,
  reasonLabel,
} from "@/features/wms/inventory/ledger/ledgerDisplay";

type Props = {
  detail: InventoryDetailResponse | null;
  loading: boolean;
  error: string;
  onRefresh?: () => void;
};

function pickExplainSlice(slices: InventoryDetailSlice[]): InventoryDetailSlice | null {
  if (!slices || slices.length === 0) return null;
  const top = slices.find((s) => s.is_top);
  return top ?? slices[0];
}

const InventoryInlineDetail: React.FC<Props> = ({
  detail,
  loading,
  error,
  onRefresh,
}) => {
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explain, setExplain] = useState<InventoryExplainResponse | null>(null);

  const explainSlice = useMemo(() => {
    return detail ? pickExplainSlice(detail.slices) : null;
  }, [detail]);

  useEffect(() => {
    let cancelled = false;

    async function loadExplain() {
      if (!detail || !explainSlice) return;

      setExplainLoading(true);
      setExplainError(null);
      setExplain(null);

      try {
        const data = await fetchInventoryExplain({
          item_id: detail.item_id,
          warehouse_id: explainSlice.warehouse_id,
          lot_code: explainSlice.lot_code ?? null,
          limit: 100,
        });
        if (cancelled) return;
        setExplain(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch inventory explain:", err);
        setExplainError("加载库存形成链解释失败");
      } finally {
        if (!cancelled) setExplainLoading(false);
      }
    }

    void loadExplain();
    return () => {
      cancelled = true;
    };
  }, [detail, explainSlice]);

  if (loading && !detail) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        正在加载当前库存明细…
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        当前行暂无明细。
      </div>
    );
  }

  const unit = explain?.anchor.base_uom_name ?? detail.base_uom_name ?? null;

  function rowUnit(row: InventoryExplainLedgerRow): string | null | undefined {
    return row.base_uom_name ?? unit;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      {loading ? (
        <div className="mb-3 text-xs text-slate-500">正在刷新当前明细…</div>
      ) : null}

      {error ? (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div />
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
            >
              刷新明细
            </button>
          ) : null}
        </div>

        {explainLoading ? (
          <div className="mt-3 text-sm text-slate-500">正在加载形成链解释…</div>
        ) : null}

        {!explainLoading && explainError ? (
          <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
            {explainError}
          </div>
        ) : null}

        {!explainLoading && !explainError && explain ? (
          <div className="mt-3 space-y-3">
            <div
              className={`rounded-md border px-3 py-2 text-xs ${
                explain.summary.matches_current === true
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : explain.summary.matches_current === false
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {explain.summary.matches_current === true
                ? `链尾校验通过：最后一条台账 after_qty=${explain.summary.ledger_last_after_qty ?? "-"}，与当前库存 ${explain.summary.current_qty} 一致。`
                : explain.summary.matches_current === false
                  ? `链尾校验失败：最后一条台账 after_qty=${explain.summary.ledger_last_after_qty ?? "-"}，与当前库存 ${explain.summary.current_qty} 不一致。`
                  : "当前无法判断链尾是否与当前库存一致。"}
              {explain.summary.truncated
                ? ` 当前仅返回 ${explain.ledger_rows.length} / ${explain.summary.row_count} 条。`
                : ` 共 ${explain.summary.row_count} 条。`}
            </div>

            {explain.ledger_rows.length === 0 ? (
              <div className="text-sm text-slate-500">当前锚点暂无形成链记录。</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600">时间</th>
                      <th className="px-3 py-2 text-left text-slate-600">动作</th>
                      <th className="px-3 py-2 text-left text-slate-600">原始原因</th>
                      <th className="px-3 py-2 text-left text-slate-600">关联单据</th>
                      <th className="px-3 py-2 text-right text-slate-600">变动</th>
                      <th className="px-3 py-2 text-right text-slate-600">变动后</th>
                      <th className="px-3 py-2 text-left text-slate-600">追溯号</th>
                    </tr>
                  </thead>
                  <tbody>
                    {explain.ledger_rows.map((row) => {
                      const debugTitle = [
                        `reason=${reasonLabel(row.reason)} (${row.reason ?? "-"})`,
                        `reason_canon=${canonLabel(row.reason_canon ?? null)}`,
                        `movement_type=${movementLabel(row.movement_type ?? null)}`,
                        `sub_reason=${actionLabel(row.sub_reason ?? null)} (${row.sub_reason ?? "-"})`,
                      ]
                        .filter(Boolean)
                        .join(" | ");

                      return (
                        <tr key={row.id} className="border-b border-slate-100 text-slate-800">
                          <td className="px-3 py-2 font-mono text-[12px]">{row.occurred_at}</td>
                          <td className="px-3 py-2" title={debugTitle}>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium ${actionPillClass(
                                row.sub_reason ?? null,
                              )}`}
                            >
                              {actionLabel(row.sub_reason ?? null)}
                            </span>
                          </td>
                          <td className="px-3 py-2">{reasonLabel(row.reason)}</td>
                          <td className="px-3 py-2 font-mono text-[12px]">{row.ref ?? "-"}</td>
                          <td
                            className={`px-3 py-2 text-right font-mono ${
                              row.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {formatQtyWithUnit(row.delta, rowUnit(row))}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatQtyWithUnit(row.after_qty, rowUnit(row))}
                          </td>
                          <td className="px-3 py-2 font-mono text-[12px]">{row.trace_id ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default InventoryInlineDetail;
