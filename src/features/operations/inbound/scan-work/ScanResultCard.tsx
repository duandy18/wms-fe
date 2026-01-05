// src/features/operations/inbound/scan-work/ScanResultCard.tsx

import React, { useMemo } from "react";
import type { InboundCockpitController } from "../types";
import type { StatusLevel } from "../scan/types";
import { StatusPill } from "../scan/StatusPill";
import { needsBatch } from "../lines/lineUtils";
import { SupplementLink } from "../SupplementLink";

function levelText(level: StatusLevel): string {
  if (level === "ok") return "成功";
  if (level === "warn") return "提醒";
  if (level === "error") return "失败";
  return "等待扫码";
}

export const ScanResultCard: React.FC<{
  c: InboundCockpitController;
  loading: boolean;
  probeError: string | null;
  statusLevel: StatusLevel;
  statusMsg: string | null;
}> = ({ c, loading, probeError, statusLevel, statusMsg }) => {
  const task = c.currentTask;

  const last = useMemo(() => {
    const parsed = c.lastParsed;
    if (!task || !parsed?.item_id) return null;
    const line = task.lines.find((l) => l.item_id === parsed.item_id) ?? null;
    return { parsed, line };
  }, [c.lastParsed, task]);

  const needsSupplement = useMemo(() => {
    return !!last?.line && needsBatch(last.line);
  }, [last?.line]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">本次结果</h2>
        <span className="text-[11px] text-slate-500">{levelText(statusLevel)}</span>
      </div>

      <div className="text-[11px] space-y-1">
        {loading ? <div className="text-slate-500">解析中…</div> : null}
        {probeError ? <div className="text-red-600">{probeError}</div> : null}
        {statusMsg ? <div className="text-slate-700">{statusMsg}</div> : null}
        <div>
          <StatusPill statusLevel={statusLevel} statusMsg={null} />
        </div>
      </div>

      {last?.line ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
          <div className="font-medium text-slate-800">
            {last.line.item_name ?? "（未命名商品）"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500">本次累加：</span>
              <span className="font-mono">{last.parsed.qty ?? 1}</span>
            </div>
            <div>
              <span className="text-slate-500">当前实收：</span>
              <span className="font-mono">{last.line.scanned_qty}</span>
            </div>
            <div>
              <span className="text-slate-500">应收：</span>
              <span className="font-mono">{last.line.expected_qty ?? "-"}</span>
            </div>
          </div>

          {needsSupplement ? (
            <div className="text-amber-700">
              提示：该行需要补录批次/日期（扫码页不编辑）。
              <span className="ml-2">
                <SupplementLink source="purchase">去补录</SupplementLink>
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-slate-500">
          暂无可展示的行结果（请先扫码，且需要已绑定收货任务）。
        </div>
      )}
    </section>
  );
};
