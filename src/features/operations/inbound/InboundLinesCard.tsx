// src/features/operations/inbound/InboundLinesCard.tsx
// 收货任务行明细卡片（Cockpit 视角，大字号仓库版）
// - 展示：商品信息 / 单位 / 应收 / 实收 / 差异 / 批次 / 日期
// - metaMode=edit：行内直接编辑 批次/日期
// - metaMode=hint：只提示缺失状态，不提供编辑入口（用于采购扫码收货 Tab）

import React, { useCallback, useMemo, useState } from "react";
import {
  StandardTable,
  type ColumnDef,
} from "../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../receive-tasks/api";
import type { InboundCockpitController } from "./types";

import { InboundLinesHeader, type ViewFilter } from "./lines/InboundLinesHeader";
import { buildInboundLinesColumns } from "./lines/buildColumns";
import { getErrorMessage, needsBatch } from "./lines/lineUtils";

interface Props {
  c: InboundCockpitController;
  metaMode?: "edit" | "hint";
}

function formatYmd(v: string | null | undefined): string {
  return v && v.trim() ? v : "-";
}

export const InboundLinesCard: React.FC<Props> = ({ c, metaMode = "edit" }) => {
  const task = c.currentTask;
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");

  const [metaError, setMetaError] = useState<string | null>(null);
  const [savingMetaFor, setSavingMetaFor] = useState<number | null>(null); // item_id

  const rows = useMemo(() => {
    if (!task) return [];
    const base = task.lines;

    if (viewFilter === "all") return base;

    if (viewFilter === "mismatch") {
      return base.filter(
        (l) => l.expected_qty != null && l.scanned_qty !== l.expected_qty,
      );
    }

    if (viewFilter === "unreceived") {
      return base.filter(
        (l) =>
          l.expected_qty != null &&
          (l.scanned_qty ?? 0) < (l.expected_qty ?? 0),
      );
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
        setMetaError("任务已入库，不能修改批次/日期。");
        return;
      }

      const trimmedBatch = patch.batch_code?.trim();
      const trimmedProd = patch.production_date?.trim();
      const trimmedExp = patch.expiry_date?.trim();

      const sameBatch =
        trimmedBatch === undefined || trimmedBatch === (line.batch_code ?? "");
      const sameProd =
        trimmedProd === undefined || trimmedProd === (line.production_date ?? "");
      const sameExp =
        trimmedExp === undefined || trimmedExp === (line.expiry_date ?? "");

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

  const readonlyColumns: ColumnDef<ReceiveTaskLine>[] = useMemo(() => {
    return [
      {
        key: "item_name",
        header: "商品",
        render: (l) => l.item_name ?? "-",
      },
      {
        key: "expected_qty",
        header: "应收",
        align: "right",
        render: (l) => (l.expected_qty ?? "-") as any,
      },
      {
        key: "scanned_qty",
        header: "实收",
        align: "right",
        render: (l) => l.scanned_qty as any,
      },
      {
        key: "variance",
        header: "差异",
        align: "right",
        render: (l) => {
          if (l.expected_qty == null) return "-";
          const v = l.scanned_qty - l.expected_qty;
          const cls =
            v === 0
              ? "text-emerald-700"
              : v > 0
              ? "text-amber-700"
              : "text-rose-700";
          return <span className={cls}>{v}</span>;
        },
      },
      {
        key: "batch_code",
        header: "批次",
        render: (l) => (l.batch_code && l.batch_code.trim() ? l.batch_code : "-"),
      },
      {
        key: "production_date",
        header: "生产日期",
        render: (l) => formatYmd(l.production_date),
      },
      {
        key: "expiry_date",
        header: "到期日期",
        render: (l) => formatYmd(l.expiry_date),
      },
      {
        key: "meta_hint",
        header: "提示",
        render: (l) => {
          if (!needsBatch(l)) return <span className="text-slate-500">-</span>;
          return <span className="text-amber-700">需要补录批次/日期</span>;
        },
      },
    ];
  }, []);

  const columns = useMemo(() => {
    // 扫码Tab：只提示，不可编辑
    if (metaMode === "hint") {
      return readonlyColumns;
    }

    // 默认：可编辑
    return buildInboundLinesColumns({
      taskStatus: task?.status ?? null,
      onMetaBlur: (line, patch) => void handleMetaBlur(line, patch),
    });
  }, [metaMode, readonlyColumns, task?.status, handleMetaBlur]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <InboundLinesHeader
        hasTask={!!task}
        onReloadTask={() => void c.reloadTask()}
        viewFilter={viewFilter}
        onChangeViewFilter={setViewFilter}
      />

      {metaMode === "edit" && metaError ? (
        <div className="text-base text-red-600">{metaError}</div>
      ) : null}

      {task && c.taskError ? (
        <div className="text-base text-red-600">{c.taskError}</div>
      ) : null}

      {task ? (
        <>
          <div className="text-lg text-slate-700 mb-2">
            应收合计：<span className="font-mono">{c.varianceSummary.totalExpected}</span>
            ，实收合计：<span className="font-mono">{c.varianceSummary.totalScanned}</span>
            ，差异：
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

      {metaMode === "edit" && savingMetaFor !== null ? (
        <div className="text-base text-slate-500">
          正在保存 item_id={savingMetaFor} 的批次/日期…
        </div>
      ) : null}

      {metaMode === "hint" ? (
        <div className="text-sm text-slate-500">
          扫码收货页仅提示批次/日期缺失，不在此处编辑。
        </div>
      ) : null}
    </section>
  );
};
