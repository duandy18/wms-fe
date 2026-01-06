// src/features/operations/inbound/PurchaseOrderContextPanel.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "./types";
import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import { PurchaseOrderHeaderCard } from "../../purchase-orders/PurchaseOrderHeaderCard";
import { PurchaseOrderLinesTable } from "../../purchase-orders/PurchaseOrderLinesTable";

function supplierLabel(p: PurchaseOrderWithLines): string {
  return p.supplier_name ?? p.supplier ?? "未知供应商";
}

function statusLabel(raw: string | null | undefined): string {
  const s = (raw ?? "").trim().toUpperCase();
  if (!s) return "未知";
  if (s === "DRAFT") return "草稿";
  if (s === "CREATED") return "已创建";
  if (s === "OPEN") return "进行中";
  if (s === "CLOSED") return "已关闭";
  if (s === "COMPLETED") return "已完成";
  return "进行中";
}

export function PurchaseOrderContextPanel(props: {
  c: InboundCockpitController;
  po: InboundCockpitController["currentPo"];
  poOptions: PurchaseOrderWithLines[];
  loadingPoOptions: boolean;
  poOptionsError: string | null;
  selectedPoId: string;

  onSelectPoId: (poId: string) => Promise<void>;
  onSelectPoChange: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;

  onManualLoadPo: () => Promise<void>;
}) {
  const navigate = useNavigate();

  const {
    c,
    po,
    poOptions,
    loadingPoOptions,
    poOptionsError,
    selectedPoId,
    onSelectPoId,
    onSelectPoChange,
    onManualLoadPo,
  } = props;

  const [showAll, setShowAll] = useState(false);

  // 原版行表选中态（只读展示用）
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  const recentList = useMemo(() => {
    const list = [...poOptions];
    list.sort((a, b) => b.id - a.id);
    return showAll ? list : list.slice(0, 10);
  }, [poOptions, showAll]);

  const totalCount = poOptions.length;

  const totalQtyOrdered = useMemo(() => {
    if (!po) return 0;
    return (po.lines ?? []).reduce((sum, l) => sum + (l.qty_ordered ?? 0), 0);
  }, [po]);

  const totalQtyReceived = useMemo(() => {
    if (!po) return 0;
    return (po.lines ?? []).reduce((sum, l) => sum + (l.qty_received ?? 0), 0);
  }, [po]);

  // 当采购单变化时，默认选中第一行（对齐原版详情页行为）
  React.useEffect(() => {
    if (!po || !po.lines || po.lines.length === 0) {
      setSelectedLineId(null);
      return;
    }
    setSelectedLineId(po.lines[0].id);
  }, [po?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* 强起点标题 */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-base font-semibold text-slate-900">
            最近采购单（待收）
          </div>
          <div className="text-[11px] text-slate-500">
            点击采购单开始收货；验收请以“采购单原版明细”为准。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] text-slate-700">
            共 <span className="font-mono">{totalCount}</span> 张
          </span>

          <button
            type="button"
            onClick={() => void onManualLoadPo()}
            disabled={c.loadingPo}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {c.loadingPo ? "加载中…" : "按编号打开"}
          </button>
        </div>
      </div>

      {/* 最近采购单清单 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {showAll ? "显示全部（最多 50）" : "显示最近 10 张"}
          </span>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[11px] text-slate-600 hover:text-slate-900"
            disabled={loadingPoOptions || !!poOptionsError}
          >
            {showAll ? "收起" : "展开更多"}
          </button>
        </div>

        {poOptionsError ? (
          <div className="text-[11px] text-red-600">{poOptionsError}</div>
        ) : loadingPoOptions ? (
          <div className="text-[11px] text-slate-500">加载中…</div>
        ) : recentList.length === 0 ? (
          <div className="text-[11px] text-slate-500">暂无采购单。</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {recentList.map((p) => {
              const active = String(p.id) === String(selectedPoId);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => void onSelectPoId(String(p.id))}
                  className={
                    "w-full text-left rounded-lg border px-3 py-2 " +
                    (active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900")
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">
                      #{p.id} · {supplierLabel(p)}
                    </div>
                    <div
                      className={
                        active
                          ? "text-[11px] text-slate-200"
                          : "text-[11px] text-slate-500"
                      }
                    >
                      {statusLabel(p.status)}
                    </div>
                  </div>

                  <div
                    className={
                      active
                        ? "mt-1 text-[11px] text-slate-200"
                        : "mt-1 text-[11px] text-slate-600"
                    }
                  >
                    行数：{p.lines?.length ?? 0}
                    {p.warehouse_id != null ? (
                      <span className="ml-2">仓库：{p.warehouse_id}</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 高级入口 */}
      <details className="rounded-lg border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-[11px] text-slate-700">
          按编号打开（高级）
        </summary>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
              value={selectedPoId}
              onChange={(e) => void onSelectPoChange(e)}
              disabled={loadingPoOptions || !!poOptionsError}
            >
              <option value="">
                {loadingPoOptions
                  ? "加载中…"
                  : poOptionsError
                  ? "加载失败"
                  : "请选择"}
              </option>
              {poOptions.map((p) => {
                const label = `#${p.id} · ${supplierLabel(p)} · ${statusLabel(
                  p.status,
                )}`;
                return (
                  <option key={p.id} value={p.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">采购单编号：</span>
            <input
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
              placeholder="例如 123"
              value={c.poIdInput}
              onChange={(e) => c.setPoIdInput(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void onManualLoadPo()}
              disabled={c.loadingPo}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              打开
            </button>
          </div>
        </div>
      </details>

      {/* 当前选中采购单摘要 + 原版明细 */}
      {po ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-slate-900">
                当前：#{po.id} · {supplierLabel(po)}
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                onClick={() => navigate(`/purchase-orders/${po.id}`)}
              >
                在采购单页面打开
              </button>
            </div>

            <div className="mt-1 text-slate-600">
              仓库：{po.warehouse_id} · 状态：{statusLabel(po.status)} · 行数：
              {po.lines.length}
            </div>
          </div>

          {/* ✅ 原版样式（只读） */}
          <details className="rounded-xl border border-slate-200 bg-white p-3" open>
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              采购单详情（原版）
              <span className="ml-2 text-[11px] font-normal text-slate-500">
                用于验收核对，不在此处编辑
              </span>
            </summary>

            <div className="mt-3 space-y-3">
              <PurchaseOrderHeaderCard
                po={po}
                poRef={`PO-${po.id}`}
                totalQtyOrdered={totalQtyOrdered}
                totalQtyReceived={totalQtyReceived}
              />

              <PurchaseOrderLinesTable
                po={po}
                selectedLineId={selectedLineId}
                onSelectLine={setSelectedLineId}
              />
            </div>
          </details>
        </div>
      ) : (
        <div className="text-xs text-slate-500">未选择采购单</div>
      )}
    </div>
  );
}
