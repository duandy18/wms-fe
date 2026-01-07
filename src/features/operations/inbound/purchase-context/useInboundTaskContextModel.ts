// src/features/operations/inbound/purchase-context/useInboundTaskContextModel.ts

import { useEffect, useRef, useState } from "react";
import {
  fetchPurchaseOrders,
  type PurchaseOrderWithLines,
} from "../../../purchase-orders/api";
import type { InboundCockpitController } from "../types";

type InboundMode = "PO" | "ORDER";

type ApiErrorShape = {
  message?: string;
};

export function useInboundTaskContextModel(c: InboundCockpitController) {
  const [mode, setMode] = useState<InboundMode>("PO");

  const [poOptions, setPoOptions] = useState<PurchaseOrderWithLines[]>([]);
  const [loadingPoOptions, setLoadingPoOptions] = useState(false);
  const [poOptionsError, setPoOptionsError] = useState<string | null>(null);
  const [selectedPoId, setSelectedPoId] = useState<string>("");

  const autoOpenOnceRef = useRef(false);

  // 只取稳定成员，避免把整个 c 放进依赖导致 effect 频繁触发
  const { setPoIdInput, loadPoById, currentPo } = c;

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingPoOptions(true);
      setPoOptionsError(null);
      try {
        const list = await fetchPurchaseOrders({
          skip: 0,
          limit: 50,
        });
        setPoOptions(list);
      } catch (err: unknown) {
        const e = err as ApiErrorShape;
        console.error("load purchase orders for inbound cockpit failed", e);
        setPoOptionsError(e?.message ?? "加载采购单列表失败");
      } finally {
        setLoadingPoOptions(false);
      }
    };
    void loadOptions();
  }, []);

  // controller 的 currentPo 变化，同步列表高亮
  useEffect(() => {
    if (currentPo?.id != null) {
      setSelectedPoId(String(currentPo.id));
    }
  }, [currentPo?.id]);

  // 首次进入 PO 模式，自动打开最新一张 PO（如果当前没选）
  useEffect(() => {
    if (autoOpenOnceRef.current) return;
    if (mode !== "PO") return;
    if (loadingPoOptions) return;
    if (poOptionsError) return;

    if (currentPo?.id != null) {
      autoOpenOnceRef.current = true;
      return;
    }

    if (!selectedPoId && poOptions.length > 0) {
      const newest = [...poOptions].sort((a, b) => b.id - a.id)[0];
      const id = String(newest.id);
      autoOpenOnceRef.current = true;
      setSelectedPoId(id);
      setPoIdInput(id);
      void loadPoById(id);
    }
  }, [
    mode,
    loadingPoOptions,
    poOptionsError,
    poOptions,
    selectedPoId,
    currentPo?.id,
    setPoIdInput,
    loadPoById,
  ]);

  async function handleSelectPoId(poId: string) {
    const v = String(poId ?? "").trim();
    setSelectedPoId(v);
    if (!v) return;

    setPoIdInput(v);
    await loadPoById(v);
  }

  return {
    mode,
    setMode,

    poOptions,
    loadingPoOptions,
    poOptionsError,
    selectedPoId,
    setSelectedPoId,

    handleSelectPoId,
  };
}

export type { InboundMode };
