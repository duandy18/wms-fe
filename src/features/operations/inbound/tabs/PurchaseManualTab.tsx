// src/features/operations/inbound/tabs/PurchaseManualTab.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import { InboundTabShell } from "./InboundTabShell";

import { useInboundTaskContextModel } from "../purchase-context";

import { PurchaseOrderList } from "../purchase-context";
import { PurchaseOrderDetailReadonly } from "../purchase-context";

import { ReceiveTaskContextPanel } from "../receive-task";
import { InboundScanCard } from "../InboundScanCard";
import { InboundManualReceiveCard } from "../InboundManualReceiveCard";
import { InboundCommitCard } from "../InboundCommitCard";
import { InboundUI } from "../ui";
import { getInboundUiCaps, taskStatusLabel } from "../stateMachine";
import { ReceiveSupplementPanel } from "../ReceiveSupplementPanel";
import { INBOUND_SUPPLEMENT_ANCHOR_ID } from "../SupplementLink";

export const PurchaseManualTab: React.FC<{ c: InboundCockpitController }> = ({ c }) => {
  const m = useInboundTaskContextModel(c);

  const po = c.currentPo;
  const task = c.currentTask;

  const openingId = m.selectedPoId || c.poIdInput;

  const caps = getInboundUiCaps({
    currentTask: c.currentTask,
    committing: c.committing,
    manualDraft: c.manualDraft,
    varianceSummary: c.varianceSummary,
  });

  const left = (
    <div className="space-y-4">
      <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-3`}>
        <div className="text-base font-semibold text-slate-900">需要收货的采购单</div>

        {c.loadingPo ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[13px] text-sky-800">
            正在打开采购单{openingId ? ` #${openingId}` : ""}…
          </div>
        ) : c.poError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 flex items-center justify-between gap-2">
            <div className="truncate">打开采购单失败：{c.poError}</div>
            <button
              type="button"
              className={InboundUI.btnGhost}
              onClick={() => {
                if (m.selectedPoId) void m.handleSelectPoId(m.selectedPoId);
              }}
              disabled={!m.selectedPoId}
            >
              重试
            </button>
          </div>
        ) : m.selectedPoId && !po ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 flex items-center justify-between gap-2">
            <div className="truncate">已选择采购单 #{m.selectedPoId}，但详情尚未加载。</div>
            <button type="button" className={InboundUI.btnGhost} onClick={() => void m.handleSelectPoId(m.selectedPoId)}>
              重新打开
            </button>
          </div>
        ) : null}

        <PurchaseOrderList
          poOptions={m.poOptions}
          loading={m.loadingPoOptions}
          error={m.poOptionsError}
          selectedPoId={m.selectedPoId}
          onSelectPoId={m.handleSelectPoId}
        />
      </section>

      <PurchaseOrderDetailReadonly po={po} />
    </div>
  );

  const right = (
    <div className="space-y-4">
      {/* ✅ 状态显性化 */}
      <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-2`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-base font-semibold text-slate-900">作业状态</div>
            <div className="text-sm text-slate-600">
              {task ? (
                <>
                  当前任务 <span className="font-mono">#{task.id}</span> · {taskStatusLabel(task)}
                  {po ? <span className="ml-2 text-slate-500">（关联采购单 #{po.id}）</span> : null}
                </>
              ) : (
                <span className="text-slate-500">尚未绑定收货任务</span>
              )}
            </div>
          </div>

          <div
            className={[
              "shrink-0 rounded-full px-3 py-1 text-[12px] font-medium",
              caps.isCommitted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-50 text-slate-700 border border-slate-200",
            ].join(" ")}
            title={caps.status}
          >
            {caps.isCommitted ? "已入库" : task ? "进行中" : "未开始"}
          </div>
        </div>

        {caps.blockedReason ? <div className="text-[13px] text-slate-600">提示：{caps.blockedReason}</div> : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-slate-600">
          <div>
            实收合计 <span className="font-mono text-slate-900">{c.varianceSummary.totalScanned}</span>
          </div>
          <div>
            应收合计 <span className="font-mono text-slate-900">{c.varianceSummary.totalExpected}</span>
          </div>
          <div>
            差异合计 <span className="font-mono text-slate-900">{c.varianceSummary.totalVariance}</span>
          </div>
        </div>
      </section>

      {/* ① 创建/绑定任务 */}
      <section className={`${InboundUI.card} ${InboundUI.cardPad}`}>
        <ReceiveTaskContextPanel c={c} mode="PO" po={po} task={task} showTitle titleText="创建收货任务" />
      </section>

      {/* ② 收货执行区 */}
      <InboundScanCard c={c} />
      <InboundManualReceiveCard c={c} />

      {/* ③ ✅ 补录常驻区（不再抽屉/不再单独页） */}
      <section id={INBOUND_SUPPLEMENT_ANCHOR_ID} className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className={InboundUI.title}>收货补录</h2>
            <div className={InboundUI.subtitle}>在此处补齐批次 / 生产日期 / 到期日期（仅影响本次收货任务）。</div>
          </div>
          {task ? <div className="text-[11px] text-slate-500">本次任务 #{task.id}</div> : null}
        </div>

        <ReceiveSupplementPanel initialSourceType="PURCHASE" taskId={task?.id ?? null} showTitle={false} compact={true} />
      </section>

      {/* ④ 提交区 */}
      <InboundCommitCard c={c} />
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
