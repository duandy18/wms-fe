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

type ViewFilter = "all" | "mismatch" | "unreceived";

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

/**
 * 对某一行判断：是否“有实收数量但缺批次”
 *
 * 说明：
 * - 缺批次会导致有保质期商品必然无法 commit；
 * - 无保质期商品后端会自动补 NOEXP，但前端仍建议尽量明确（或至少留空让系统自动补）。
 */
function needsBatch(line: ReceiveTaskLine): boolean {
  if (!line.scanned_qty || line.scanned_qty === 0) return false;
  const noBatch = !line.batch_code || !line.batch_code.trim();
  return noBatch;
}

function hasAnyDate(line: ReceiveTaskLine): boolean {
  return !!(line.production_date || line.expiry_date);
}

/**
 * 把单位体系翻译成人话：
 * - 有 purchase_uom + base_uom + units_per_case: "件(12/袋)"
 * - 有 purchase_uom 但没有 base_uom/units: 直接显示 purchase_uom
 * - 否则退回 base_uom 或 "-"
 */
function formatUnitExpr(line: ReceiveTaskLine): string {
  const p = line.purchase_uom?.trim() || "";
  const b = line.base_uom?.trim() || "";
  const n = line.units_per_case ?? null;

  if (p && b && n && n > 0) {
    return `${p}(${n}/${b})`;
  }
  if (p) return p;
  if (b) return b;
  return "-";
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
      return base.filter(
        (l) => l.expected_qty != null && l.scanned_qty !== l.expected_qty,
      );
    }

    // 未收完：expected 存在，且 scanned < expected
    if (viewFilter === "unreceived") {
      return base.filter(
        (l) => l.expected_qty != null && l.scanned_qty < l.expected_qty,
      );
    }

    return base;
  }, [task, viewFilter]);

  async function handleMetaBlur(
    line: ReceiveTaskLine,
    patch: {
      batch_code?: string;
      production_date?: string;
      expiry_date?: string;
    },
  ) {
    if (!task) return;
    if (task.status === "COMMITTED") {
      setMetaError("任务已 COMMITTED，不能修改批次/日期。");
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
  }

  const columns: ColumnDef<ReceiveTaskLine>[] = [
    {
      key: "item",
      header: "商品",
      render: (l) => (
        <div className="flex flex-col py-1">
          <span className="text-lg font-semibold text-slate-900">
            {l.item_name ?? "(未命名商品)"}
          </span>
          <span className="text-base text-slate-500">{l.spec_text ?? "-"}</span>
        </div>
      ),
    },
    {
      key: "ids",
      header: "ID / SKU",
      render: (l) => (
        <div className="flex flex-col py-1 text-sm text-slate-600">
          <span className="font-mono">Item: {l.item_id}</span>
          {l.item_sku && <span className="font-mono">SKU: {l.item_sku}</span>}
        </div>
      ),
    },
    {
      key: "uom",
      header: "单位",
      render: (l) => (
        <span className="text-base text-slate-800">{formatUnitExpr(l)}</span>
      ),
    },
    {
      key: "batch",
      header: "批次",
      render: (l) => {
        const disabled = task?.status === "COMMITTED";
        return (
          <input
            className="w-40 rounded-lg border border-slate-300 px-4 py-2 text-base font-mono"
            defaultValue={l.batch_code ?? ""}
            disabled={disabled}
            placeholder='批次编码（无保质期可留空，系统将用 "NOEXP"）'
            onBlur={(e) => void handleMetaBlur(l, { batch_code: e.target.value })}
          />
        );
      },
    },
    {
      key: "production_date",
      header: "生产日期",
      render: (l) => {
        const disabled = task?.status === "COMMITTED";
        return (
          <input
            type="date"
            className="w-44 rounded-lg border border-slate-300 px-4 py-2 text-base"
            defaultValue={l.production_date ?? ""}
            disabled={disabled}
            onBlur={(e) =>
              void handleMetaBlur(l, { production_date: e.target.value })
            }
          />
        );
      },
    },
    {
      key: "expiry_date",
      header: "到期日期",
      render: (l) => {
        const disabled = task?.status === "COMMITTED";
        return (
          <input
            type="date"
            className="w-44 rounded-lg border border-slate-300 px-4 py-2 text-base"
            defaultValue={l.expiry_date ?? ""}
            disabled={disabled}
            onBlur={(e) => void handleMetaBlur(l, { expiry_date: e.target.value })}
          />
        );
      },
    },
    {
      key: "expected_qty",
      header: "应收",
      align: "right",
      render: (l) => (
        <span className="font-mono text-lg">{l.expected_qty ?? "-"}</span>
      ),
    },
    {
      key: "scanned_qty",
      header: "实收（累计）",
      align: "right",
      render: (l) => <span className="font-mono text-lg">{l.scanned_qty}</span>,
    },
    {
      key: "variance",
      header: "差异(实收-应收)",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const v = l.scanned_qty - l.expected_qty;
        const cls =
          v === 0 ? "text-emerald-700" : v > 0 ? "text-amber-700" : "text-rose-700";
        return <span className={`font-mono text-lg ${cls}`}>{v}</span>;
      },
    },
    {
      key: "status",
      header: "行状态",
      render: (l) => <span className="text-base text-slate-800">{l.status}</span>,
    },
    {
      key: "hint",
      header: "提示",
      render: (l) => {
        if (needsBatch(l)) {
          return (
            <span className="text-base text-amber-700">
              已有实收数量，但批次为空。若为无保质期商品可留空（系统将用 NOEXP）；
              若为有保质期商品必须填写真实批次。
            </span>
          );
        }
        if (l.scanned_qty && l.scanned_qty !== 0) {
          if (hasAnyDate(l)) {
            return (
              <span className="text-base text-emerald-700">
                批次已填，日期已填（或部分已填）。
              </span>
            );
          }
          return (
            <span className="text-base text-slate-600">
              批次已填，日期为空：无保质期商品无需日期；有保质期商品提交时会要求至少填一项日期。
            </span>
          );
        }
        return (
          <span className="text-base text-slate-400">尚未实收，无需填写批次/日期。</span>
        );
      },
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            收货明细（商品 / 单位 / 批次 / 日期 / 差异）
          </h2>
          <div className="mt-1 text-base text-slate-600">
            提示：有保质期商品提交时会强制要求批次 +（生产/到期日期至少一项）；
            无保质期商品允许日期为空，批次可留空（系统将自动使用 NOEXP）。
          </div>
        </div>

        <div className="flex items-center gap-3 text-base">
          {task && (
            <button
              type="button"
              onClick={c.reloadTask}
              className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-800 hover:bg-slate-50"
            >
              刷新任务
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-600">视图：</span>
            <button
              type="button"
              className={
                "px-3 py-1.5 rounded-full border text-base " +
                (viewFilter === "all"
                  ? "border-slate-900 text-slate-900"
                  : "border-slate-300 text-slate-600")
              }
              onClick={() => setViewFilter("all")}
            >
              全部
            </button>
            <button
              type="button"
              className={
                "px-3 py-1.5 rounded-full border text-base " +
                (viewFilter === "mismatch"
                  ? "border-amber-500 text-amber-700"
                  : "border-slate-300 text-slate-600")
              }
              onClick={() => setViewFilter("mismatch")}
            >
              仅有差异
            </button>
            <button
              type="button"
              className={
                "px-3 py-1.5 rounded-full border text-base " +
                (viewFilter === "unreceived"
                  ? "border-sky-500 text-sky-700"
                  : "border-slate-300 text-slate-600")
              }
              onClick={() => setViewFilter("unreceived")}
            >
              仅未收完
            </button>
          </div>
        </div>
      </div>

      {metaError && <div className="text-base text-red-600">{metaError}</div>}
      {task && c.taskError && <div className="text-base text-red-600">{c.taskError}</div>}

      {task ? (
        <>
          <div className="text-lg text-slate-700 mb-2">
            应收合计：
            <span className="font-mono">{c.varianceSummary.totalExpected}</span>，实收合计：
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
