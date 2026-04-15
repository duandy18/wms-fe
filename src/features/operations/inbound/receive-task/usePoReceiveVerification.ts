// src/features/operations/inbound/receive-task/usePoReceiveVerification.ts

import { useEffect, useMemo, useRef, useState } from "react";

type VerifyPoLike = {
  id: number;
  lines?: Array<{
    id: number;
    qty_ordered_base?: number | null;
    qty_received_base?: number | null;
  }> | null;
} | null;

export function usePoReceiveVerification(po: VerifyPoLike) {
  const [checkGoods, setCheckGoods] = useState(false);
  const [checkSpec, setCheckSpec] = useState(false);
  const [checkQty, setCheckQty] = useState(false);

  // 旧 receive-task 校验流仍在，先保持兼容。
  // 计划合同不再保证带 received 字段；这里按可选字段处理。
  const poRevKey = useMemo(() => {
    if (!po) return "";
    const parts = (po.lines ?? []).map((l) => {
      const ordered = Number(l.qty_ordered_base ?? 0);
      const received = Number(l.qty_received_base ?? 0);
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

  useEffect(() => {
    reset();
    lastRevRef.current = poRevKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po?.id]);

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
