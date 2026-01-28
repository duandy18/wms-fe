// src/features/admin/shipping-providers/scheme/zones/useZoneSegmentTemplateChoices.ts
import { useEffect, useMemo, useRef, useState } from "react";
import type { WeightSegment } from "../brackets/PricingRuleEditor";
import {
  fetchSegmentTemplates,
  fetchSegmentTemplateDetail,
  isTemplateActive,
  type SegmentTemplateOut,
} from "../brackets/segmentTemplates";
import { templateItemsToWeightSegments } from "../brackets/SegmentsPanel/utils";
import { getErrorMessage } from "./zonesPanelUtils";

export type SegmentTemplateChoice = {
  id: number;
  name: string;
  segments: WeightSegment[];
};

export type DefaultTemplateChoice = {
  templateId: number | null;
  label: string;
  segments: WeightSegment[];
};

const FALLBACK_SEGMENTS: WeightSegment[] = [
  { min: "0", max: "1" },
  { min: "1", max: "2" },
  { min: "2", max: "3" },
  { min: "3", max: "" },
];

function toSegments(tpl: SegmentTemplateOut | null): WeightSegment[] {
  const rows = templateItemsToWeightSegments(tpl?.items ?? []);
  return rows.length ? rows : FALLBACK_SEGMENTS;
}

export function useZoneSegmentTemplateChoices(args: {
  schemeId: number;
  schemeDefaultTemplateId: number | null;
}) {
  const { schemeId, schemeDefaultTemplateId } = args;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [activeChoices, setActiveChoices] = useState<SegmentTemplateChoice[]>([]);
  const [defaultChoice, setDefaultChoice] = useState<DefaultTemplateChoice>({
    templateId: schemeDefaultTemplateId,
    label: "沿用默认段结构",
    segments: FALLBACK_SEGMENTS,
  });

  // templateId -> detail cache
  const cacheRef = useRef<Map<number, SegmentTemplateOut>>(new Map());

  useEffect(() => {
    let alive = true;

    const commit = (fn: () => void) => {
      if (!alive) return;
      fn();
    };

    (async () => {
      commit(() => {
        setBusy(true);
        setErr(null);
      });

      let nextActiveChoices: SegmentTemplateChoice[] = [];
      let nextDefaultChoice: DefaultTemplateChoice = {
        templateId: schemeDefaultTemplateId,
        label: "沿用默认段结构",
        segments: FALLBACK_SEGMENTS,
      };

      try {
        const list = await fetchSegmentTemplates(schemeId);

        const activeList = (list ?? []).filter((t) => isTemplateActive(t));
        const activeIds = activeList.map((t) => t.id);

        const needIds = new Set<number>(activeIds);
        if (schemeDefaultTemplateId != null) needIds.add(schemeDefaultTemplateId);

        // 拉 detail（items）用于展示段结构
        for (const id of needIds) {
          if (cacheRef.current.has(id)) continue;
          const detail = await fetchSegmentTemplateDetail(id);
          cacheRef.current.set(id, detail);
        }

        // active choices
        nextActiveChoices = activeIds.map((id) => {
          const d = cacheRef.current.get(id) ?? null;
          const name = (d?.name ?? activeList.find((x) => x.id === id)?.name ?? `模板#${id}`).trim();
          return { id, name, segments: toSegments(d) };
        });

        // default choice（沿用默认）
        if (schemeDefaultTemplateId != null) {
          const d = cacheRef.current.get(schemeDefaultTemplateId) ?? null;
          const name = (d?.name ?? `模板#${schemeDefaultTemplateId}`).trim();
          nextDefaultChoice = {
            templateId: schemeDefaultTemplateId,
            label: `沿用默认段结构（默认：${name}）`,
            segments: toSegments(d),
          };
        } else {
          nextDefaultChoice = {
            templateId: null,
            label: "沿用默认段结构（未设置默认模板，将使用兜底段）",
            segments: FALLBACK_SEGMENTS,
          };
        }

        commit(() => {
          setActiveChoices(nextActiveChoices);
          setDefaultChoice(nextDefaultChoice);
        });
      } catch (e: unknown) {
        const msg = getErrorMessage(e, "加载重量段方案失败");
        commit(() => {
          setErr(msg);
          setActiveChoices([]);
          setDefaultChoice({
            templateId: schemeDefaultTemplateId,
            label:
              schemeDefaultTemplateId != null
                ? `沿用默认段结构（模板#${schemeDefaultTemplateId}）`
                : "沿用默认段结构（兜底段）",
            segments: FALLBACK_SEGMENTS,
          });
        });
      }

      commit(() => setBusy(false));
    })();

    return () => {
      alive = false;
    };
  }, [schemeId, schemeDefaultTemplateId]);

  const byId = useMemo(() => {
    const m = new Map<number, SegmentTemplateChoice>();
    for (const x of activeChoices) m.set(x.id, x);
    return m;
  }, [activeChoices]);

  function getLabelForSelected(selectedId: number | null): string {
    if (selectedId == null) return defaultChoice.label;
    const hit = byId.get(selectedId);
    return hit ? hit.name : `模板#${selectedId}`;
  }

  return {
    busy,
    err,
    activeChoices,
    defaultChoice,
    getLabelForSelected,
  };
}
