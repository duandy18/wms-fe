// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/saveDraftItems.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { apiPutTemplateItems } from "../../segmentTemplates";
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
    setSelectedTemplate,
    setDraftSegments,
    refreshTemplates,
  } = ctx;

  return async function saveDraftItems() {
    if (disabled) return;
    if (!selectedTemplate || String(selectedTemplate.status) !== "draft") return;

    const ok = window.confirm("确认保存方案？\n\n提示：保存不会影响线上；只有“启用为当前生效”才会替换当前生效方案。");
    if (!ok) return;

    const items = weightSegmentsToPutItemsDraftPrefix(draftSegments);
    if (items.length === 0) {
      const msg = "请至少先填写第 1 行的 max，然后再保存。";
      setErr(msg);
      onError?.(msg);
      return;
    }

    const tpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "保存方案失败",
      fn: async () => await apiPutTemplateItems(selectedTemplate.id, items),
    })) as SegmentTemplateOut | null;
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => {
        await refreshTemplates(tpl.id);
      },
    });

    setSelectedTemplate(tpl);
    setDraftSegments(templateItemsToWeightSegments(tpl.items));
  };
}
