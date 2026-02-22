// src/features/operations/inbound/receive-task/usePoReceiveVerification.ts

import { useEffect, useMemo, useRef, useState } from "react";
import type { PurchaseOrderDetail } from "../../../purchase-orders/api";

export function usePoReceiveVerification(po: PurchaseOrderDetail | null) {
  const [checkGoods, setCheckGoods] = useState(false);
  const [checkSpec, setCheckSpec] = useState(false);
  const [checkQty, setCheckQty] = useState(false);

  // ✅ PO 刷新版本：同一 po.id 下，只要“应收/已收”发生变化，就视为新一轮作业确认（清空勾选）
  // ✅ 主线：使用 base 事实口径，避免依赖 deprecated/兼容字段
  const poRevKey = useMemo(() => {
    if (!po) return "";
    const parts = (po.lines ?? []).map((l) => {
      const ordered = l.qty_ordered_base ?? 0;
      const received = l.qty_received_base ?? 0;
      return `${l.id}:${ordered}:${received}`;
    });
    return `${po.id}|${parts.join("|")}`;
  }, [po]);

  const lastRevRef = useRef<string>("");

  const reset = () => {
    setCheckGoods(false);
    setCheckSpec(false);
    setCheckQty(false);
  };

  // 切换采购单时强制重置
  useEffect(() => {
    reset();
    lastRevRef.current = poRevKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po?.id]);

  // ✅ 同一采购单刷新（提交入库后 PO 统计变化）也要重置：避免“验货确认残留”
  useEffect(() => {
    if (!po) {
      reset();
      lastRevRef.current = "";
      return;
    }

    if (!lastRevRef.current) {
      lastRevRef.current = poRevKey;
      return;
    }

    if (lastRevRef.current !== poRevKey) {
      reset();
      lastRevRef.current = poRevKey;
    }
  }, [poRevKey, po]);

  const verified = useMemo(() => checkGoods && checkSpec && checkQty, [checkGoods, checkSpec, checkQty]);

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
