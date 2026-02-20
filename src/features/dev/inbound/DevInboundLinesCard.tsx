// src/features/dev/inbound/DevInboundLinesCard.tsx
// 收货任务行明细（应收 / 实收 / 差异 + 批次信息）

import React from "react";
import {
  StandardTable,
  type ColumnDef,
} from "../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../receive-tasks/api";
import type { DevInboundController } from "./types";

interface Props {
  c: DevInboundController;
}

const fmtDate = (v: string | null | undefined) =>
  v ? v : "-";

export const DevInboundLinesCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;

  const columns: ColumnDef<ReceiveTaskLine>[] = [
    {
      key: "item_id",
      header: "Item ID",
      render: (l) => (
        <span className="font-mono text-[11px]">{l.item_id}</span>
      ),
    },
    {
      key: "item_name",
      header: "商品名",
      render: (l) => l.item_name ?? "-",
    },
    {
      key: "spec",
      header: "规格",
      render: (l) => l.spec_text ?? "-",
    },
    {
      key: "uom",
      header: "最小单位",
      render: (l) =>
        l.purchase_uom
          ? `${l.purchase_uom}${l.units_per_case ? `(${l.units_per_case}/${l.base_uom || ""})` : ""}`
          : l.base_uom || "-",
    },
    {
      key: "batch_code",
      header: "批次",
      render: (l) => l.batch_code ?? "-",
    },
    {
      key: "production_date",
      header: "生产日期",
      render: (l) => fmtDate(l.production_date || null),
    },
    {
      key: "expiry_date",
      header: "到期日期",
      render: (l) => fmtDate(l.expiry_date || null),
    },
    {
      key: "expected_qty",
      header: "应收",
      align: "right",
      render: (l) => l.expected_qty ?? "-",
    },
    {
      key: "scanned_qty",
      header: "实收（累计）",
      align: "right",
      render: (l) => l.scanned_qty,
    },
    {
      key: "variance",
      header: "差异(实收-应收)",
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
      key: "status",
      header: "行状态",
      render: (l) => l.status,
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          收货明细（应收 / 实收 / 差异 / 批次）
        </h2>
        {task && (
          <button
            type="button"
            onClick={c.reloadTask}
            className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            刷新任务
          </button>
        )}
      </div>

      {task ? (
        <>
          <div className="text-xs text-slate-600 mb-1">
            应收合计：{c.varianceSummary.totalExpected}，实收合计：
            {c.varianceSummary.totalScanned}，差异：
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
          </div>
          <StandardTable<ReceiveTaskLine>
            columns={columns}
            data={task.lines}
            dense
            getRowKey={(l) => l.id}
            emptyText="暂无行数据"
            footer={
              <span className="text-xs text-slate-500">
                共 {task.lines.length} 行
              </span>
            }
          />
        </>
      ) : (
        <div className="text-xs text-slate-500">
          尚未绑定收货任务。请先在上方上下文卡片中创建或绑定任务。
        </div>
      )}
    </section>
  );
};
