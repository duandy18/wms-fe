// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/toggleActiveItem.ts

import type { SegmentTemplateItemOut, SegmentTemplateOut } from "../../segmentTemplates";
import { fetchSegmentTemplateDetail, patchSegmentTemplateItemActive } from "../../segmentTemplates";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";

export function makeToggleActiveItem(ctx: WorkbenchActionCtx) {
  const {
    disabled,
    onError,
    activeTemplate,
    setBusy,
    setErr,
    setSelectedTemplateId,
    setSelectedTemplate,
    refreshTemplates,
  } = ctx;

  return async function toggleActiveItem(item: SegmentTemplateItemOut) {
    if (disabled) return;
    if (!activeTemplate) return;
    if (!item?.id) return;

    const tpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "切换段启用状态失败",
      fn: async () => await patchSegmentTemplateItemActive(item.id, !item.active),
    })) as SegmentTemplateOut | null;
    if (!tpl) return;

    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => {
        await refreshTemplates(activeTemplate.id);
      },
    });

    setSelectedTemplateId(tpl.id);

    // 拉详情，保持 UI 一致
    const detail = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "加载方案详情失败",
      fn: async () => await fetchSegmentTemplateDetail(tpl.id),
    })) as SegmentTemplateOut | null;

    setSelectedTemplate(detail ?? tpl);
  };
}
