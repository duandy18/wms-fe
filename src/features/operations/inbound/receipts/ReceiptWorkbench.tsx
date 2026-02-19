// src/features/operations/inbound/receipts/ReceiptWorkbench.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrderDetail } from "../../../purchase-orders/api";
import { InboundUI } from "../ui";
import type { PurchaseOrderReceiveWorkbenchOut, WorkbenchBatchRowOut } from "./types";
import { confirmInboundReceipt, fetchPoReceiveWorkbench, startPoReceiveDraft } from "./api";
import { ReceiptDraftLinesTable } from "./ReceiptDraftLinesTable";

type BatchesTab = "draft" | "confirmed" | "all";

function upper(s: string | null | undefined): string {
  return String(s ?? "").toUpperCase();
}

function flattenBatches(
  wb: PurchaseOrderReceiveWorkbenchOut | null,
  pick: (r: { batches: WorkbenchBatchRowOut[]; confirmed_batches: WorkbenchBatchRowOut[]; all_batches: WorkbenchBatchRowOut[] }) => WorkbenchBatchRowOut[],
): WorkbenchBatchRowOut[] {
  if (!wb || !Array.isArray(wb.rows)) return [];
  const out: WorkbenchBatchRowOut[] = [];
  for (const r of wb.rows) {
    const xs = pick(r);
    if (Array.isArray(xs) && xs.length) out.push(...xs);
  }
  return out;
}

