// src/features/admin/shipping-providers/scheme/workbench/useTemplateGate.ts

import { useEffect, useState } from "react";
import { fetchSegmentTemplates } from "../brackets/segmentTemplates";

/**
 * Gate：是否存在至少一个重量段模板
 * - 用于锁住 zones/brackets/preview（避免误配）
 * - 注意：surcharges 不依赖该 gate
 */
export function useTemplateGate(args: { schemeId: number | null }) {
  const { schemeId } = args;

  const [checkingTemplates, setCheckingTemplates] = useState(true);
  const [hasAnyTemplate, setHasAnyTemplate] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!schemeId || schemeId <= 0) return;

      let nextHasAnyTemplate = true;

      try {
        setCheckingTemplates(true);
        const list = await fetchSegmentTemplates(schemeId);
        nextHasAnyTemplate = (list ?? []).length > 0;
      } catch {
        // 保守放行：避免因短暂接口异常锁死流程
        nextHasAnyTemplate = true;
      }

      if (!cancelled) {
        setHasAnyTemplate(nextHasAnyTemplate);
        setCheckingTemplates(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [schemeId]);

  const flowLocked = !checkingTemplates && !hasAnyTemplate;

  return {
    checkingTemplates,
    hasAnyTemplate,
    flowLocked,
  };
}
