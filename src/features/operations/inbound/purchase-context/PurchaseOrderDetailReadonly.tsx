// src/features/operations/inbound/purchase-context/PurchaseOrderDetailReadonly.tsx

import React, { useMemo, useState } from "react";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { PurchaseOrderHeaderCard } from "../../../purchase-orders/PurchaseOrderHeaderCard";
import { PurchaseOrderLinesTable } from "../../../purchase-orders/PurchaseOrderLinesTable";
import { calcPoProgress } from "./poHelpers";

export function PurchaseOrderDetailReadonly(props: {
  po: PurchaseOrderWithLines | null;

  // ✅ 明细刷新（由上层注入）
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshErr?: string | null;

  // 可选：右上角附带信息（例如关联任务）
  rightHint?: React.ReactNode;
}) {
  const { po, onRefresh, refreshing = false, refreshErr = null, rightHint } = props;

  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  const totals = useMemo(() => calcPoProgress(po), [po]);

  React.useEffect(() => {
    if (!po || !po.lines || po.lines.length === 0) {
      setSelectedLineId(null);
      return;
    }
    setSelectedLineId(po.lines[0].id);
  }, [po?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!po) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-500">未选择采购单</div>
        {/* ✅ 即使没有 po，也允许点刷新（上层会尝试用 selectedPoId / task 刷新） */}
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50"
          onClick={() => onRefresh?.()}
          title="刷新（将尝试重新拉取采购单/任务）"
        >
          {refreshing ? "刷新中…" : "刷新"}
        </button>
        {refreshErr ? <div className="text-[11px] text-rose-700">{refreshErr}</div> : null}
      </div>
    );
  }

  // 去掉外层“外环卡”，只保留内部两张核心卡（基本信息 + 行明细）
  return (
    <div className="space-y-3">
      <PurchaseOrderHeaderCard
        po={po}
        poRef={`PO-${po.id}`}
        totalQtyOrdered={totals.ordered}
        totalQtyReceived={totals.received}
      />

      {/* ✅ 刷新按钮：放在“基本信息卡下面 / 行明细表格上面” */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500">
          当前采购单 #{po.id}
          {rightHint ? <span className="ml-2">{rightHint}</span> : null}
          {refreshErr ? <span className="ml-2 text-rose-700">{refreshErr}</span> : null}
        </div>

        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50"
          onClick={() => onRefresh?.()}
          // ✅ 不禁用：任何时候都可点击；并发保护在上层 handleRefreshDetail
          title="刷新采购单行明细（提交入库后用于同步最新已收/剩余）"
        >
          {refreshing ? "刷新中…" : "刷新"}
        </button>
      </div>

      <PurchaseOrderLinesTable
        po={po}
        selectedLineId={selectedLineId}
        onSelectLine={setSelectedLineId}
      />
    </div>
  );
}
