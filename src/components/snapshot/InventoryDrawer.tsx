// src/components/snapshot/InventoryDrawer.tsx
import React, { useEffect, useMemo, useState } from "react";
import type {
  ItemDetailResponse,
  ItemSlice,
} from "../../features/inventory/snapshot/api";
import { fetchLedgerList } from "../../features/diagnostics/ledger-tool/api";
import type {
  LedgerRow,
  LedgerQueryPayload,
} from "../../features/diagnostics/ledger-tool/types";

interface Props {
  open: boolean;
  loading?: boolean;
  item: ItemDetailResponse | null;
  onClose: () => void;
  onRefresh?: () => void;
}

function pickExplainSlice(slices: ItemSlice[]): ItemSlice | null {
  if (!slices || slices.length === 0) return null;
  // 解释优先：TOP 切片（通常最相关），否则就第一条
  const top = slices.find((s) => s.is_top);
  return top ?? slices[0];
}

export default function InventoryDrawer({
  open,
  loading = false,
  item,
  onClose,
  onRefresh,
}: Props) {
  const [latestLoading, setLatestLoading] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [latest, setLatest] = useState<LedgerRow | null>(null);

  const explainSlice = useMemo(() => {
    return item ? pickExplainSlice(item.slices) : null;
  }, [item]);

  // 用于解释的过滤口径：尽量贴近“你正在看的切片”
  const ledgerFilter = useMemo(() => {
    if (!item) return null;
    const base: Partial<LedgerQueryPayload> = { item_id: item.item_id };
    if (explainSlice) {
      base.warehouse_id = explainSlice.warehouse_id;
      base.batch_code = explainSlice.batch_code;
    }
    return base;
  }, [item, explainSlice]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      if (!open || !item || !ledgerFilter) return;

      setLatestLoading(true);
      setLatestError(null);
      setLatest(null);

      try {
        // 注意：后端排序规则由后端决定；我们用 limit=1 取“最新一条”。
        // 如果你们后端默认不是按时间倒序，需要在后端加默认排序（这才符合“前端不猜测”）。
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
  }, [open, item, ledgerFilter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* 背景遮罩 */}
      <div className="flex-1 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* 右侧抽屉 */}
      <div className="w-full max-w-xl bg-white shadow-xl h-full flex flex-col">
        {/* 头部：标题 + 关闭 */}
        <header className="h-16 flex items-center justify-between border-b border-slate-200 px-6">
          <div>
            {/* 主标题：24px */}
            <div className="text-2xl font-semibold text-slate-900">
              单品明细
            </div>
            {item && (
              <div className="mt-1 text-base text-slate-600">
                #{item.item_id} {item.item_name}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="text-base text-slate-600 hover:text-slate-900"
              >
                刷新明细
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-base text-slate-500 hover:text-slate-800"
            >
              关闭
            </button>
          </div>
        </header>

        {/* 主体内容 */}
        <main className="flex-1 overflow-auto p-5 space-y-5">
          {loading && <div className="text-base text-slate-600">加载中…</div>}

          {!loading && item && (
            <>
              {/* 最小解释：最近一条台账（事实来源） */}
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
                  <div className="mt-3 text-sm text-slate-500">
                    正在加载最近台账…
                  </div>
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
                      <div className="text-xs text-slate-500 mb-1">原因</div>
                      <div className="text-slate-900">{latest.reason}</div>
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
                      <div className="text-xs text-slate-500 mb-1">时间</div>
                      <div className="text-slate-900">{latest.occurred_at}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">仓库</div>
                      <div className="text-slate-900">{latest.warehouse_id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">批次</div>
                      <div className="text-slate-900">{latest.batch_code}</div>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-500">
                  解释只来自台账事实（/stock/ledger/query），前端不推导。
                  如果你希望加“查看台账”跳转入口，把 Ledger 工具页面路由贴出来，我会按项目统一导航规范接上。
                </div>
              </section>

              {/* 汇总区域 */}
              <section className="border border-slate-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-slate-800 mb-3">
                  汇总
                </div>
                <div className="flex gap-8 text-base">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      在库 on_hand
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {item.totals.on_hand_qty}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      可用 available
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {item.totals.available_qty}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      预占 reserved
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {item.totals.reserved_qty}
                    </div>
                  </div>
                </div>
              </section>

              {/* 仓 + 批次切片列表 */}
              <section className="border border-slate-200 rounded-lg">
                {/* 表头标题 */}
                <div className="px-4 py-3 border-b border-slate-200 text-lg font-semibold text-slate-800">
                  仓 + 批次切片
                </div>
                <div className="max-h-[440px] overflow-auto">
                  <table className="min-w-full text-base">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          仓库
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          批次
                        </th>
                        <th className="px-3 py-2 text-right text-sm text-slate-600">
                          在库
                        </th>
                        <th className="px-3 py-2 text-right text-sm text-slate-600">
                          可用
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          生产日
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          到期日
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          标记
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.slices.map((s, idx) => (
                        <tr
                          key={`${s.warehouse_id}-${s.batch_code}-${idx}`}
                          className="border-b border-slate-100 text-base"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.warehouse_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.batch_code}
                          </td>
                          <td className="px-3 py-2 text-right">{s.on_hand_qty}</td>
                          <td className="px-3 py-2 text-right">
                            {s.available_qty}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.production_date || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.expiry_date || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.is_top && (
                              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 mr-2 text-sm">
                                TOP
                              </span>
                            )}
                            {s.near_expiry && (
                              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                                临期
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {item.slices.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-4 text-center text-slate-400 text-base"
                            colSpan={7}
                          >
                            无在库批次
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {!loading && !item && (
            <div className="text-base text-slate-500">暂无数据。</div>
          )}
        </main>
      </div>
    </div>
  );
}
