// src/features/operations/inbound/receive-task/ReceiveTaskContextPanel.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import { InboundUI } from "../ui";

import { usePoReceiveVerification } from "./usePoReceiveVerification";
import { usePoReceivePlan } from "./usePoReceivePlan";
import { PoReceivePlanTable } from "./PoReceivePlanTable";

type InboundMode = "PO" | "ORDER";

function taskStatusLabel(raw?: string | null): string {
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return "未知";
  if (s === "DRAFT") return "待提交";
  if (s === "CREATED") return "已创建";
  if (s === "COMMITTED") return "已入库";
  return s;
}

export function ReceiveTaskContextPanel(props: {
  c: InboundCockpitController;
  mode: InboundMode;
  po: InboundCockpitController["currentPo"];
  task: InboundCockpitController["currentTask"];

  showTitle?: boolean;
  titleText?: string;
}) {
  const { c, mode, po, task, showTitle = true, titleText } = props;

  const v = usePoReceiveVerification(po);
  const p = usePoReceivePlan(po);

  const isTaskForCurrentPo =
    mode === "PO" &&
    !!po &&
    !!task &&
    String(task.source_type ?? "").toUpperCase() === "PO" &&
    task.po_id === po.id;

  const selectedLines = React.useMemo(() => {
    const out: { po_line_id: number; qty_planned: number }[] = [];
    for (const id of p.selectedIds) {
      const raw = (p.qtyMap[id] ?? "").trim();
      const qty = Number(raw);
      if (Number.isFinite(qty) && Number.isInteger(qty) && qty > 0) {
        out.push({ po_line_id: id, qty_planned: qty });
      }
    }
    return out;
  }, [p.selectedIds, p.qtyMap]);

  const canCreate =
    mode === "PO" &&
    !!po &&
    !isTaskForCurrentPo &&
    v.verified &&
    selectedLines.length > 0 &&
    p.planValid &&
    !c.creatingTask;

  const actionBtn =
    mode === "PO" ? (
      isTaskForCurrentPo ? (
        <button
          type="button"
          disabled
          className={InboundUI.btnGhost}
          title="当前采购单已创建收货任务"
        >
          已创建任务 #{task?.id}
        </button>
      ) : (
        <button
          type="button"
          disabled={!canCreate}
          onClick={() => void c.createTaskFromPoSelected(selectedLines)}
          className={InboundUI.btnPrimary}
        >
          {c.creatingTask ? "创建中…" : "创建"}
        </button>
      )
    ) : null;

  return (
    <div className={InboundUI.cardGap}>
      <div className="flex items-center justify-between gap-2">
        {showTitle ? (
          <div className={InboundUI.title}>{titleText ?? "收货任务（创建 / 绑定）"}</div>
        ) : (
          <div />
        )}
        <div className="shrink-0">{actionBtn}</div>
      </div>

      {!po && mode === "PO" ? <div className={InboundUI.quiet}>请先选择采购单。</div> : null}

      {isTaskForCurrentPo ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[12px] text-emerald-900">
          <div className="font-medium">
            当前任务：#{task?.id} · {taskStatusLabel(task?.status)} · 行数{" "}
            {task?.lines?.length ?? 0}
          </div>
        </div>
      ) : null}

      {mode === "PO" && po && !isTaskForCurrentPo ? (
        <>
          {/* 验货确认：横排 / 放大 / 明确 */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-900">验货确认</div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-lg font-medium">
                <input
                  type="checkbox"
                  checked={v.checkGoods}
                  onChange={(e) => v.setCheckGoods(e.target.checked)}
                />
                商品已核验
              </label>

              <label className="flex items-center gap-2 text-lg font-medium">
                <input
                  type="checkbox"
                  checked={v.checkSpec}
                  onChange={(e) => v.setCheckSpec(e.target.checked)}
                />
                规格已核验
              </label>

              <label className="flex items-center gap-2 text-lg font-medium">
                <input
                  type="checkbox"
                  checked={v.checkQty}
                  onChange={(e) => v.setCheckQty(e.target.checked)}
                />
                数量已核验
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-slate-900">采购计划未完成清单</div>
              <button
                type="button"
                onClick={p.applyDefault}
                className="text-[12px] text-slate-700 hover:text-slate-900"
              >
                按剩余应收填充
              </button>
            </div>

            <PoReceivePlanTable
              rows={p.rows}
              selected={p.selected}
              qtyMap={p.qtyMap}
              onToggle={p.toggleLine}
              onQtyChange={p.updateQty}
              validate={p.validateQty}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
