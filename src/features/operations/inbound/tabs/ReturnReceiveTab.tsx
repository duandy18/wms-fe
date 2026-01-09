// src/features/operations/inbound/tabs/ReturnReceiveTab.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { InboundTabShell } from "./InboundTabShell";
import { InboundUI } from "../ui";

import { useReturnReceiveWorkbench } from "../return-receive/useReturnReceiveWorkbench";
import { ReturnReceiveTaskFactsCard } from "../return-receive/ReturnReceiveTaskFactsCard";
import { ReturnReceiveLinesTable } from "../return-receive/ReturnReceiveLinesTable";

import { ReturnReceiveOrderRefListCard } from "../return-receive/ReturnReceiveOrderRefListCard";
import { ReturnReceiveOrderRefSummaryCard } from "../return-receive/ReturnReceiveOrderRefSummaryCard";
import { ReturnReceiveCreateTaskCard } from "../return-receive/ReturnReceiveCreateTaskCard";

export const ReturnReceiveTab: React.FC = () => {
  const m = useReturnReceiveWorkbench();
  const navigate = useNavigate();

  const left = (
    <div className="space-y-4">
      <ReturnReceiveOrderRefListCard
        items={m.orderRefs}
        loading={m.loadingOrderRefs}
        error={m.orderRefsError}
        selectedRef={m.selectedOrderRef}
        onSelect={(ref) => m.setSelectedOrderRef(ref)}
        onReload={() => void m.reloadOrderRefs()}
      />

      <ReturnReceiveOrderRefSummaryCard
        detail={m.detail}
        loading={m.loadingDetail}
        error={m.detailError}
        task={m.task}
      />
    </div>
  );

  const right = (
    <div className="space-y-4">
      <ReturnReceiveCreateTaskCard
        selectedRef={m.selectedOrderRef}
        canCreate={m.canCreate}
        creating={m.loadingCreate}
        onCreate={() => void m.createTask()}
        hint="说明：批次来自出库台账，系统自动回原批次；本页只录数量并提交回仓。"
      />

      {m.task ? <ReturnReceiveTaskFactsCard task={m.task} /> : null}

      <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={InboundUI.title}>数量录入</h2>

          <button type="button" className={InboundUI.btnGhost} disabled={!m.task} onClick={() => m.clearAll()}>
            放弃本次录入
          </button>
        </div>

        {!m.task ? (
          <div className={InboundUI.quiet}>尚未创建任务。请先点击上方“创建退货回仓任务”。</div>
        ) : (
          <>
            <ReturnReceiveLinesTable task={m.task} m={m} />

            {m.commitError ? <div className={InboundUI.danger}>{m.commitError}</div> : null}
            {m.error ? <div className={InboundUI.danger}>{m.error}</div> : null}

            <div className="flex items-center gap-2">
              <button type="button" className={InboundUI.btnPrimary} disabled={!m.canCommit} onClick={() => void m.commit()}>
                {m.committing ? "提交中…" : "提交回仓"}
              </button>

              {m.lastCommittedItemId ? (
                <button
                  type="button"
                  className={InboundUI.btnSecondary}
                  onClick={() => {
                    const qs = new URLSearchParams();
                    qs.set("open_item_id", String(m.lastCommittedItemId));
                    navigate(`/snapshot?${qs.toString()}`);
                  }}
                >
                  查看即时库存（已定位）
                </button>
              ) : null}

              <span className={InboundUI.quiet}>规则：最终数量必须为正，且不超过“可退”。提交成功后自动清场。</span>
            </div>
          </>
        )}
      </section>
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
