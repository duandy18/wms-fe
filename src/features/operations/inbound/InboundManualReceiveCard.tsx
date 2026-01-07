// src/features/operations/inbound/InboundManualReceiveCard.tsx

import React, { useMemo, useState } from "react";
import type { InboundCockpitController } from "./types";
import { useInboundManualReceiveModel } from "./manual/useInboundManualReceiveModel";
import { ManualReceiveTable } from "./manual/ManualReceiveTable";
import { InboundUI } from "./ui";

interface Props {
  c: InboundCockpitController;
}

export const InboundManualReceiveCard: React.FC<Props> = ({ c }) => {
  const m = useInboundManualReceiveModel(c);
  const [editing, setEditing] = useState<boolean>(false);

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

  const batchDisabled =
    !editing || m.savingAll || m.savingItemId != null || m.preview.touchedLines === 0;

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
              disabled={m.savingAll || m.savingItemId != null}
            >
              取消
            </button>
          ) : (
            <button
              type="button"
              className={InboundUI.btnGhost}
              onClick={() => setEditing(true)}
            >
              编辑
            </button>
          )}
        </div>
      </div>

      {m.error && <div className={InboundUI.danger}>{m.error}</div>}

      <div className={editing ? "" : "pointer-events-none opacity-70"}>
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

      {editing && (
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
          >
            {m.savingAll ? "记录中…" : "一键记录本次"}
          </button>
        </div>
      )}
    </section>
  );
};