export const ReceiptWorkbench: React.FC<{ po: PurchaseOrderDetail | null }> = ({ po }) => {
  const [wb, setWb] = useState<PurchaseOrderReceiveWorkbenchOut | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [batchesTab, setBatchesTab] = useState<BatchesTab>("draft");

  const hasReceipt = wb?.receipt != null;
  const receiptStatus = upper(wb?.receipt?.status ?? "");
  const isConfirmed = receiptStatus === "CONFIRMED";

  const statusBadge = useMemo(() => {
    if (!po) return { text: "未选择 PO", cls: "bg-slate-50 text-slate-700 border-slate-200" };
    if (!wb) return { text: "未加载", cls: "bg-slate-50 text-slate-700 border-slate-200" };
    if (!hasReceipt) return { text: "未开始", cls: "bg-slate-50 text-slate-700 border-slate-200" };
    if (receiptStatus === "CONFIRMED") return { text: "已确认（CONFIRMED）", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (receiptStatus === "DRAFT") return { text: "草稿（DRAFT）", cls: "bg-slate-50 text-slate-700 border-slate-200" };
    return { text: receiptStatus ? `状态：${receiptStatus}` : "未开始", cls: "bg-slate-50 text-slate-700 border-slate-200" };
  }, [po, wb, hasReceipt, receiptStatus]);

  async function refreshWorkbench(poId: number) {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchPoReceiveWorkbench(poId);
      setWb(data);
    } catch (e) {
      setErr((e as { message?: string })?.message ?? "拉取 receive-workbench 失败");
      setWb(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setErr(null);
    setWb(null);
    if (!po) return;
    void refreshWorkbench(po.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po?.id]);

  const explain = wb?.explain ?? null;
  const explainOk = !!explain?.confirmable;

  const caps = wb?.caps ?? null;
  const canStartDraft = !!caps?.can_start_draft;
  const canConfirm = !!caps?.can_confirm;

  async function handleStartReceipt() {
    if (!po) return;
    setErr(null);
    setStarting(true);
    try {
      await startPoReceiveDraft(po.id);
      await refreshWorkbench(po.id);
    } catch (e) {
      setErr((e as { message?: string })?.message ?? "开始收货失败（POST /purchase-orders/{po_id}/receipts/draft）");
    } finally {
      setStarting(false);
    }
  }

  async function handleConfirm() {
    if (!po) return;
    setErr(null);

    if (!wb?.receipt) {
      setErr("尚未开始收货：请先点击“开始收货”创建草稿，再录入实收。");
      return;
    }
    if (!canConfirm || !explainOk) {
      setErr("当前不可确认：caps.can_confirm=false 或 explain.confirmable=false（请先处理阻断项）。");
      return;
    }

    setConfirming(true);
    try {
      await confirmInboundReceipt(wb.receipt.receipt_id);
      await refreshWorkbench(po.id);
    } catch (e) {
      setErr((e as { message?: string })?.message ?? "Confirm 失败");
    } finally {
      setConfirming(false);
    }
  }

  const draftBatches = useMemo(() => flattenBatches(wb, (r) => r.batches), [wb]);
  const confirmedBatches = useMemo(() => flattenBatches(wb, (r) => r.confirmed_batches), [wb]);
  const allBatches = useMemo(() => flattenBatches(wb, (r) => r.all_batches), [wb]);

  const activeBatches = batchesTab === "draft" ? draftBatches : batchesTab === "confirmed" ? confirmedBatches : allBatches;

  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-base font-semibold text-slate-900">采购收货工作台（Receive Workbench）</div>
          <div className="text-sm text-slate-600">唯一数据源：GET /purchase-orders/{`{po_id}`}/receive-workbench</div>
        </div>

        <div className="flex items-center gap-2">
          <div className={"shrink-0 rounded-full px-3 py-1 text-[12px] font-medium border " + statusBadge.cls} title={String(wb?.receipt?.status ?? "")}>
            {statusBadge.text}
          </div>

          <button
            type="button"
            className={InboundUI.btnPrimary}
            onClick={() => void handleStartReceipt()}
            disabled={!po || starting || !canStartDraft || isConfirmed}
            title={!po ? "请先选择采购单" : !canStartDraft ? "当前不可开始草稿（caps.can_start_draft=false）" : "显式开始收货（创建/复用 DRAFT receipt）"}
          >
            {isConfirmed ? "已确认" : starting ? "开始中…" : hasReceipt ? "继续收货" : "开始收货"}
          </button>
        </div>
      </div>

      {err ? <div className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] ${InboundUI.danger}`}>{err}</div> : null}

      {!po ? (
        <div className={InboundUI.quiet}>请先选择采购单。</div>
      ) : !wb ? (
        <div className={InboundUI.quiet}>{loading ? "加载 workbench 中…" : "Workbench 未加载。"}</div>
      ) : (
        <>
          <ReceiptDraftLinesTable
            wb={wb}
            disabled={isConfirmed}
            onAfterReceive={async (next) => {
              // ✅ 后端 receive-line 直接返回 workbench：优先用返回体减少一次 GET
              if (next) {
                setWb(next);
                return;
              }
              await refreshWorkbench(po.id);
            }}
          />

          {/* Explain 卡：来自 workbench.explain（可能为 null） */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900">解释卡（Explain / Preflight）</div>
              <button type="button" className={InboundUI.btnGhost} onClick={() => void refreshWorkbench(po.id)} disabled={!po || loading}>
                {loading ? "刷新中…" : "刷新 Workbench"}
              </button>
            </div>

            {!wb.receipt ? (
              <div className={InboundUI.quiet}>尚未开始收货：请先点击右上角“开始收货”创建草稿。</div>
            ) : !explain ? (
              <div className={InboundUI.quiet}>Explain 暂不可用（explain=null）。</div>
            ) : (
              <div className="space-y-2">
                <div
                  className={[
                    "rounded-lg border px-3 py-2 text-[13px]",
                    explainOk ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900",
                  ].join(" ")}
                >
                  {explainOk ? "✅ 可确认：所有硬校验通过" : "⚠️ 不可确认：存在阻断项（见下方）"}
                </div>

                {Array.isArray(explain.blocking_errors) && explain.blocking_errors.length ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-800 space-y-1">
                    <div className="font-medium">阻断项（blocking_errors）</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {explain.blocking_errors.map((x, i) => (
                        <li key={i} className="break-all">
                          <span className="font-mono text-slate-600">{JSON.stringify(x)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className={InboundUI.quiet}>无阻断项。</div>
                )}

                <div className="text-[12px] text-slate-600">
                  Receipt：<span className="font-mono">{wb.receipt.ref}</span> · 状态 <span className="font-mono">{upper(wb.receipt.status)}</span> · occurred_at(UTC){" "}
                  <span className="font-mono">{wb.receipt.occurred_at}</span>
                </div>
              </div>
            )}
          </div>

          {/* 批次区：按行聚合展示（draft/confirmed/all） */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900">批次</div>
              <div className="flex items-center gap-2">
                <button type="button" className={batchesTab === "draft" ? InboundUI.btnPrimary : InboundUI.btnGhost} onClick={() => setBatchesTab("draft")}>
                  草稿批次（{draftBatches.length}）
                </button>
                <button
                  type="button"
                  className={batchesTab === "confirmed" ? InboundUI.btnPrimary : InboundUI.btnGhost}
                  onClick={() => setBatchesTab("confirmed")}
                >
                  已确认批次（{confirmedBatches.length}）
                </button>
                <button type="button" className={batchesTab === "all" ? InboundUI.btnPrimary : InboundUI.btnGhost} onClick={() => setBatchesTab("all")}>
                  全部批次（{allBatches.length}）
                </button>
              </div>
            </div>

            {activeBatches.length === 0 ? (
              <div className={InboundUI.quiet}>暂无批次。</div>
            ) : (
              <div className="overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-[920px] w-full text-[13px]">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left">批次</th>
                      <th className="px-3 py-2 text-left">生产日期</th>
                      <th className="px-3 py-2 text-left">到期日期</th>
                      <th className="px-3 py-2 text-right">数量（base）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBatches.map((b, idx) => (
                      <tr key={`${b.batch_code}-${idx}`} className="border-t border-slate-200">
                        <td className="px-3 py-2 font-mono text-slate-900">{b.batch_code}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{b.production_date ?? "-"}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{b.expiry_date ?? "-"}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-900">{b.qty_received}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Confirm：caps.can_confirm + explain.confirmable 双护栏 */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-900">确认入库（confirm）</div>
            <div className="text-[12px] text-slate-600">confirm 是唯一库存写入口；confirm 后以 workbench 刷新为准。</div>

            <button
              type="button"
              className={InboundUI.btnPrimary}
              onClick={() => void handleConfirm()}
              disabled={!wb.receipt || confirming || !canConfirm || !explainOk || isConfirmed}
              title={!wb.receipt ? "请先开始收货并录入实收" : !canConfirm || !explainOk ? "当前不可确认（见阻断项）" : undefined}
            >
              {isConfirmed ? "已确认（不可重复修改）" : confirming ? "确认中…" : "确认入库（confirm）"}
            </button>
          </div>
        </>
      )}
    </section>
  );
};
