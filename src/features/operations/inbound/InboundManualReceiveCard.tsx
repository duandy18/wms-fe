// src/features/operations/inbound/InboundManualReceiveCard.tsx
// 采购单行收货卡片（手工录入）
// - 只负责录入数量；批次/日期补录移到独立的“收货补录”页面
// - 作业态：默认锁定，点“编辑”才允许修改，避免误触

import React, { useState } from "react";
import type { InboundCockpitController } from "./types";
import { useInboundManualReceiveModel } from "./manual/useInboundManualReceiveModel";
import { ManualReceiveHeader } from "./manual/ManualReceiveHeader";
import { ManualReceiveTable } from "./manual/ManualReceiveTable";
import { SupplementLink } from "./SupplementLink";

interface Props {
  c: InboundCockpitController;
}

export const InboundManualReceiveCard: React.FC<Props> = ({ c }) => {
  const m = useInboundManualReceiveModel(c);
  const [editing, setEditing] = useState<boolean>(false);

  if (!m.task) {
    return (
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">采购手工收货</h2>
        <p className="text-xs text-slate-500">
          尚未绑定收货任务。请先选择采购单并创建收货任务。
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">采购手工收货</h2>
          <div className="text-[11px] text-slate-500">
            本页只录入“本次收货数量”。批次/日期请到「
            <SupplementLink source="purchase">收货补录</SupplementLink>」集中处理。
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                onClick={() => setEditing(false)}
              >
                取消编辑
              </button>
              <span className="text-[11px] text-slate-500">编辑中</span>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                onClick={() => setEditing(true)}
              >
                编辑
              </button>
              <span className="text-[11px] text-slate-500">已锁定</span>
            </>
          )}
        </div>
      </div>

      <ManualReceiveHeader />

      {m.error && <div className="text-[11px] text-red-600">{m.error}</div>}

      <div className={editing ? "" : "pointer-events-none opacity-70"}>
        <ManualReceiveTable
          lines={m.lines}
          qtyInputs={m.qtyInputs}
          savingItemId={m.savingItemId}
          onQtyChange={m.handleQtyChange}
          onReceive={(line) => void m.handleReceive(line)}
        />
      </div>

      {!editing ? (
        <div className="text-[11px] text-slate-500">
          当前为锁定状态：点击“编辑”后才能修改数量并提交。
        </div>
      ) : null}
    </section>
  );
};
