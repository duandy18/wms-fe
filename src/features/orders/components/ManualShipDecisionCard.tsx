// src/features/orders/components/ManualShipDecisionCard.tsx
import React, { useEffect, useMemo, useState } from "react";

import type { OrderSummary, WarehouseOption } from "../api/index";
import type { OrderWarehouseAvailabilityResponse, OrderWarehouseAvailabilityCell } from "../api/types";
import { fetchOrderWarehouseAvailability, manualAssignFulfillmentWarehouse } from "../api/client";

function whLabel(w: WarehouseOption) {
  const code = (w.code ?? "").trim();
  const name = (w.name ?? "").trim();
  if (code && name) return `${code} · ${name}`;
  if (code) return code;
  if (name) return name;
  return `WH${w.id}`;
}

function isNeedManual(row: OrderSummary | null) {
  return row?.can_manual_assign_execution_warehouse === true;
}

function buildCellMap(matrix: OrderWarehouseAvailabilityCell[]) {
  const m = new Map<number, Map<number, OrderWarehouseAvailabilityCell>>();
  for (const c of matrix || []) {
    const wid = Number(c.warehouse_id);
    const iid = Number(c.item_id);
    if (!Number.isFinite(wid) || !Number.isFinite(iid)) continue;
    if (!m.has(wid)) m.set(wid, new Map());
    m.get(wid)!.set(iid, c);
  }
  return m;
}

function lineLabel(ln: { item_id: number; sku_id: string | null; title: string | null }) {
  const t = (ln.title ?? "").trim();
  const sku = (ln.sku_id ?? "").trim();
  if (sku && t) return `${sku} · ${t}`;
  if (sku) return sku;
  if (t) return t;
  return `商品#${ln.item_id}`;
}

