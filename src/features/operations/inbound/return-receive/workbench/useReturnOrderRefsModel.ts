// src/features/operations/inbound/return-receive/workbench/useReturnOrderRefsModel.ts

import { useEffect, useRef, useState } from "react";
import {
  listReturnOrderRefs,
  fetchReturnOrderRefDetail,
  type ReturnOrderRefDetailOut,
  type ReturnOrderRefItem,
} from "../../../../return-tasks/api";
import { formatErr } from "./utils";

export type ReturnOrderRefsModel = {
  orderRefs: ReturnOrderRefItem[];
  loadingOrderRefs: boolean;
  orderRefsError: string | null;

  selectedOrderRef: string;
  setSelectedOrderRef: (v: string) => void;

  detail: ReturnOrderRefDetailOut | null;
  loadingDetail: boolean;
  detailError: string | null;

  reloadOrderRefs: () => Promise<void>;
};

export function useReturnOrderRefsModel(): ReturnOrderRefsModel {
  const [orderRefs, setOrderRefs] = useState<ReturnOrderRefItem[]>([]);
  const [loadingOrderRefs, setLoadingOrderRefs] = useState(false);
  const [orderRefsError, setOrderRefsError] = useState<string | null>(null);

  const [selectedOrderRef, setSelectedOrderRef] = useState<string>("");

  const [detail, setDetail] = useState<ReturnOrderRefDetailOut | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const selectedRefRef = useRef<string>("");
  useEffect(() => {
    selectedRefRef.current = selectedOrderRef;
  }, [selectedOrderRef]);

  const reloadOrderRefs = async () => {
    setOrderRefsError(null);
    setLoadingOrderRefs(true);
    try {
      const rows = await listReturnOrderRefs({ limit: 20, days: 30 });
      setOrderRefs(rows);

      const current = (selectedRefRef.current ?? "").trim();
      const exists = current && rows.some((r) => r.order_ref === current);

      if (exists) return;

      if (rows.length > 0) setSelectedOrderRef(rows[0].order_ref);
      else setSelectedOrderRef("");
    } catch (e: unknown) {
      setOrderRefsError(formatErr(e, "加载退货订单列表失败"));
      setOrderRefs([]);
      setSelectedOrderRef("");
    } finally {
      setLoadingOrderRefs(false);
    }
  };

  useEffect(() => {
    void reloadOrderRefs();
     
  }, []);

  // 选中变化 → 拉 detail
  useEffect(() => {
    const ref = (selectedOrderRef ?? "").trim();
    if (!ref) {
      setDetail(null);
      setDetailError(null);
      setLoadingDetail(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const d = await fetchReturnOrderRefDetail(ref);
        if (cancelled) return;
        setDetail(d);
      } catch (e: unknown) {
        if (cancelled) return;
        setDetailError(formatErr(e, "加载订单详情失败"));
        setDetail(null);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedOrderRef]);

  return {
    orderRefs,
    loadingOrderRefs,
    orderRefsError,

    selectedOrderRef,
    setSelectedOrderRef,

    detail,
    loadingDetail,
    detailError,

    reloadOrderRefs,
  };
}
