// src/features/operations/inbound/supplement/useReceiveSupplements.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReceiveSupplementLine, SupplementSourceType, ViewStatus } from "./types";
import { fetchReceiveSupplements } from "./api";

// 用于管理补录清单的自定义 Hook
export function useReceiveSupplements(args: {
  sourceType: SupplementSourceType;
  status: ViewStatus;
  keyword: string;
  warehouseId?: number;
}) {
  const { sourceType, status, keyword, warehouseId } = args;

  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [data, setData] = useState<ReceiveSupplementLine[]>([]);

  // 用于重新加载补录数据
  const reload = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);

    try {
      // 后端 supplements 支持 mode=hard/soft；不支持 “DONE（已补录）清单”
      if (status === "DONE") {
        setData([]);
        return;
      }

      const mode = status === "ALL" ? "soft" : "hard";

      const rows = await fetchReceiveSupplements({
        sourceType,
        warehouseId: warehouseId ?? 1,
        limit: 200,
        mode,
      });
      setData(rows);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载补录清单失败";
      setLoadErr(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [sourceType, warehouseId, status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 根据状态和关键字过滤补录数据
  const items = useMemo(() => {
    let base = data;
    if (status === "DONE") base = [];
    if (status === "ALL") base = data;

    const k = keyword.trim();
    if (!k) return base;

    return base.filter((x) => {
      const name = x.item_name ?? "";
      const ref = `收货任务 #${x.task_id}`;
      return (
        name.includes(k) ||
        ref.includes(k) ||
        String(x.task_id).includes(k) ||
        (x.batch_code ?? "").includes(k)
      );
    });
  }, [data, status, keyword]);

  return { loading, loadErr, items, reload };
}
