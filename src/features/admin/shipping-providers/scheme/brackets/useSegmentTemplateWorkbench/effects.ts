// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/effects.ts
import { useEffect } from "react";
import type { SegmentTemplateOut } from "../segmentTemplates";
import type { WeightSegment } from "../PricingRuleEditor";

import { fetchSegmentTemplateDetail, fetchSegmentTemplates } from "../segmentTemplates";
import { templateItemsToWeightSegments } from "../SegmentsPanel/utils";
import { runGuarded } from "./helpers";

export function useLoadTemplatesEffect(args: {
  schemeId: number;
  onError?: (msg: string) => void;

  setBusy: (v: boolean) => void;
  setErr: (v: string | null) => void;

  setTemplates: (v: SegmentTemplateOut[]) => void;
  setSelectedTemplateId: (v: number | null) => void;
}) {
  const { schemeId, onError, setBusy, setErr, setTemplates, setSelectedTemplateId } = args;

  useEffect(() => {
    (async () => {
      const list = (await runGuarded({
        setBusy,
        setErr,
        onError,
        fallbackMsg: "加载方案列表失败",
        fn: async () => await fetchSegmentTemplates(schemeId),
      })) as SegmentTemplateOut[] | null;

      if (!list) return;

      setTemplates(list);
      const act = list.find((x) => x.is_active) ?? null;
      setSelectedTemplateId(act?.id ?? null);
    })();
  }, [schemeId, onError, setBusy, setErr, setTemplates, setSelectedTemplateId]);
}

export function useLoadTemplateDetailEffect(args: {
  selectedTemplateId: number | null;
  onError?: (msg: string) => void;

  setBusy: (v: boolean) => void;
  setErr: (v: string | null) => void;

  setSelectedTemplate: (v: SegmentTemplateOut | null) => void;
  setDraftSegments: (v: WeightSegment[]) => void;
}) {
  const { selectedTemplateId, onError, setBusy, setErr, setSelectedTemplate, setDraftSegments } = args;

  useEffect(() => {
    (async () => {
      if (!selectedTemplateId) {
        setSelectedTemplate(null);
        setDraftSegments([]);
        return;
      }

      const tpl = (await runGuarded({
        setBusy,
        setErr,
        onError,
        fallbackMsg: "加载方案详情失败",
        fn: async () => await fetchSegmentTemplateDetail(selectedTemplateId),
      })) as SegmentTemplateOut | null;

      if (!tpl) return;

      setSelectedTemplate(tpl);

      if (String(tpl.status) === "draft") {
        setDraftSegments(templateItemsToWeightSegments(tpl.items));
      } else {
        setDraftSegments([]);
      }
    })();
  }, [selectedTemplateId, onError, setBusy, setErr, setSelectedTemplate, setDraftSegments]);
}
