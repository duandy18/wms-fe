// src/features/operations/inbound/commit/CommitSupplementPanels.tsx

import React from "react";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { SupplementLink } from "../SupplementLink";
import { requiresBatch, requiresDates, safeLineName } from "./commitCardHelpers";

export type SupplementHint =
  | null
  | { kind: "done"; text: string }
  | { kind: "pending"; text: string };

export const CommitSupplementPanels: React.FC<{
  taskId: number | null;

  supplementHint: SupplementHint;

  manualDraftBlocked: boolean;
  manualDraft?: { touchedLines: number; totalQty: number } | null;

  commitBlocked: boolean;
  hardBlockedLines: ReceiveTaskLine[];
  topHardBlocked: ReceiveTaskLine[];

  softSuggestLines: ReceiveTaskLine[];

  blockedMsg: string | null;
  autoRefreshErr: string | null;
}> = ({
  taskId,
  supplementHint,
  manualDraftBlocked,
  manualDraft,
  commitBlocked,
  hardBlockedLines,
  topHardBlocked,
  softSuggestLines,
  blockedMsg,
  autoRefreshErr,
}) => {
  return (
    <>
      {supplementHint ? (
        <div
          className={
            supplementHint.kind === "done"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"
              : "rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
          }
        >
          <div className="font-semibold">
            {supplementHint.kind === "done" ? "补录完成" : "补录仍未完成"}
          </div>
          <div className="text-[11px] opacity-90 mt-1">{supplementHint.text}</div>
        </div>
      ) : null}

      {manualDraftBlocked ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 space-y-1">
          <div className="font-semibold">检测到手工收货未落地输入，已阻止提交入库</div>
          <div className="text-[11px] text-rose-800">
            草稿：<span className="font-mono">{manualDraft?.touchedLines ?? 0}</span> 行，共{" "}
            <span className="font-mono">{manualDraft?.totalQty ?? 0}</span> 件。
          </div>
        </div>
      ) : null}

      {commitBlocked ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
          <div className="font-semibold">入库必需字段缺失：已触发硬阻断</div>

          <div className="text-[11px] text-amber-800">
            影响行数：<span className="font-mono">{hardBlockedLines.length}</span> 行。请到{" "}
            <SupplementLink source="purchase" taskId={taskId}>
              收货补录
            </SupplementLink>{" "}
            补齐必需字段。
          </div>

          <ul className="list-disc pl-5 text-[11px] text-amber-800 space-y-1">
            {topHardBlocked.map((l) => {
              const miss: string[] = [];
              const batch = (l.batch_code ?? "").trim();
              const prod = (l.production_date ?? "").trim();
              if (requiresBatch(l) && !batch) miss.push("批次");
              if (requiresDates(l) && !prod) miss.push("生产日期");

              return (
                <li key={l.id}>
                  <span className="font-medium">{safeLineName(l)}</span>
                  <span className="ml-2 text-amber-800/80">
                    缺 {miss.join(" / ")}，已收 <span className="font-mono">{l.scanned_qty ?? 0}</span>
                  </span>
                </li>
              );
            })}
            {hardBlockedLines.length > topHardBlocked.length ? (
              <li className="text-amber-800/80">
                还有{" "}
                <span className="font-mono">
                  {hardBlockedLines.length - topHardBlocked.length}
                </span>{" "}
                行未展示…
              </li>
            ) : null}
          </ul>

          <div className="flex items-center gap-2">
            <SupplementLink source="purchase" taskId={taskId}>
              去补录
            </SupplementLink>
          </div>
        </div>
      ) : softSuggestLines.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 space-y-2">
          <div className="font-semibold">提示：存在建议补录项（不影响入库）</div>
          <div className="text-[11px] text-slate-700">
            影响行数：<span className="font-mono">{softSuggestLines.length}</span> 行。
            <SupplementLink source="purchase" taskId={taskId}>
              去补录
            </SupplementLink>
          </div>
        </div>
      ) : null}

      {blockedMsg ? <div className="text-xs text-red-600">{blockedMsg}</div> : null}
      {autoRefreshErr ? <div className="text-[11px] text-rose-700">自动刷新失败：{autoRefreshErr}</div> : null}
    </>
  );
};
