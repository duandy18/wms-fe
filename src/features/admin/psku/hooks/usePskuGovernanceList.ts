// src/features/admin/psku/hooks/usePskuGovernanceList.ts

import { useEffect, useState } from "react";
import type { PskuGovernanceOut, PskuGovernanceRow } from "../types";
import { fetchPskuGovernance } from "../api";

export type PskuGovernanceListQuery = {
  platform: string | null;
  storeId: number | null;
  status: "BOUND" | "UNBOUND" | "LEGACY_ITEM_BOUND" | null;
  action: "OK" | "BIND_FIRST" | "MIGRATE_LEGACY" | null;
  q: string | null;
  limit: number;
  offset: number;
};

export function usePskuGovernanceList(query: PskuGovernanceListQuery): {
  loading: boolean;
  errorMsg: string;
  rows: PskuGovernanceRow[];
  total: number;
  reload: () => Promise<void>;
} {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState<PskuGovernanceRow[]>([]);
  const [total, setTotal] = useState(0);

  async function loadOnce(): Promise<void> {
    setLoading(true);
    setErrorMsg("");

    try {
      const res: PskuGovernanceOut = await fetchPskuGovernance({
        platform: query.platform,
        storeId: query.storeId,
        status: query.status,
        action: query.action,
        q: query.q,
        limit: query.limit,
        offset: query.offset,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (e: unknown) {
      setRows([]);
      setTotal(0);
      setErrorMsg(e instanceof Error ? e.message : "加载失败");
    } finally {
      // ✅ eslint(no-unsafe-finally)：finally 里禁止 return
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const res: PskuGovernanceOut = await fetchPskuGovernance({
          platform: query.platform,
          storeId: query.storeId,
          status: query.status,
          action: query.action,
          q: query.q,
          limit: query.limit,
          offset: query.offset,
        });

        if (!alive) return;
        setRows(res.items);
        setTotal(res.total);
      } catch (e: unknown) {
        if (!alive) return;
        setRows([]);
        setTotal(0);
        setErrorMsg(e instanceof Error ? e.message : "加载失败");
      } finally {
        // ✅ 不 return；只在 alive 时更新状态
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [query.platform, query.storeId, query.status, query.action, query.q, query.limit, query.offset]);

  return {
    loading,
    errorMsg,
    rows,
    total,
    reload: loadOnce,
  };
}
