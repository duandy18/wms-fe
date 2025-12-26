// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/state.ts
//
// 模板工作台的状态机（orchestration-only）
// - 拆分：state.ts（容器） + effects.ts（useEffect） + actions.ts（动作）
// - ✅ UI 两步走：保存方案 + 启用（启用内部自动 publish -> activate）

import { useMemo, useState } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "../../../api/types";
import type { WeightSegment } from "../PricingRuleEditor";

import { fetchSegmentTemplates } from "../../../api/schemes";
import { createWorkbenchActions } from "./actions";
import { useLoadTemplateDetailEffect, useLoadTemplatesEffect } from "./effects";

export function useSegmentTemplateWorkbench(args: {
  schemeId: number;
  mirrorSegmentsJson: SchemeWeightSegment[] | null;
  disabled?: boolean;
  onError?: (msg: string) => void;
}) {
  const { schemeId, mirrorSegmentsJson, disabled, onError } = args;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [templates, setTemplates] = useState<SegmentTemplateOut[]>([]);
  const activeTemplate = useMemo(() => templates.find((t) => t.is_active) ?? null, [templates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SegmentTemplateOut | null>(null);

  const [draftSegments, setDraftSegments] = useState<WeightSegment[]>([]);

  async function refreshTemplates(keepSelectedId?: number | null): Promise<SegmentTemplateOut[]> {
    const list = await fetchSegmentTemplates(schemeId);
    setTemplates(list);
    if (keepSelectedId !== undefined) setSelectedTemplateId(keepSelectedId);
    return list;
  }

  useLoadTemplatesEffect({
    schemeId,
    onError,
    setBusy,
    setErr,
    setTemplates,
    setSelectedTemplateId,
  });

  useLoadTemplateDetailEffect({
    selectedTemplateId,
    onError,
    setBusy,
    setErr,
    setSelectedTemplate,
    setDraftSegments,
  });

  const actions = useMemo(() => {
    return createWorkbenchActions({
      schemeId,
      mirrorSegmentsJson,
      disabled,
      onError,

      selectedTemplate,
      draftSegments,
      activeTemplate,

      setBusy,
      setErr,
      setSelectedTemplateId,
      setSelectedTemplate,
      setDraftSegments,

      refreshTemplates,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId, mirrorSegmentsJson, disabled, onError, selectedTemplate, draftSegments, activeTemplate]);

  return {
    busy,
    err,
    templates,
    activeTemplate,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedTemplate,
    draftSegments,
    setDraftSegments,
    actions,
  };
}

export default useSegmentTemplateWorkbench;
