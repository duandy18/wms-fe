// src/features/admin/shipping-providers/scheme/brackets/contracts/segmentsContract.ts
//
// ✅ 段结构合同（唯一真相）：segments 只能来自 zone.segment_template_id
// - 不兜底、不回退、不猜（空 = 阻断）
// - hook 只负责把 templateId -> WeightSegment[]

import { useEffect, useState } from "react";

import type { WeightSegment } from "../PricingRuleEditor";
import { fetchSegmentTemplateDetail, type SegmentTemplateOut } from "../segmentTemplates";
import { templateItemsToWeightSegments } from "../SegmentsPanel/utils";

async function loadTemplateSegmentsById(templateId: number): Promise<WeightSegment[] | null> {
  const detail: SegmentTemplateOut = await fetchSegmentTemplateDetail(templateId);
  const rows = templateItemsToWeightSegments(detail.items ?? []);
  return rows.length ? rows : null;
}

export function useZoneTemplateSegments(zoneTemplateId: number | null): {
  segments: WeightSegment[];
  loading: boolean;
} {
  const [segments, setSegments] = useState<WeightSegment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Zone 未绑定模板：阻断（segments 为空）
      if (!zoneTemplateId) {
        if (!cancelled) {
          setSegments([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        const rows = await loadTemplateSegmentsById(zoneTemplateId);
        if (!cancelled) {
          setSegments(rows ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSegments([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zoneTemplateId]);

  return { segments, loading };
}
