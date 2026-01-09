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

export const PurchaseManualTab: React.FC<{ c: InboundCockpitController }> = ({ c }) => {
  const m = useInboundTaskContextModel(c);

  const po = c.currentPo;
  const task = c.currentTask;

  const openingId = m.selectedPoId || c.poIdInput;

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
            <button
              type="button"
              className={InboundUI.btnGhost}
              onClick={() => void m.handleSelectPoId(m.selectedPoId)}
            >
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
      <section className={`${InboundUI.card} ${InboundUI.cardPad}`}>
        <ReceiveTaskContextPanel
          c={c}
          mode="PO"
          po={po}
          task={task}
          showTitle
          titleText="创建收货任务"
        />
      </section>

      <InboundScanCard c={c} />
      <InboundManualReceiveCard c={c} />
      <InboundCommitCard c={c} />
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
