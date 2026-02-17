// src/features/operations/inbound/InboundManualReceiveCard.tsx

import React, { useMemo, useState } from "react";
import type { InboundCockpitController } from "./types";
import { useInboundManualReceiveModel } from "./manual/useInboundManualReceiveModel";
import { ManualReceiveTable } from "./manual/ManualReceiveTable";
import { InboundUI } from "./ui";
import { getInboundUiCaps } from "./stateMachine";

interface Props {
  c: InboundCockpitController;
}

export const InboundManualReceiveCard: React.FC<Props> = ({ c }) => {
  const m = useInboundManualReceiveModel(c);
  const [editing, setEditing] = useState<boolean>(false);

  const caps = getInboundUiCaps({
    currentTask: c.currentTask,
    committing: c.committing,
    manualDraft: c.manualDraft,
    varianceSummary: c.varianceSummary,
  });

  const activeLine = useMemo(() => {
    if (c.activeItemId == null) return null;
    return (m.lines || []).find((x) => x.item_id === c.activeItemId) ?? null;
  }, [c.activeItemId, m.lines]);

  if (!m.task) {
    return (
      <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-2`}>
        <h2 className={InboundUI.title}>采购预收货</h2>
        <div className={InboundUI.subtitle}>尚未绑定收货任务。请先选择采购单并创建收货任务。</div>
      </section>
    );
  }

  // ✅ Phase 3：终态/提交中统一禁用（不靠“编辑开关”）
  const allowOperate = caps.canManualReceive;

  // 仅当允许操作时，才允许进入编辑态；否则强制退出编辑态
  if (!allowOperate && editing) {
    // 避免在 render 里 setState 的副作用：保持 UI 不进入编辑即可
    //（这里不调用 setEditing(false)，只通过禁用/遮罩防止继续操作）
  }

  const batchDisabled =
    !editing || !allowOperate || m.savingAll || m.savingItemId != null || m.preview.touchedLines === 0;

  const editBtnDisabled = !allowOperate || m.savingAll || m.savingItemId != null;

  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className={InboundUI.title}>采购预收货</h2>

          {activeLine ? (
            <div className="mt-1 text-[12px] text-sky-700">
              当前定位：
              <span className="font-medium ml-1">{activeLine.item_name ?? "未命名商品"}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <button
              type="button"
              className={InboundUI.btnGhost}
              onClick={() => setEditing(false)}
              disabled={editBtnDisabled}
            >
              取消
            </button>
          ) : (
            <button
              type="button"
              className={InboundUI.btnGhost}
              onClick={() => setEditing(true)}
              disabled={editBtnDisabled}
              title={!allowOperate ? caps.blockedReason ?? "当前状态不允许录入" : undefined}
            >
              编辑
            </button>
          )}
        </div>
      </div>

      {!allowOperate ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
          录入已禁用：{caps.blockedReason ?? "当前状态不允许录入"}
        </div>
      ) : null}

      {m.error && <div className={InboundUI.danger}>{m.error}</div>}

      <div className={editing && allowOperate ? "" : "pointer-events-none opacity-70"}>
        <ManualReceiveTable
          lines={m.lines}
          qtyInputs={m.qtyInputs}
          savingItemId={m.savingItemId}
          savingAll={m.savingAll}
          activeItemId={c.activeItemId}
          hardMissingByItemId={m.hardMissingByItemId}
          softMissingByItemId={m.softMissingByItemId}
          onQtyChange={m.handleQtyChange}
          onReceive={(line) => void m.handleReceive(line)}
          onRowClick={(line) => c.setActiveItemId(line.item_id)}
        />
      </div>

      {editing && allowOperate && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[12px] text-slate-700">
            本次将记录 <span className="font-mono">{m.preview.touchedLines}</span> 行，共{" "}
            <span className="font-mono">{m.preview.totalQty}</span> 件
          </div>

          <button
            type="button"
            disabled={batchDisabled}
            onClick={() => void m.handleReceiveBatch()}
            className={InboundUI.btnPrimary}
            title={
              !allowOperate
                ? caps.blockedReason ?? "当前状态不允许录入"
                : m.preview.touchedLines === 0
                  ? "尚未填写任何数量"
                  : undefined
            }
          >
            {m.savingAll ? "记录中…" : "一键记录本次"}
          </button>
        </div>
      )}
    </section>
  );
};
