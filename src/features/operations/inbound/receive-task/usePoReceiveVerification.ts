// src/features/operations/inbound/receive-task/usePoReceiveVerification.ts

import { useEffect, useMemo, useState } from "react";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";

export function usePoReceiveVerification(po: PurchaseOrderWithLines | null) {
  const [checkGoods, setCheckGoods] = useState(false);
  const [checkSpec, setCheckSpec] = useState(false);
  const [checkQty, setCheckQty] = useState(false);

  // 切换采购单时强制重置
  useEffect(() => {
    setCheckGoods(false);
    setCheckSpec(false);
    setCheckQty(false);
  }, [po?.id]);

  const verified = useMemo(
    () => checkGoods && checkSpec && checkQty,
    [checkGoods, checkSpec, checkQty],
  );

  return {
    checkGoods,
    checkSpec,
    checkQty,
    setCheckGoods,
    setCheckSpec,
    setCheckQty,
    verified,
  };
}
