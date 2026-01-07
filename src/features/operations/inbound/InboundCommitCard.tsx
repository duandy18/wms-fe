// src/features/operations/inbound/InboundCommitCard.tsx
// Cockpit 提交入库卡片（commit → 真正写库存 + 台账）

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "./types";

import { buildTraceQuery, getMismatchLines } from "./commit/commitUtils";
import { MismatchBanner } from "./commit/MismatchBanner";
import { TraceIdField } from "./commit/TraceIdField";
import { MismatchConfirmModal } from "./commit/MismatchConfirmModal";
import { SupplementLink } from "./SupplementLink";
import { hasAnyDate, needsBatch } from "./lines/lineUtils";

type InboundCommitController = InboundCockpitController & {
  traceId: string;
  setTraceId: (v: string) => void;
  commit: () => Promise<boolean>;
  committing?: boolean;
  commitError?: string | null;
};

interface Props {
  c: InboundCommitController;
}

function safeLineName(l: { item_name?: string | null; item_sku?: string | null }) {
  const n = (l.item_name ?? "").trim();
  if (n) return n;
  const sku = (l.item_sku ?? "").trim();
  if (sku) return sku;
  return "未命名商品";
}

export const InboundCommitCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const isCommitted = task?.status === "COMMITTED";
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const mismatchLines = useMemo(() => getMismatchLines(task), [task]);
  const topMismatch = mismatchLines.slice(0, 5);

  const traceQuery = buildTraceQuery(c.traceId);

  const missingBatchLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => needsBatch(l));
  }, [task]);

  const missingDateLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => {
      const scanned = l.scanned_qty ?? 0;
      if (scanned <= 0) return false;
      if (!((l.batch_code ?? "").trim())) return false;
      return !hasAnyDate(l);
    });
  }, [task]);

  const topMissingBatch = useMemo(() => missingBatchLines.slice(0, 5), [missingBatchLines]);
  const topMissingDate = useMemo(() => missingDateLines.slice(0, 5), [missingDateLines]);

  // 硬阻断 1：已有实收但缺批次（最危险）
  const commitBlocked = !isCommitted && missingBatchLines.length > 0;

  // 硬阻断 2：手工收货存在“已输入但未记录”的草稿
  const manualDraftBlocked = !isCommitted && !!c.manualDraft?.dirty;

  const runCommitAndRedirect = async () => {
    const ok = await c.commit();
    if (!ok) return;

    const id = (c.traceId ?? "").trim();
    if (id) {
      navigate(`/trace?trace_id=${encodeURIComponent(id)}`);
    }
  };

  const handleCommitClick = async () => {
    setBlockedMsg(null);

    if (manualDraftBlocked) {
      setBlockedMsg("手工收货存在未落地输入：请先“记录/一键记录本次”或清空输入，再提交入库。");
      return;
    }

    if (commitBlocked) {
      setBlockedMsg("存在“已收但缺批次”的行，请先补录后再提交入库。");
      return;
    }

    if (mismatchLines.length > 0 && !isCommitted) {
      setConfirmOpen(true);
      return;
    }

    await runCommitAndRedirect();
  };

  const handleConfirmCommit = async () => {
    setConfirmOpen(false);
    await runCommitAndRedirect();
  };

  const handleViewTrace = () => {
    if (!traceQuery) return;
    navigate(traceQuery);
  };

  const commitAreaDisabled =
    isCommitted || !!c.committing || commitBlocked || manualDraftBlocked;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">提交入库</h2>
        {c.commitError ? <span className="text-xs text-red-600">{c.commitError}</span> : null}
      </div>

      {!task ? (
        <div className="text-xs text-slate-500">尚未绑定收货任务。请先创建或绑定任务。</div>
      ) : (
        <>
          <div className="space-y-1 text-xs text-slate-700">
            <div>
              当前任务：#{task.id}
              {task.po_id != null ? (
                <span className="ml-1 text-slate-500">（关联采购单 #{task.po_id}）</span>
              ) : null}
            </div>

            <div className="text-slate-600">
              提交入库后，将以当前“实收累计”为最终入库数量写入库存与台账，任务状态将变为“已入库”。
            </div>

            <div className="text-slate-600">
              当前汇总：应收合计{" "}
              <span className="font-mono">{c.varianceSummary.totalExpected}</span>
              ，实收合计{" "}
              <span className="font-mono">{c.varianceSummary.totalScanned}</span>
              ，差异{" "}
              <span
                className={
                  c.varianceSummary.totalVariance === 0
                    ? "text-emerald-700"
                    : c.varianceSummary.totalVariance > 0
                    ? "text-amber-700"
                    : "text-rose-700"
                }
              >
                {c.varianceSummary.totalVariance}
              </span>
              。
            </div>
          </div>

          {/* ✅ 草稿硬阻断提示（比按钮禁用更直观） */}
          {manualDraftBlocked ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 space-y-1">
              <div className="font-semibold">检测到手工收货未落地输入，已阻止提交入库</div>
              <div className="text-[11px] text-rose-800">
                草稿：<span className="font-mono">{c.manualDraft.touchedLines}</span> 行，共{" "}
                <span className="font-mono">{c.manualDraft.totalQty}</span> 件。
                请回到“采购手工收货”点击“一键记录本次”或逐行“记录”，或者清空输入后再提交。
              </div>
            </div>
          ) : null}

          {/* ✅ 补录阻断/提醒：可操作清单 */}
          {commitBlocked ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
              <div className="font-semibold">
                已收但缺批次：已触发硬阻断（必须补录后才能提交入库）
              </div>

              <div className="text-[11px] text-amber-800">
                影响行数：<span className="font-mono">{missingBatchLines.length}</span> 行。
                请到 <SupplementLink source="purchase">收货补录</SupplementLink> 补齐批次/日期。
              </div>

              <ul className="list-disc pl-5 text-[11px] text-amber-800 space-y-1">
                {topMissingBatch.map((l) => (
                  <li key={l.id}>
                    <span className="font-medium">{safeLineName(l)}</span>
                    <span className="ml-2 text-amber-800/80">
                      已收 <span className="font-mono">{l.scanned_qty ?? 0}</span>
                      ，计划{" "}
                      <span className="font-mono">
                        {l.expected_qty != null ? l.expected_qty : "-"}
                      </span>
                      ，批次为空
                    </span>
                  </li>
                ))}
                {missingBatchLines.length > topMissingBatch.length ? (
                  <li className="text-amber-800/80">
                    还有{" "}
                    <span className="font-mono">
                      {missingBatchLines.length - topMissingBatch.length}
                    </span>{" "}
                    行未展示…
                  </li>
                ) : null}
              </ul>

              <div className="flex items-center gap-2">
                <SupplementLink source="purchase">去补录</SupplementLink>
                <span className="text-[11px] text-amber-800/80">
                  （补录完成后回到本页再点“确认入库”）
                </span>
              </div>
            </div>
          ) : missingDateLines.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 space-y-2">
              <div className="font-semibold">提示：已收但日期为空（建议补录）</div>

              <div className="text-[11px] text-slate-700">
                影响行数：<span className="font-mono">{missingDateLines.length}</span> 行。
                若业务要求日期完整，可{" "}
                <SupplementLink source="purchase">去补录</SupplementLink>。
              </div>

              <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-1">
                {topMissingDate.map((l) => (
                  <li key={l.id}>
                    <span className="font-medium">{safeLineName(l)}</span>
                    <span className="ml-2 text-slate-600">
                      已收 <span className="font-mono">{l.scanned_qty ?? 0}</span>
                      ，批次{" "}
                      <span className="font-mono">{(l.batch_code ?? "").trim() || "-"}</span>
                      ，日期为空
                    </span>
                  </li>
                ))}
                {missingDateLines.length > topMissingDate.length ? (
                  <li className="text-slate-600">
                    还有{" "}
                    <span className="font-mono">
                      {missingDateLines.length - topMissingDate.length}
                    </span>{" "}
                    行未展示…
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {blockedMsg ? <div className="text-xs text-red-600">{blockedMsg}</div> : null}

          <MismatchBanner mismatchLines={mismatchLines} topMismatch={topMismatch} />

          <TraceIdField value={c.traceId} onChange={c.setTraceId} />

          <div className={commitAreaDisabled ? "pointer-events-none opacity-60" : ""}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={commitAreaDisabled}
                onClick={() => void handleCommitClick()}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isCommitted ? "已入库" : c.committing ? "提交中…" : "确认入库"}
              </button>

              <button
                type="button"
                disabled={!traceQuery}
                onClick={handleViewTrace}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                查看 Trace
              </button>

              <span className="text-xs text-slate-500 ml-auto">
                {commitBlocked ? (
                  <>
                    需要补录？ <SupplementLink source="purchase">去补录</SupplementLink>
                  </>
                ) : (
                  <>
                    <SupplementLink source="purchase">补录中心</SupplementLink>
                  </>
                )}
              </span>
            </div>
          </div>
        </>
      )}

      <MismatchConfirmModal
        open={confirmOpen && mismatchLines.length > 0}
        mismatchLines={mismatchLines}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleConfirmCommit()}
      />
    </section>
  );
};
