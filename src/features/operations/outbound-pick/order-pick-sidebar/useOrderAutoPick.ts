// src/features/operations/outbound-pick/order-pick-sidebar/useOrderAutoPick.ts

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrderSummary } from "../../../orders/api";
import {
  LS_AUTO_KEY,
  loadBool,
  loadLast,
  loadProcessedIds,
  saveBool,
  saveLast,
  saveProcessedIds,
} from "./storage";

type OrdersListLike = {
  rows: OrderSummary[];
  loading: boolean;
  loadList: () => Promise<void>;
};

export function useOrderAutoPick(args: {
  list: OrdersListLike;
  detailLoading: boolean;
  onEnsure: (summary: OrderSummary) => Promise<void> | void;
}) {
  const { list, detailLoading, onEnsure } = args;

  const [enabled, setEnabled] = useState<boolean>(() => loadBool(LS_AUTO_KEY, false));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [processedIds, setProcessedIds] = useState<number[]>(() => loadProcessedIds());
  const [last, setLast] = useState(() => loadLast());

  // 保持 localStorage 同步（开关、日志、processed）
  useEffect(() => {
    saveBool(LS_AUTO_KEY, enabled);
  }, [enabled]);

  const markProcessed = useCallback((orderId: number) => {
    setProcessedIds((prev) => {
      const next = Array.from(new Set([...prev, orderId])).slice(-300);
      saveProcessedIds(next);
      return next;
    });
  }, []);

  const setLastMsg = useCallback((msg: string) => {
    saveLast(msg);
    setLast(loadLast());
  }, []);

  // 使用 ref 避免 setTimeout 循环里拿到旧闭包
  const enabledRef = useRef(enabled);
  const busyRef = useRef(busy);
  const detailLoadingRef = useRef(detailLoading);
  const loadingRef = useRef(list.loading);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    detailLoadingRef.current = detailLoading;
  }, [detailLoading]);

  useEffect(() => {
    loadingRef.current = list.loading;
  }, [list.loading]);

  const tick = useCallback(async () => {
    if (!enabledRef.current) return;

    // 避免与用户操作/加载冲突
    if (busyRef.current || loadingRef.current || detailLoadingRef.current) return;

    try {
      await list.loadList();

      // 找到第一条未处理 CREATED
      const processed = new Set(loadProcessedIds());
      const candidate = (list.rows ?? []).find((r) => {
        if (!r) return false;
        if (processed.has(r.id)) return false;
        const st = String(r.status || "").trim().toUpperCase();
        return st === "CREATED";
      });

      if (!candidate) return;

      setBusy(true);
      setError(null);

      const label = `${candidate.platform}/${candidate.shop_id} · ${candidate.ext_order_no}`;
      setLastMsg(`发现新订单：${label}，正在创建拣货任务并触发打印…`);

      await onEnsure(candidate);

      markProcessed(candidate.id);
      setLastMsg(`已触发：${label}（任务创建/打印入队已提交后端）`);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "自动处理失败";
      setError(msg);
      setLastMsg(`自动处理失败：${msg}`);
    } finally {
      setBusy(false);
    }
  }, [list, onEnsure, markProcessed, setLastMsg]);

  // 轮询：默认 5s；开启后立即跑一次
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: number | null = null;

    async function loop() {
      if (cancelled) return;
      await tick();
      if (cancelled) return;
      timer = window.setTimeout(loop, 5000);
    }

    void loop();

    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [enabled, tick]);

  return {
    enabled,
    setEnabled,

    busy,
    error,

    processedIds,
    last,
  };
}
