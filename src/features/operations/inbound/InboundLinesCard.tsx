// src/features/operations/inbound/InboundLinesCard.tsx
// 收货任务行明细卡片（Cockpit 视角）
// - 展示应收/实收/差异/批次/日期
// - 视图过滤：全部 / 仅有差异 / 仅未收完
// - 高亮最近一次成功扫码的 item 行（activeItemId）
// - 行内批次编辑器：在表格下方编辑选中行的 批次 / 生产日期 / 到期日期

import React, { useMemo, useState } from "react";
import {
  StandardTable,
  type ColumnDef,
} from "../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../receive-tasks/api";
import type { InboundCockpitController } from "./types";

interface Props {
  c: InboundCockpitController;
}

const fmtDate = (v: string | null | undefined) => (v ? v : "-");

type ViewFilter = "all" | "mismatch" | "unreceived";

type ApiErrorShape = {
  message?: string;
};

export const InboundLinesCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");

  // 正在编辑批次信息的行（按 item_id 标识）
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editBatch, setEditBatch] = useState("");
  const [editProd, setEditProd] = useState("");
  const [editExp, setEditExp] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!task) return [];
    const base = task.lines;
    if (viewFilter === "all") return base;

    if (viewFilter === "mismatch") {
      return base.filter(
        (l) =>
          l.expected_qty != null &&
          l.scanned_qty !== l.expected_qty,
      );
    }

    // 未收完：expected 存在，且 scanned < expected
    if (viewFilter === "unreceived") {
      return base.filter(
        (l) =>
          l.expected_qty != null &&
          l.scanned_qty < l.expected_qty,
      );
    }

    return base;
  }, [task, viewFilter]);

  const editingLine: ReceiveTaskLine | null = useMemo(() => {
    if (!task || editingItemId == null) return null;
    return task.lines.find((l) => l.item_id === editingItemId) ?? null;
  }, [task, editingItemId]);

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
      header: "单位",
      render: (l) =>
        l.purchase_uom
          ? `${l.purchase_uom}${
              l.units_per_case ? `(${l.units_per_case}/${l.base_uom || ""})` : ""
            }`
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
      render: (l) => fmtDate(l.production_date),
    },
    {
      key: "expiry_date",
      header: "到期日期",
      render: (l) => fmtDate(l.expiry_date),
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
    {
      key: "actions",
      header: "操作",
      render: (l) => (
        <button
          type="button"
          className="px-2 py-0.5 rounded border border-slate-300 text-[11px] text-slate-700 hover:bg-slate-50"
          onClick={(e) => {
            e.stopPropagation();
            startEditLine(l);
          }}
          disabled={task?.status === "COMMITTED"}
        >
          编辑批次/日期
        </button>
      ),
    },
  ];

  function startEditLine(line: ReceiveTaskLine) {
    setMetaError(null);
    setEditingItemId(line.item_id);
    setEditBatch(line.batch_code ?? "");
    setEditProd(line.production_date ?? "");
    setEditExp(line.expiry_date ?? "");
    c.setActiveItemId(line.item_id);
  }

  function validateEditMeta(line: ReceiveTaskLine | null): string | null {
    if (!line) return "内部错误：缺少行信息";

    const hasScanned = !!line.scanned_qty && line.scanned_qty !== 0;
    const batchTrimmed = editBatch.trim();
    const hasDate = !!editProd || !!editExp;

    // 若行已存在实收数量，则必须有批次 + 至少一个日期
    if (hasScanned) {
      if (!batchTrimmed) {
        return "该行已存在实收数量，必须填写批次编码（batch_code）。";
      }
      if (!hasDate) {
        return "该行已存在实收数量，必须至少填写生产日期或到期日期。";
      }
    }

    // 若两者都填了，检查到期日不得早于生产日
    if (editProd && editExp) {
      const prod = new Date(editProd);
      const exp = new Date(editExp);
      if (!Number.isNaN(prod.getTime()) && !Number.isNaN(exp.getTime())) {
        if (exp < prod) {
          return "到期日期（expiry_date）不能早于生产日期（production_date）。";
        }
      }
    }

    return null;
  }

  async function handleSaveMeta() {
    if (!editingLine || editingItemId == null) return;
    const msg = validateEditMeta(editingLine);
    if (msg) {
      setMetaError(msg);
      return;
    }

    setSavingMeta(true);
    setMetaError(null);
    try {
      await c.updateLineMeta(editingItemId, {
        batch_code: editBatch || undefined,
        production_date: editProd || undefined,
        expiry_date: editExp || undefined,
      });
      setEditingItemId(null);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      setMetaError(e?.message ?? "更新批次信息失败");
    } finally {
      setSavingMeta(false);
    }
  }

  function handleCancelMeta() {
    setEditingItemId(null);
    setMetaError(null);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          收货明细（应收 / 实收 / 差异 / 批次 / 日期）
        </h2>
        <div className="flex items-center gap-2 text-[11px]">
          {task && (
            <button
              type="button"
              onClick={c.reloadTask}
              className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
            >
              刷新任务
            </button>
          )}
          <span className="text-slate-500">视图：</span>
          <button
            type="button"
            className={
              "px-2 py-0.5 rounded border " +
              (viewFilter === "all"
                ? "border-slate-900 text-slate-900"
                : "border-slate-300 text-slate-500")
            }
            onClick={() => setViewFilter("all")}
          >
            全部
          </button>
          <button
            type="button"
            className={
              "px-2 py-0.5 rounded border " +
              (viewFilter === "mismatch"
                ? "border-amber-500 text-amber-700"
                : "border-slate-300 text-slate-500")
            }
            onClick={() => setViewFilter("mismatch")}
          >
            仅有差异
          </button>
          <button
            type="button"
            className={
              "px-2 py-0.5 rounded border " +
              (viewFilter === "unreceived"
                ? "border-sky-500 text-sky-700"
                : "border-slate-300 text-slate-500")
            }
            onClick={() => setViewFilter("unreceived")}
          >
            仅未收完
          </button>
        </div>
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
            data={rows}
            dense
            getRowKey={(l) => l.id}
            rowClassName={(l) =>
              c.activeItemId != null && l.item_id === c.activeItemId
                ? "bg-sky-50 ring-1 ring-sky-300"
                : ""
            }
            onRowClick={(l) => c.setActiveItemId(l.item_id)}
            emptyText="暂无行数据"
            footer={
              <span className="text-xs text-slate-500">
                当前视图共 {rows.length} 行（总行数 {task.lines.length}）
              </span>
            }
          />

          {/* 行内批次编辑区域 */}
          {editingLine && (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  编辑批次 / 日期（item_id={editingLine.item_id}）
                </span>
                <button
                  type="button"
                  className="text-[11px] text-slate-500 hover:underline"
                  onClick={handleCancelMeta}
                >
                  取消编辑
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                规则：任何已存在实收数量的行，必须填写批次编码，并至少提供生产日期或到期日期。
                若同时填写两者，则到期日期不得早于生产日期。
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">
                    批次编码（batch_code）
                  </label>
                  <input
                    className="border rounded-md px-2 py-1 text-xs"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    placeholder="例如 BATCH-202512-01"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">
                    生产日期（production_date）
                  </label>
                  <input
                    type="date"
                    className="border rounded-md px-2 py-1 text-xs"
                    value={editProd}
                    onChange={(e) => setEditProd(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">
                    到期日期（expiry_date）
                  </label>
                  <input
                    type="date"
                    className="border rounded-md px-2 py-1 text-xs"
                    value={editExp}
                    onChange={(e) => setEditExp(e.target.value)}
                  />
                </div>
              </div>
              {metaError && (
                <div className="text-[11px] text-red-600">
                  {metaError}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingMeta}
                  onClick={handleSaveMeta}
                  className="px-3 py-1 rounded-md bg-slate-900 text-white text-[11px] disabled:opacity-60"
                >
                  {savingMeta ? "保存中…" : "保存批次信息"}
                </button>
                <span className="text-[11px] text-slate-500">
                  保存后会更新当前任务中的该商品批次 / 日期信息，不会改变已累计的实收数量。
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-slate-500">
          尚未绑定收货任务。请先在上方上下文卡片中创建或绑定任务。
        </div>
      )}
    </section>
  );
};
