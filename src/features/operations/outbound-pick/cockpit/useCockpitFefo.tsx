// src/features/operations/outbound-pick/cockpit/useCockpitFefo.tsx

import { useEffect, useState } from "react";
import { fetchItemDetail, type ItemDetailResponse } from "../../../inventory/snapshot/api";
import type { PickTask } from "../pickTasksApi";
import type { ApiErrorShape } from "../types_cockpit";

export function useCockpitFefo(args: {
  activeItemId: number | null;
  selectedTask: PickTask | null;
}) {
  const { activeItemId, selectedTask } = args;

  const [fefoDetail, setFefoDetail] = useState<ItemDetailResponse | null>(null);
  const [fefoLoading, setFefoLoading] = useState(false);
  const [fefoError, setFefoError] = useState<string | null>(null);

  const [scanBatchOverride, setScanBatchOverride] = useState<string>("");

  // ---------------- activeItemId 变化时加载 FEFO 批次视图 ----------------
  useEffect(() => {
    const itemId = activeItemId ?? selectedTask?.lines[0]?.item_id ?? null;
    if (!itemId) {
      setFefoDetail(null);
      setFefoError(null);
      setFefoLoading(false);
      return;
    }

    setFefoLoading(true);
    setFefoError(null);

    fetchItemDetail(itemId)
      .then((detail) => setFefoDetail(detail))
      .catch((err: unknown) => {
        const e = err as ApiErrorShape;
        console.error("load FEFO snapshot failed:", e);
        setFefoDetail(null);
        setFefoError(e?.message ?? "加载批次库存失败");
      })
      .finally(() => setFefoLoading(false));
  }, [activeItemId, selectedTask?.id, selectedTask?.lines]);

  // ---------------- FEFO 卡片“一键使用推荐批次” ----------------
  const handleUseFefoBatch = (batchCode: string) => {
    setScanBatchOverride(batchCode);
  };

  function reset() {
    setFefoDetail(null);
    setFefoError(null);
    setFefoLoading(false);
    setScanBatchOverride("");
  }

  return {
    fefoDetail,
    fefoLoading,
    fefoError,

    scanBatchOverride,
    setScanBatchOverride,
    handleUseFefoBatch,

    reset,
  };
}
