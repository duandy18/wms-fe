// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/state.ts
//
// 模板工作台的状态机（orchestration-only）
// - 拆分：state.ts（容器） + effects.ts（useEffect） + actions.ts（动作）
//
// ✅ 刚性契约（与后端一致）
// - draft：允许编辑 items（PUT /items）
// - 保存：PUT /items + :publish（保存后变为 published）
// - 启用：仅 published 允许 :activate（草稿不能直接生效）
//
// ✅ 注意：已支持“多条模板同时生效”
// - active=true 不再互斥
// - UI 展示为“已生效模板（可多条）”

import { useMemo, useState } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "../segmentTemplates";
import type { WeightSegment } from "../PricingRuleEditor";

import { fetchSegmentTemplates, isTemplateActive } from "../segmentTemplates";
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

  // ✅ 多条生效：activeTemplates 为真相
  const activeTemplates = useMemo(() => templates.filter((t) => isTemplateActive(t)), [templates]);

  // ✅ 兼容保留：旧代码仍可能使用 activeTemplate（取第一条）
  const activeTemplate = useMemo(() => activeTemplates[0] ?? null, [activeTemplates]);

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

      // ✅ 仍传 activeTemplate 以保持 action ctx 兼容（但不再用于“唯一生效”叙事）
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

    // ✅ 新增：多条生效列表
    activeTemplates,

    // ✅ 兼容：旧的单条 active（取第一条）
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
