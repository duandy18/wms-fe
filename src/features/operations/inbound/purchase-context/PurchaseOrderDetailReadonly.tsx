// src/features/operations/inbound/purchase-context/PurchaseOrderDetailReadonly.tsx

import React, { useMemo, useState } from "react";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { PurchaseOrderHeaderCard } from "../../../purchase-orders/PurchaseOrderHeaderCard";
import { PurchaseOrderLinesTable } from "../../../purchase-orders/PurchaseOrderLinesTable";
import { calcPoProgress } from "./poHelpers";

export function PurchaseOrderDetailReadonly(props: {
  po: PurchaseOrderWithLines | null;
}) {
  const { po } = props;
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
    return <div className="text-xs text-slate-500">未选择采购单</div>;
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

      <PurchaseOrderLinesTable
        po={po}
        selectedLineId={selectedLineId}
        onSelectLine={setSelectedLineId}
      />
    </div>
  );
}
