// src/features/admin/shipping-providers/scheme/brackets/matrix/usePricingSchemeMatrix.ts

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchPricingSchemeZoneBracketsMatrix } from "./pricingSchemeMatrixApi";
import type { ZoneBracketsMatrixOut } from "./types";

export function usePricingSchemeMatrix(args: { schemeId: number | null; enabled?: boolean }) {
  const { schemeId, enabled = true } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ZoneBracketsMatrixOut | null>(null);

  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!schemeId || schemeId <= 0) return;

    let cancelled = false;

    (async () => {
      let next: ZoneBracketsMatrixOut | null = null;
      let nextErr: string | null = null;

      setLoading(true);
      setError(null);

      try {
        next = await fetchPricingSchemeZoneBracketsMatrix(schemeId);
      } catch (e) {
        nextErr = e instanceof Error ? e.message : "加载报价矩阵失败";
      }

      if (cancelled || !aliveRef.current) return;

      if (nextErr) {
        setError(nextErr);
        setData(null);
      } else {
        setData(next);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, schemeId]);

  const groups = useMemo(() => data?.groups ?? [], [data]);
  const unboundZones = useMemo(() => data?.unbound_zones ?? [], [data]);

  return {
    loading,
    error,
    data,
    groups,
    unboundZones,
    reload: async () => {
      if (!schemeId || schemeId <= 0) return;

      let next: ZoneBracketsMatrixOut | null = null;
      let nextErr: string | null = null;

      setLoading(true);
      setError(null);

      try {
        next = await fetchPricingSchemeZoneBracketsMatrix(schemeId);
      } catch (e) {
        nextErr = e instanceof Error ? e.message : "加载报价矩阵失败";
      }

      if (!aliveRef.current) return;

      if (nextErr) {
        setError(nextErr);
        setData(null);
      } else {
        setData(next);
      }

      setLoading(false);
    },
  };
}
