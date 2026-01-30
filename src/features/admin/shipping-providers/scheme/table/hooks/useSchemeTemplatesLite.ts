// src/features/admin/shipping-providers/scheme/table/hooks/useSchemeTemplatesLite.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSchemeSegmentTemplatesLite, type SegmentTemplateLite } from "../../zones/segmentTemplatesApi";

export function useSchemeTemplatesLite(args: { schemeId: number }) {
  const { schemeId } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<SegmentTemplateLite[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchSchemeSegmentTemplatesLite(schemeId);
      setList(next ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载重量段模板失败";
      setError(msg);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [schemeId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const activeTemplates = useMemo(() => {
    const arr = (list ?? []).filter((t) => t && typeof t.id === "number");
    const act = arr.filter((t) => t.is_active);
    act.sort((a, b) => b.id - a.id);
    return act;
  }, [list]);

  return {
    loading,
    error,
    list,
    activeTemplates,
    reload,
  };
}
