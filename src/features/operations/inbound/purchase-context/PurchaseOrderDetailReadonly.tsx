// src/features/operations/inbound/purchase-context/PurchaseOrderDetailReadonly.tsx

import React, { useState } from "react";
import type { PurchaseOrderDetail } from "../../../purchase-orders/api";
import { PurchaseOrderLinesTable } from "../../../purchase-orders/PurchaseOrderLinesTable";
import { InboundUI } from "../ui";

export function PurchaseOrderDetailReadonly(props: {
  po: PurchaseOrderDetail | null;

  onRefresh?: () => void;
  refreshing?: boolean;
  refreshErr?: string | null;

  rightHint?: React.ReactNode;
}) {
  const { po, onRefresh, refreshing = false, refreshErr = null, rightHint } = props;

  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  React.useEffect(() => {
    if (!po || !po.lines || po.lines.length === 0) {
      setSelectedLineId(null);
      return;
    }
    setSelectedLineId(po.lines[0].id);
  }, [po?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!po) {
    return <div className={InboundUI.quiet}>未选择采购单</div>;
  }

  return (
    <div className={InboundUI.cardGap}>
      {/* ✅ 入库页：不展示 PO 基本信息（锚点已在左侧列表），这里只保留轻量工具条 */}
      <div className="flex items-center justify-between gap-2">
        <div className={InboundUI.quiet}>
          采购单 #{po.id}
          {rightHint ? <span className="ml-2">{rightHint}</span> : null}
          {refreshErr ? <span className={`ml-2 ${InboundUI.danger}`}>{refreshErr}</span> : null}
        </div>

        <button
          type="button"
          className={InboundUI.btnGhost}
          onClick={() => onRefresh?.()}
          disabled={!onRefresh || refreshing}
          title="刷新采购单行明细（提交入库后用于同步最新已收/剩余）"
        >
          {refreshing ? "刷新中…" : "刷新"}
        </button>
      </div>

      <PurchaseOrderLinesTable po={po} selectedLineId={selectedLineId} onSelectLine={setSelectedLineId} mode="inbound" />
    </div>
  );
}
