// src/features/inventory/ledger/components/LedgerTable.tsx
import React, { useMemo, useState } from "react";
import type { LedgerRow } from "../types";
import { labelReasonCanon, labelSubReason } from "./filters/options";

type Props = {
  loading: boolean;
  rows: LedgerRow[];
};

function canonPillClass(reasonCanon: string | null): string {
  const x = (reasonCanon ?? "").toUpperCase();
  if (x === "RECEIPT") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (x === "SHIPMENT") return "bg-rose-50 text-rose-700 border-rose-200";
  if (x === "ADJUSTMENT") return "bg-slate-50 text-slate-700 border-slate-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function subReasonPillClass(subReason: string | null): string {
  const x = (subReason ?? "").toUpperCase();
  if (!x) return "bg-slate-50 text-slate-600 border-slate-200";
  if (x === "PO_RECEIPT" || x === "RETURN_RECEIPT") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (x === "ORDER_SHIP" || x === "INTERNAL_SHIP" || x === "RETURN_TO_VENDOR") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (x === "COUNT_ADJUST") {
    return "bg-slate-50 text-slate-700 border-slate-200";
  }
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function movementLabel(v: string | null): string {
  const x = (v ?? "").toUpperCase();
  if (x === "INBOUND") return "入库";
  if (x === "OUTBOUND") return "出库";
  if (x === "COUNT") return "盘点";
  if (x === "ADJUST") return "调整";
  return v ?? "-";
}

function displayRef(raw: string | null | undefined): { text: string; title: string } {
  const v = (raw ?? "").trim();
  if (!v) return { text: "-", title: "" };
  if (v.includes(":")) {
    const parts = v.split(":").map((x) => x.trim()).filter(Boolean);
    const last = parts[parts.length - 1] || v;
    return { text: last, title: v };
  }
  return { text: v, title: v };
}

async function copyText(text: string): Promise<boolean> {
  const v = (text ?? "").trim();
  if (!v) return false;
  try {
    await navigator.clipboard.writeText(v);
    return true;
  } catch {
    return false;
  }
}

function normText(v: string | null | undefined): string {
  return (v ?? "").trim();
}

export const LedgerTable: React.FC<Props> = ({ loading, rows }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const resetCopiedSoon = () => {
    window.setTimeout(() => setCopiedKey(null), 1200);
  };

  const hasAnyTraceId = useMemo(() => rows.some((r) => Boolean(normText(r.trace_id))), [rows]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-auto">
        <table className={`min-w-[1280px] w-full text-sm ${hasAnyTraceId ? "" : ""}`}>
          <thead className="sticky top-0 bg-slate-50 text-slate-700">
            <tr className="border-b">
              <th className="px-3 py-2 text-left">时间</th>
              <th className="px-3 py-2 text-left">动作类型</th>
              <th className="px-3 py-2 text-left">具体动作</th>
              <th className="px-3 py-2 text-left">关联单据</th>
              <th className="px-3 py-2 text-right">单据行号</th>
              <th className="px-3 py-2 text-left">追溯号</th>
              <th className="px-3 py-2 text-right">仓库</th>
              <th className="px-3 py-2 text-right">商品ID</th>
              <th className="px-3 py-2 text-left">商品名</th>
              <th className="px-3 py-2 text-left">批次</th>
              <th className="px-3 py-2 text-right">变动</th>
              <th className="px-3 py-2 text-right">变动后</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={12}>
                  正在加载台账…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={12}>
                  当前条件下没有台账记录。
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const refView = displayRef(r.ref);
                const prev = idx > 0 ? rows[idx - 1] : null;

                const prevRefView = prev ? displayRef(prev.ref) : null;
                const isSameGroupAsPrev = Boolean(prevRefView && prevRefView.text && prevRefView.text === refView.text);

                const showGroupHeader = !isSameGroupAsPrev;

                const canonText = labelReasonCanon(r.reason_canon ?? "");
                const subText = labelSubReason(r.sub_reason ?? "");

                const prevCanon = prev ? normText(prev.reason_canon) : "";
                const prevSub = prev ? normText(prev.sub_reason) : "";
                const currCanon = normText(r.reason_canon);
                const currSub = normText(r.sub_reason);

                const isSameActionAsPrev = isSameGroupAsPrev && prevCanon === currCanon && prevSub === currSub;

                const prevTrace = prev ? normText(prev.trace_id) : "";
                const currTrace = normText(r.trace_id);
                const isSameTraceAsPrev = isSameGroupAsPrev && currTrace && prevTrace && currTrace === prevTrace;

                const debugTitle = [
                  r.reason ? `reason=${r.reason}` : "",
                  r.reason_canon ? `reason_canon=${r.reason_canon}` : "reason_canon=",
                  r.sub_reason ? `sub_reason=${r.sub_reason}` : "sub_reason=",
                  r.ref ? `ref=${r.ref}` : "ref=",
                  `movement_type=${movementLabel(r.movement_type)}`,
                ]
                  .filter(Boolean)
                  .join(" | ");

                const refCopyKey = `ref:${r.id}`;
                const traceCopyKey = `trace:${r.id}`;

                return (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[12px] text-slate-700">{r.occurred_at}</td>

                    {/* 动作类型：组内重复则弱化 */}
                    <td className="px-3 py-2" title={debugTitle}>
                      {showGroupHeader || !isSameActionAsPrev ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium ${canonPillClass(
                            r.reason_canon ?? null,
                          )}`}
                        >
                          {canonText}
                        </span>
                      ) : (
                        <span className="text-[12px] text-slate-400">↳ 同动作</span>
                      )}
                    </td>

                    {/* 具体动作：组内重复则弱化 */}
                    <td className="px-3 py-2" title={debugTitle}>
                      {showGroupHeader || !isSameActionAsPrev ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium ${subReasonPillClass(
                            r.sub_reason ?? null,
                          )}`}
                        >
                          {subText}
                        </span>
                      ) : (
                        <span className="text-[12px] text-slate-400">↳ 同动作</span>
                      )}
                    </td>

                    {/* 关联单据：同组仅首行展示详情 */}
                    <td className="px-3 py-2 font-mono text-[12px]" title={showGroupHeader ? refView.title : ""}>
                      {showGroupHeader ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[220px]">{refView.text}</span>
                          {refView.title && refView.text !== refView.title ? (
                            <span className="text-[11px] text-slate-400">(已规范化显示)</span>
                          ) : null}
                          {refView.title ? (
                            <button
                              type="button"
                              className="text-[11px] text-slate-500 hover:text-slate-700"
                              onClick={async () => {
                                const ok = await copyText(refView.title);
                                if (ok) {
                                  setCopiedKey(refCopyKey);
                                  resetCopiedSoon();
                                }
                              }}
                              title="复制原始关联单据"
                            >
                              复制
                            </button>
                          ) : null}
                          {copiedKey === refCopyKey ? (
                            <span className="text-[11px] text-emerald-700">已复制</span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="font-sans">↳</span>
                          <span className="font-sans text-[12px]">同单据</span>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2 text-right font-mono">{r.ref_line ?? "-"}</td>

                    {/* 追溯号：同组且相同则弱化，否则正常显示（保留复制） */}
                    <td className="px-3 py-2 font-mono text-[12px]">
                      {isSameTraceAsPrev ? (
                        <span className="text-[12px] text-slate-400">↳ 同追溯号</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[260px]">{r.trace_id ?? "-"}</span>
                          {r.trace_id ? (
                            <button
                              type="button"
                              className="text-[11px] text-slate-500 hover:text-slate-700"
                              onClick={async () => {
                                const ok = await copyText(r.trace_id ?? "");
                                if (ok) {
                                  setCopiedKey(traceCopyKey);
                                  resetCopiedSoon();
                                }
                              }}
                              title="复制追溯号"
                            >
                              复制
                            </button>
                          ) : null}
                          {copiedKey === traceCopyKey ? (
                            <span className="text-[11px] text-emerald-700">已复制</span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2 text-right font-mono">{r.warehouse_id}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.item_id}</td>

                    <td className="px-3 py-2 truncate max-w-[260px]" title={r.item_name ?? ""}>
                      {r.item_name ?? "-"}
                    </td>

                    <td className="px-3 py-2 font-mono text-[12px]">{r.batch_code ?? "-"}</td>

                    <td
                      className={`px-3 py-2 text-right font-mono ${
                        r.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {r.delta}
                    </td>

                    <td className="px-3 py-2 text-right font-mono">{r.after_qty}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
