// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/saveDraftItems.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { apiPutTemplateItems, fetchSegmentTemplateDetail, publishSegmentTemplate } from "../../segmentTemplates";
import { templateItemsToWeightSegments, weightSegmentsToPutItemsDraftPrefix } from "../../SegmentsPanel/utils";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";

export function makeSaveDraftItems(ctx: WorkbenchActionCtx) {
  const {
    disabled,
    onError,
    selectedTemplate,
    draftSegments,
    setBusy,
    setErr,
    setSelectedTemplateId,
    setSelectedTemplate,
    setDraftSegments,
    refreshTemplates,
  } = ctx;

  return async function saveDraftItems() {
    if (disabled) return;
    if (!selectedTemplate) return;

    const st = String(selectedTemplate.status);
    if (st !== "draft") return;

    // ✅ 保存草稿：不弹窗确认（不影响线上事实）
    const items = weightSegmentsToPutItemsDraftPrefix(draftSegments);
    if (items.length === 0) {
      const msg = "请至少先填写第 1 行的 max，然后再保存。";
      setErr(msg);
      onError?.(msg);
      return;
    }

    // 1) PUT items：写入草稿内容
    const putOut = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "保存失败：写入重量段失败",
      fn: async () => await apiPutTemplateItems(selectedTemplate.id, items),
    })) as SegmentTemplateOut | null;
    if (!putOut) return;

    // 2) publish：把草稿冻结为“已保存版本”
    const published = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "保存失败：发布版本失败",
      fn: async () => await publishSegmentTemplate(putOut.id),
    })) as SegmentTemplateOut | null;
    if (!published) return;

    // 3) 刷新列表，保持选中
    const list = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => await refreshTemplates(published.id),
    })) as SegmentTemplateOut[] | null;

    // 4) 拉详情（确保 items/status 一致）
    const detail = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "加载方案详情失败",
      fn: async () => await fetchSegmentTemplateDetail(published.id),
    })) as SegmentTemplateOut | null;

    const finalTpl = detail ?? (list ?? []).find((x) => x.id === published.id) ?? published;

    setSelectedTemplateId(finalTpl.id);
    setSelectedTemplate(finalTpl);
    setDraftSegments(templateItemsToWeightSegments(finalTpl.items));
  };
}
