// src/features/operations/inbound/task-context/useInboundTaskContextModel.ts

import { useEffect, useState } from "react";
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

  async function handleSelectPoId(poId: string) {
    const v = String(poId ?? "").trim();
    setSelectedPoId(v);
    if (!v) return;
    c.setPoIdInput(v);
    await c.loadPoById();
  }

  async function handleSelectPoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await handleSelectPoId(e.target.value);
  }

  async function handleManualLoadPo() {
    await c.loadPoById();
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
    handleSelectPoChange,
    handleManualLoadPo,
  };
}

export type { InboundMode };
