// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/unarchiveTemplate.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { fetchSegmentTemplateDetail } from "../../segmentTemplates";
import { unarchiveSegmentTemplate } from "../../segmentTemplates/api";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";

export function makeUnarchiveTemplate(ctx: WorkbenchActionCtx) {
  const {
    disabled,
    onError,
    selectedTemplate,
    setBusy,
    setErr,
    setSelectedTemplateId,
    setSelectedTemplate,
    setDraftSegments,
    refreshTemplates,
  } = ctx;

  return async function unarchiveTemplateAction(templateId: number) {
    if (disabled) return;

    // 1) unarchive
    const unarchived = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "取消归档失败",
      fn: async () => await unarchiveSegmentTemplate(templateId),
    })) as SegmentTemplateOut | null;
    if (!unarchived) return;

    const keepId = unarchived.id ?? null;

    // 2) refresh list（保持选中该模板）
    const list = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => await refreshTemplates(keepId),
    })) as SegmentTemplateOut[] | null;

    const finalList = list ?? [];
    const nextId = keepId ?? selectedTemplate?.id ?? null;

    if (!nextId) {
      setSelectedTemplateId(null);
      setSelectedTemplate(null);
      setDraftSegments([]);
      return;
    }

    setSelectedTemplateId(nextId);

    // 3) 拉详情，保证右侧一致
    const detail = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "加载方案详情失败",
      fn: async () => await fetchSegmentTemplateDetail(nextId),
    })) as SegmentTemplateOut | null;

    setSelectedTemplate(detail ?? finalList.find((x) => x.id === nextId) ?? null);

    // 4) 清空草稿缓存避免漂移
    setDraftSegments([]);
  };
}
