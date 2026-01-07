// src/features/operations/inbound/InboundManualReceiveCard.tsx

import React, { useMemo, useState } from "react";
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

  const activeLine = useMemo(() => {
    if (c.activeItemId == null) return null;
    return (m.lines || []).find((x) => x.item_id === c.activeItemId) ?? null;
  }, [c.activeItemId, m.lines]);

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

  const batchDisabled =
    !editing || m.savingAll || m.savingItemId != null || m.preview.touchedLines === 0;

  const hardCount = m.supplementCounts.hardCount;
  const softCount = m.supplementCounts.softCount;

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">采购手工收货</h2>

          <div className="text-[11px] text-slate-500">
            本页只录入“本次收货数量”。批次/日期请到「
            <SupplementLink source="purchase" taskId={m.taskId}>收货补录</SupplementLink>」集中处理。
          </div>

          <div className="mt-1 text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
            {m.suppLoading ? (
              <span className="text-slate-500">补录提示加载中…</span>
            ) : m.suppErr ? (
              <span className="text-rose-700">补录提示加载失败：{m.suppErr}</span>
            ) : (
              <>
                <span>
                  必须补录：<span className="font-mono text-amber-700">{hardCount}</span> 行
                </span>
                <span className="text-slate-400">·</span>
                <span>
                  建议补录：<span className="font-mono text-slate-700">{softCount}</span> 行
                </span>
                <span className="text-slate-400">·</span>
                <SupplementLink source="purchase" taskId={m.taskId}>去补录</SupplementLink>
              </>
            )}
          </div>

          {activeLine ? (
            <div className="mt-1 text-[11px] text-sky-700">
              已定位到：<span className="font-medium">{activeLine.item_name ?? "未命名商品"}</span>
              <span className="ml-2 text-sky-700/80">（点击表格行可切换定位）</span>
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-slate-500">
              未定位：可在上方“条码 / SKU 输入”扫码或键盘回车提交，系统会自动定位到对应商品行。
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                onClick={() => setEditing(false)}
                disabled={m.savingAll || m.savingItemId != null}
              >
                取消编辑
              </button>
              <span className="text-[11px] text-slate-500">
                {m.savingAll ? "批量记录中…" : "编辑中"}
              </span>
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
          savingAll={m.savingAll}
          activeItemId={c.activeItemId}
          taskId={m.taskId}
          hardMissingByItemId={m.hardMissingByItemId}
          softMissingByItemId={m.softMissingByItemId}
          onQtyChange={m.handleQtyChange}
          onReceive={(line) => void m.handleReceive(line)}
          onRowClick={(line) => c.setActiveItemId(line.item_id)}
        />
      </div>

      {!editing ? (
        <div className="text-[11px] text-slate-500">
          当前为锁定状态：点击“编辑”后才能修改数量并提交。
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] text-slate-700">
            本次摘要：将记录{" "}
            <span className="font-mono">{m.preview.touchedLines}</span> 行，共{" "}
            <span className="font-mono">{m.preview.totalQty}</span> 件。
          </div>

          <button
            type="button"
            disabled={batchDisabled}
            onClick={() => void m.handleReceiveBatch()}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            title={m.preview.touchedLines === 0 ? "请先在“本次”列填写数量" : "一键记录本次（批量）"}
          >
            {m.savingAll ? "批量记录中…" : "一键记录本次"}
          </button>
        </div>
      )}
    </section>
  );
};
