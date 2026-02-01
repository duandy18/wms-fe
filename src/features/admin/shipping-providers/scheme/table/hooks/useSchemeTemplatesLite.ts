// src/features/admin/shipping-providers/scheme/table/hooks/useSchemeTemplatesLite.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSchemeSegmentTemplatesLite, type SegmentTemplateLite } from "../../zones/segmentTemplatesApi";

function isPublishedAndNotArchived(t: SegmentTemplateLite): boolean {
  const st = String(t.status ?? "").trim();
  if (!st) return false;
  if (st === "archived") return false;
  return st === "published";
}

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

  // ✅ 语义收敛：
  // - 不再使用 is_active（可绑定/不可绑定）作为候选池
  // - Zone 绑定候选 = 已保存版本（published）且未归档
  const activeTemplates = useMemo(() => {
    const arr = (list ?? []).filter((t) => t && typeof t.id === "number" && Number.isFinite(t.id));
    const selectable = arr.filter(isPublishedAndNotArchived);
    selectable.sort((a, b) => b.id - a.id);
    return selectable;
  }, [list]);

  return {
    loading,
    error,
    list,
    activeTemplates,
    reload,
  };
}
