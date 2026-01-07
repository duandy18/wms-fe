// src/features/operations/inbound/InboundLinesCard.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StandardTable } from "../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../receive-tasks/api";
import type { InboundCockpitController } from "./types";

import { InboundLinesHeader, type ViewFilter } from "./lines/InboundLinesHeader";
import { buildInboundLinesColumns } from "./lines/buildColumns";
import { getErrorMessage, needsBatch } from "./lines/lineUtils";

interface Props {
  c: InboundCockpitController;
  metaMode?: "edit" | "hint";
}

function taskStatusLabel(raw?: string | null): string {
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return "未知";
  if (s === "DRAFT") return "待提交";
  if (s === "CREATED") return "已创建";
  if (s === "COMMITTED") return "已入库";
  return s;
}

export const InboundLinesCard: React.FC<Props> = ({ c, metaMode = "edit" }) => {
  const task = c.currentTask;
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");

  const [metaError, setMetaError] = useState<string | null>(null);
  const [savingMetaFor, setSavingMetaFor] = useState<number | null>(null);

  // ✅ “收货明细”默认收起：执行态优先操作，不让差异噪音抢注意力
  // - 任务已入库：默认展开（更像“结果/对账视图”）
  // - 其他状态：默认收起（更像“二级视图”）
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!task) {
      setOpen(false);
      return;
    }
    const st = String(task.status ?? "").toUpperCase();
    setOpen(st === "COMMITTED");
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ 任务切换后自动聚焦到一行（默认选 expected_qty 最大的行）
  useEffect(() => {
    if (!task || !task.lines || task.lines.length === 0) return;

    // 若已经有人手动选过，就不抢焦点
    if (c.activeItemId != null) return;

    const pick = [...task.lines].sort((a, b) => {
      const ea = a.expected_qty ?? 0;
      const eb = b.expected_qty ?? 0;
      return eb - ea;
    })[0];

    if (pick?.item_id != null) {
      c.setActiveItemId(pick.item_id);
    }
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows: ReceiveTaskLine[] = useMemo(() => {
    if (!task) return [];
    const base = task.lines;

    if (viewFilter === "all") return base;

    if (viewFilter === "mismatch") {
      return base.filter((l) => l.expected_qty != null && l.scanned_qty !== l.expected_qty);
    }

    if (viewFilter === "unreceived") {
      return base.filter(
        (l) => l.expected_qty != null && (l.scanned_qty ?? 0) < (l.expected_qty ?? 0),
      );
    }

    return base;
  }, [task, viewFilter]);

  const handleMetaBlur = useCallback(
    async (
      line: ReceiveTaskLine,
      patch: {
        batch_code?: string;
        production_date?: string;
        expiry_date?: string;
      },
    ) => {
      if (!task) return;

      if (task.status === "COMMITTED") {
        setMetaError("任务已入库，不能修改批次/日期。");
        return;
      }

      const trimmedBatch = patch.batch_code?.trim();
      const trimmedProd = patch.production_date?.trim();
      const trimmedExp = patch.expiry_date?.trim();

      const sameBatch = trimmedBatch === undefined || trimmedBatch === (line.batch_code ?? "");
      const sameProd = trimmedProd === undefined || trimmedProd === (line.production_date ?? "");
      const sameExp = trimmedExp === undefined || trimmedExp === (line.expiry_date ?? "");

      if (sameBatch && sameProd && sameExp) return;

      setMetaError(null);
      setSavingMetaFor(line.item_id);

      try {
        await c.updateLineMeta(line.item_id, {
          batch_code: trimmedBatch !== undefined ? trimmedBatch || undefined : undefined,
          production_date: trimmedProd !== undefined ? trimmedProd || undefined : undefined,
          expiry_date: trimmedExp !== undefined ? trimmedExp || undefined : undefined,
        });
      } catch (err: unknown) {
        console.error("updateLineMeta failed", err);
        setMetaError(getErrorMessage(err, "更新批次/日期失败"));
      } finally {
        setSavingMetaFor(null);
      }
    },
    [c, task],
  );

  const columns = useMemo(
    () =>
      buildInboundLinesColumns({
        taskStatus: task?.status ?? null,
        metaMode,
        onMetaBlur: (line, patch) => void handleMetaBlur(line, patch),
      }),
    [task?.status, metaMode, handleMetaBlur],
  );

  const statusText = task ? taskStatusLabel(task.status) : "-";

  const summaryText = task
    ? `应收 ${c.varianceSummary.totalExpected}，实收 ${c.varianceSummary.totalScanned}，差异 ${c.varianceSummary.totalVariance}`
    : "";

  const varianceCls =
    c.varianceSummary.totalVariance === 0
      ? "text-emerald-700"
      : c.varianceSummary.totalVariance > 0
      ? "text-amber-700"
      : "text-rose-700";

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">收货明细</div>
          {task ? (
            <div className="text-[12px] text-slate-600">
              任务 #{task.id} · {statusText} · {summaryText.replace("差异", "差异")}{" "}
              <span className={`font-mono ${varianceCls}`}>{c.varianceSummary.totalVariance}</span>
            </div>
          ) : (
            <div className="text-[12px] text-slate-600">尚未绑定收货任务。</div>
          )}
          {task && String(task.status ?? "").toUpperCase() !== "COMMITTED" ? (
            <div className="text-[11px] text-slate-500">
              提示：执行收货时建议先在下方“手工收货”完成录入；此处明细默认收起，避免差异信息干扰操作。
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {task ? (
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "收起明细" : "查看明细"}
            </button>
          ) : null}
        </div>
      </div>

      {/* 收起状态：不展示表格，只留汇总与按钮 */}
      {!open ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-700">
          {task ? (
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-600">当前汇总：</span>
                <span className="font-mono">{c.varianceSummary.totalExpected}</span>
                <span className="text-slate-600"> / </span>
                <span className="font-mono">{c.varianceSummary.totalScanned}</span>
                <span className="text-slate-600">，差异：</span>
                <span className={`font-mono ${varianceCls}`}>
                  {c.varianceSummary.totalVariance}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                行数 {task.lines?.length ?? 0}
              </div>
            </div>
          ) : (
            <div className="text-base text-slate-600">
              尚未绑定收货任务。请先在上方上下文卡片中创建或绑定任务。
            </div>
          )}
        </div>
      ) : null}

      {/* 展开状态：保留你现有的全部能力 */}
      {open && (
        <>
          <InboundLinesHeader
            hasTask={!!task}
            onReloadTask={() => void c.reloadTask()}
            viewFilter={viewFilter}
            onChangeViewFilter={setViewFilter}
          />

          {metaError && <div className="text-base text-red-600">{metaError}</div>}
          {task && c.taskError && <div className="text-base text-red-600">{c.taskError}</div>}

          {task ? (
            <StandardTable<ReceiveTaskLine>
              columns={columns}
              data={rows}
              getRowKey={(l) => l.id}
              rowClassName={(l: ReceiveTaskLine) => {
                const cls: string[] = ["text-base", "py-3"];
                if (needsBatch(l)) cls.push("bg-amber-50");
                if (c.activeItemId != null && l.item_id === c.activeItemId) {
                  cls.push("ring-2 ring-sky-300");
                }
                return cls.join(" ");
              }}
              onRowClick={(l: ReceiveTaskLine) => c.setActiveItemId(l.item_id)}
              emptyText="暂无行数据"
              footer={
                <span className="text-base text-slate-600">
                  当前视图共 {rows.length} 行（总行数 {task.lines.length}）
                </span>
              }
            />
          ) : (
            <div className="text-base text-slate-600">
              尚未绑定收货任务。请先在上方上下文卡片中创建或绑定任务。
            </div>
          )}

          {savingMetaFor !== null && (
            <div className="text-base text-slate-500">正在保存该行的批次/日期…</div>
          )}
        </>
      )}
    </section>
  );
};
