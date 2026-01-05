// src/features/operations/inbound/InboundLinesCard.tsx
// 收货任务行明细卡片（Cockpit 视角，大字号仓库版）
// - 展示：商品信息 / 单位 / 应收 / 实收 / 差异 / 批次 / 日期
// - 行内直接编辑：批次 / 生产日期 / 到期日期（不再藏在按钮里）
// - 视图过滤：全部 / 仅有差异 / 仅未收完
// - 高亮：
//    * 最近一次操作的 item（activeItemId）
//    * 有实收数量但缺批次（淡黄色提示 + 文案）
//
// 重要说明（与后端规则对齐）：
// - “有保质期商品”：后端 commit 会强制要求 batch_code + (production_date/expiry_date 至少一项)
// - “无保质期商品”：后端允许日期为空，且 batch_code 为空时会自动使用 NOEXP
//
// 因此：前端不再用“缺日期”强行阻塞流程，而是做提示；最终校验以服务端为准。

import React, { useCallback, useMemo, useState } from "react";
import { StandardTable } from "../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../receive-tasks/api";
import type { InboundCockpitController } from "./types";

import { InboundLinesHeader, type ViewFilter } from "./lines/InboundLinesHeader";
import { buildInboundLinesColumns } from "./lines/buildColumns";
import { getErrorMessage, needsBatch } from "./lines/lineUtils";

interface Props {
  c: InboundCockpitController;
}

export const InboundLinesCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");

  const [metaError, setMetaError] = useState<string | null>(null);
  const [savingMetaFor, setSavingMetaFor] = useState<number | null>(null); // item_id

  const rows = useMemo(() => {
    if (!task) return [];
    const base = task.lines;

    if (viewFilter === "all") return base;

    if (viewFilter === "mismatch") {
      return base.filter((l) => l.expected_qty != null && l.scanned_qty !== l.expected_qty);
    }

    if (viewFilter === "unreceived") {
      return base.filter((l) => l.expected_qty != null && (l.scanned_qty ?? 0) < (l.expected_qty ?? 0));
    }

    return base;
  }, [task, viewFilter]);

  const handleMetaBlur = useCallback(
    async (
      line: ReceiveTaskLine,
      patch: { batch_code?: string; production_date?: string; expiry_date?: string },
    ) => {
      if (!task) return;

      if (task.status === "COMMITTED") {
        setMetaError("任务已 COMMITTED，不能修改批次/日期。");
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
        onMetaBlur: (line, patch) => void handleMetaBlur(line, patch),
      }),
    [task?.status, handleMetaBlur],
  );

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <InboundLinesHeader
        hasTask={!!task}
        onReloadTask={() => void c.reloadTask()}
        viewFilter={viewFilter}
        onChangeViewFilter={setViewFilter}
      />

      {metaError && <div className="text-base text-red-600">{metaError}</div>}
      {task && c.taskError && <div className="text-base text-red-600">{c.taskError}</div>}

      {task ? (
        <>
          <div className="text-lg text-slate-700 mb-2">
            应收合计：<span className="font-mono">{c.varianceSummary.totalExpected}</span>，实收合计：
            <span className="font-mono">{c.varianceSummary.totalScanned}</span>，差异：
            <span
              className={
                c.varianceSummary.totalVariance === 0
                  ? "font-mono text-emerald-700"
                  : c.varianceSummary.totalVariance > 0
                  ? "font-mono text-amber-700"
                  : "font-mono text-rose-700"
              }
            >
              {c.varianceSummary.totalVariance}
            </span>
            。
          </div>

          <StandardTable<ReceiveTaskLine>
            columns={columns}
            data={rows}
            getRowKey={(l) => l.id}
            rowClassName={(l) => {
              const cls: string[] = ["text-base", "py-3"];
              if (needsBatch(l)) cls.push("bg-amber-50");
              if (c.activeItemId != null && l.item_id === c.activeItemId) {
                cls.push("ring-2 ring-sky-300");
              }
              return cls.join(" ");
            }}
            onRowClick={(l) => c.setActiveItemId(l.item_id)}
            emptyText="暂无行数据"
            footer={
              <span className="text-base text-slate-600">
                当前视图共 {rows.length} 行（总行数 {task.lines.length}）
              </span>
            }
          />
        </>
      ) : (
        <div className="text-base text-slate-600">
          尚未绑定收货任务。请先在上方上下文卡片中创建或绑定任务。
        </div>
      )}

      {savingMetaFor !== null && (
        <div className="text-base text-slate-500">
          正在保存 item_id={savingMetaFor} 的批次/日期…
        </div>
      )}
    </section>
  );
};
