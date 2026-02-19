// src/features/operations/inbound/tabs/PurchaseManualTab.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import { InboundTabShell } from "./InboundTabShell";

import { useInboundTaskContextModel } from "../purchase-context";

import { PurchaseOrderList } from "../purchase-context";
import { PurchaseOrderDetailReadonly } from "../purchase-context";

import { InboundUI } from "../ui";
import { ReceiptWorkbench } from "../receipts/ReceiptWorkbench";

export const PurchaseManualTab: React.FC<{ c: InboundCockpitController }> = ({ c }) => {
  const m = useInboundTaskContextModel(c);

  const po = c.currentPo;
  const openingId = m.selectedPoId || c.poIdInput;

  // ===== 左侧：只做“选择” =====
  const left = (
    <div className="space-y-4">
      <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-3`}>
        <div className="text-base font-semibold text-slate-900">采购单列表</div>

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

      <div className={InboundUI.quiet}>右侧查看采购单详情，并围绕 Receipt 草稿完成解释与确认。</div>
    </div>
  );

  // ===== 右侧：PO 锚点（只读） + Receipt 工作台 =====
  const right = (
    <div className="space-y-4">
      {/* ① PO 详情（合同锚点，只读） */}
      <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-base font-semibold text-slate-900">采购单详情（只读锚点）</div>
            <div className="text-sm text-slate-600">{po ? <>采购单 #{po.id}</> : <span className="text-slate-500">尚未选择</span>}</div>
          </div>
          <div className="shrink-0 rounded-full px-3 py-1 text-[12px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
            {po ? "已选择" : "未选择"}
          </div>
        </div>

        <div className="pt-2">
          <PurchaseOrderDetailReadonly po={po} />
        </div>
      </section>

      {/* ② Receipt 工作台（唯一主对象） */}
      <ReceiptWorkbench po={po} />
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
