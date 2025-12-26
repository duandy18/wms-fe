// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/state.ts
//
// 模板工作台的状态机（orchestration-only）
// - 负责：加载模板列表/加载模板详情/草稿保存/发布/启用/启用模板段级启停
// - ✅ 规则：保存草稿只保存 draft，不自动发布（自动发布属于 bug）

import { useEffect, useMemo, useState } from "react";
import type { SegmentTemplateOut, SegmentTemplateItemOut, SchemeWeightSegment } from "../../../api/types";
import type { WeightSegment } from "../PricingRuleEditor";

import {
  activateSegmentTemplate,
  createSegmentTemplate,
  fetchSegmentTemplateDetail,
  fetchSegmentTemplates,
  patchSegmentTemplateItemActive,
  publishSegmentTemplate,
} from "../../../api/schemes";

import {
  apiPutTemplateItems,
  templateItemsToWeightSegments,
  weightSegmentsToPutItemsDraftPrefix,
} from "../SegmentsPanel/utils";
import { initDraftSegments, runGuarded } from "./helpers";

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

  async function refreshTemplates(keepSelectedId?: number | null) {
    const list = await fetchSegmentTemplates(schemeId);
    setTemplates(list);
    if (keepSelectedId !== undefined) setSelectedTemplateId(keepSelectedId);
  }

  useEffect(() => {
    (async () => {
      const list = await runGuarded({
        setBusy,
        setErr,
        onError,
        fallbackMsg: "加载模板列表失败",
        fn: async () => await fetchSegmentTemplates(schemeId),
      });
      if (!list) return;

      // list 现在能正确推断为 SegmentTemplateOut[]（路径修正后）
      setTemplates(list);
      const act = list.find((x: SegmentTemplateOut) => x.is_active) ?? null;
      setSelectedTemplateId(act?.id ?? null);
    })();
  }, [schemeId, onError]);

  useEffect(() => {
    (async () => {
      if (!selectedTemplateId) {
        setSelectedTemplate(null);
        setDraftSegments([]);
        return;
      }

      const tpl = await runGuarded({
        setBusy,
        setErr,
        onError,
        fallbackMsg: "加载模板详情失败",
        fn: async () => await fetchSegmentTemplateDetail(selectedTemplateId),
      });
      if (!tpl) return;

      setSelectedTemplate(tpl);

      if (String(tpl.status) === "draft") {
        setDraftSegments(templateItemsToWeightSegments(tpl.items));
      } else {
        setDraftSegments([]);
      }
    })();
  }, [selectedTemplateId, onError]);

  async function createDraftTemplate() {
    if (disabled) return;

    const tpl = await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "新建草稿模板失败",
      fn: async () => await createSegmentTemplate(schemeId, {}),
    });
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新模板列表失败",
      fn: async () => {
        await refreshTemplates(tpl.id);
      },
    });

    setSelectedTemplateId(tpl.id);
    setDraftSegments(initDraftSegments(mirrorSegmentsJson));
  }

  /**
   * ✅ 保存草稿：只 PUT items，不 publish
   * - 为避免 422，提交“连续可用前缀段”（用户没填完也能先存）
   */
  async function saveDraftItems() {
    if (disabled) return;
    if (!selectedTemplate || String(selectedTemplate.status) !== "draft") return;

    const ok = window.confirm("确认保存草稿？\n\n提示：保存草稿不会生效；发布后才可启用。");
    if (!ok) return;

    const items = weightSegmentsToPutItemsDraftPrefix(draftSegments);
    if (items.length === 0) {
      const msg = "请至少先填写第 1 行的 max，然后再保存草稿。";
      setErr(msg);
      onError?.(msg);
      return;
    }

    const tpl = await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "保存草稿失败",
      fn: async () => await apiPutTemplateItems(selectedTemplate.id, items),
    });
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新模板列表失败",
      fn: async () => {
        await refreshTemplates(tpl.id);
      },
    });

    setSelectedTemplate(tpl);
    setDraftSegments(templateItemsToWeightSegments(tpl.items));
  }

  async function publishDraft() {
    if (disabled) return;
    if (!selectedTemplate || String(selectedTemplate.status) !== "draft") return;

    const ok = window.confirm("确认发布该草稿模板？\n\n发布需要结构完整且连续（后端会强校验）。");
    if (!ok) return;

    const tpl = await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "发布模板失败",
      fn: async () => await publishSegmentTemplate(selectedTemplate.id),
    });
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新模板列表失败",
      fn: async () => {
        await refreshTemplates(tpl.id);
      },
    });

    setSelectedTemplate(tpl);
    setDraftSegments([]);
  }

  async function activateTemplate() {
    if (disabled) return;
    if (!selectedTemplate || String(selectedTemplate.status) !== "published") return;

    const ok = window.confirm(
      "确认启用该模板？\n\n启用后：\n- 会同步更新当前方案的表头镜像（segments_json）\n- 会同步更新旧段表（scheme_segments），录价页将立即生效\n",
    );
    if (!ok) return;

    const tpl = await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "启用模板失败",
      fn: async () => await activateSegmentTemplate(selectedTemplate.id),
    });
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新模板列表失败",
      fn: async () => {
        await refreshTemplates(tpl.id);
      },
    });

    setSelectedTemplate(tpl);
  }

  async function toggleActiveItem(item: SegmentTemplateItemOut) {
    if (disabled) return;
    if (!activeTemplate) return;
    if (!item?.id) return;

    const tpl = await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "切换段启用状态失败",
      fn: async () => await patchSegmentTemplateItemActive(item.id, !item.active),
    });
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新模板列表失败",
      fn: async () => {
        await refreshTemplates(activeTemplate.id);
      },
    });

    setSelectedTemplateId(tpl.id);
    setSelectedTemplate(tpl);
  }

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
    actions: {
      createDraftTemplate,
      saveDraftItems, // ✅ 不再自动发布
      publishDraft,
      activateTemplate,
      toggleActiveItem,
    },
  };
}

export default useSegmentTemplateWorkbench;
