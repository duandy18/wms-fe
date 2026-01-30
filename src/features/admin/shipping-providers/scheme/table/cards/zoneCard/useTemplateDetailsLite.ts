// src/features/admin/shipping-providers/scheme/table/cards/zoneCard/useTemplateDetailsLite.ts

import { useEffect, useMemo, useState } from "react";
import { fetchSegmentTemplateDetailLite, type SegmentTemplateDetailLite } from "../../../zones/segmentTemplatesApi";

export function useTemplateDetailsLite(templateIds: number[]) {
  const idsKey = useMemo(() => templateIds.slice().sort((a, b) => a - b).join("|"), [templateIds]);

  const [detailById, setDetailById] = useState<Record<number, SegmentTemplateDetailLite | null>>({});
  const [loadingById, setLoadingById] = useState<Record<number, boolean>>({});
  const [errById, setErrById] = useState<Record<number, string | null>>({});

  useEffect(() => {
    let alive = true;

    const commit = (fn: () => void) => {
      if (!alive) return;
      fn();
    };

    const ids = idsKey
      ? idsKey
          .split("|")
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];

    (async () => {
      for (const id of ids) {
        if (detailById[id]) continue;
        if (loadingById[id]) continue;

        commit(() => {
          setLoadingById((prev) => ({ ...prev, [id]: true }));
          setErrById((prev) => ({ ...prev, [id]: null }));
        });

        try {
          const d = await fetchSegmentTemplateDetailLite(id);
          commit(() => setDetailById((prev) => ({ ...prev, [id]: d })));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "加载模板详情失败";
          commit(() => {
            setErrById((prev) => ({ ...prev, [id]: msg }));
            setDetailById((prev) => ({ ...prev, [id]: null }));
          });
        }

        commit(() => setLoadingById((prev) => ({ ...prev, [id]: false })));
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return { detailById, loadingById, errById };
}

export default useTemplateDetailsLite;