export const ManualShipDecisionCard: React.FC<{
  selected: OrderSummary | null;
  warehouses: WarehouseOption[];
  onClose: () => void;
  onReload: () => void;
}> = ({ selected, warehouses, onClose, onReload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avail, setAvail] = useState<OrderWarehouseAvailabilityResponse | null>(null);

  const [warehouseId, setWarehouseId] = useState<string>("");
  const [reason, setReason] = useState<string>("库存/时效等原因人工指定");
  const [note, setNote] = useState<string>("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeWarehouses = useMemo(() => (warehouses || []).filter((w) => w.active !== false), [warehouses]);

  useEffect(() => {
    setError(null);
    setAvail(null);
    setSubmitError(null);
    setWarehouseId("");
    setNote("");

    if (!selected) return;
    if (!isNeedManual(selected)) return;

    const wids = activeWarehouses.map((w) => w.id);
    setLoading(true);
    void (async () => {
      try {
        const r = await fetchOrderWarehouseAvailability({ orderId: selected.id, warehouseIds: wids });
        if (r.ok !== true) {
          setAvail(null);
          setError("加载库存对照失败（后端未返回 ok=true）");
        } else {
          setAvail(r);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载库存对照失败";
        setError(msg);
        setAvail(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selected, activeWarehouses]);

  const cellMap = useMemo(() => buildCellMap(avail?.matrix || []), [avail]);

  if (!selected) return null;

  const show = isNeedManual(selected);
  if (!show) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">人工处理</div>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
        <div className="mt-2 text-[12px] text-slate-600">
          当前选中订单不需要人工指定发货仓库（发货状态不是“待指定仓库”）。
        </div>
      </section>
    );
  }

  async function submit() {
    setSubmitError(null);

    const sel = selected;
    if (!sel) return setSubmitError("未选中订单。");

    const wid = Number(warehouseId);
    if (!Number.isFinite(wid) || wid <= 0) return setSubmitError("请选择发货仓库。");
    if (!reason.trim()) return setSubmitError("原因必填。");

    setSubmitLoading(true);
    try {
      await manualAssignFulfillmentWarehouse({
        platform: sel.platform,
        shop_id: sel.shop_id,
        ext_order_no: sel.ext_order_no,
        warehouse_id: wid,
        reason: reason.trim(),
        note: note.trim() ? note.trim() : null,
      });
      onReload();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "提交失败";
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">人工处理：指定发货仓库</div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          onClick={onClose}
          disabled={submitLoading}
        >
          关闭
        </button>
      </div>

      <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
        订单：<span className="font-mono">{selected.ext_order_no}</span> · 默认仓库：<span className="font-mono">WH{selected.service_warehouse_id ?? "-"}</span> · 发货仓库：{" "}
        <span className="font-mono">{selected.warehouse_id ? `WH${selected.warehouse_id}` : "未选择"}</span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-semibold text-slate-800">订单 × 仓库库存对照（只读）</div>
          <div className="text-[11px] text-slate-500">{avail?.scope ? `范围：${avail.scope}` : "—"}</div>
        </div>

        {loading && <div className="mt-2 text-[11px] text-slate-500">正在加载库存对照…</div>}
        {error && <div className="mt-2 text-[11px] text-red-600">{error}</div>}

        {!loading && !error && avail && (
          <>
            {avail.lines.length === 0 ? (
              <div className="mt-2 text-[11px] text-slate-500">该订单无有效行项目。</div>
            ) : avail.warehouses.length === 0 ? (
              <div className="mt-2 text-[11px] text-slate-500">无候选仓库可展示。</div>
            ) : (
              <div className="mt-2 overflow-auto">
                <table className="min-w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="sticky left-0 z-10 w-[280px] border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-700">
                        商品（SKU/名称）
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">需求</th>
                      {avail.warehouses.map((w) => (
                        <th key={w.id} className="border border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">
                          {w.code || `WH${w.id}`} {w.name ? `· ${w.name}` : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {avail.lines.map((ln) => (
                      <tr key={ln.item_id} className="hover:bg-slate-50">
                        <td className="sticky left-0 z-10 border border-slate-200 bg-white px-2 py-1 text-left text-slate-800">
                          {lineLabel(ln)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right font-mono text-slate-800">
                          {ln.req_qty}
                        </td>
                        {avail.warehouses.map((w) => {
                          const cell = cellMap.get(w.id)?.get(ln.item_id);
                          const status = (cell?.status ?? "").toUpperCase();
                          const shortage = Number(cell?.shortage ?? 0) || 0;
                          const available = Number(cell?.available ?? 0) || 0;

                          return (
                            <td key={`${w.id}-${ln.item_id}`} className="border border-slate-200 px-2 py-1">
                              {!cell ? (
                                <span className="text-slate-400">—</span>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-slate-900">{available}</span>
                                  {status === "SHORTAGE" && shortage > 0 ? (
                                    <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
                                      缺 {shortage}
                                    </span>
                                  ) : (
                                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                      够
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[11px] text-slate-500">发货仓库（必选）</div>
          <select
            className="h-9 w-full rounded border border-slate-300 px-2 text-sm disabled:bg-slate-50"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={submitLoading || activeWarehouses.length === 0}
          >
            <option value="">请选择仓库</option>
            {activeWarehouses.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {whLabel(w)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1 text-[11px] text-slate-500">原因（必填）</div>
          <input
            className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitLoading}
          />
        </div>

        <div className="md:col-span-2">
          <div className="mb-1 text-[11px] text-slate-500">备注（可选）</div>
          <input
            className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="补充说明（可留空）"
            disabled={submitLoading}
          />
        </div>
      </div>

      {submitError && <div className="mt-2 text-[11px] text-red-600">{submitError}</div>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-100"
          onClick={onClose}
          disabled={submitLoading}
        >
          取消
        </button>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          onClick={() => void submit()}
          disabled={submitLoading}
        >
          {submitLoading ? "提交中…" : "提交指定"}
        </button>
      </div>
    </section>
  );
};
