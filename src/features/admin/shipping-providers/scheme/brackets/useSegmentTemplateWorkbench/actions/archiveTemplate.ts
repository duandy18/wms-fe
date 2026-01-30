// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/archiveTemplate.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { fetchSegmentTemplateDetail } from "../../segmentTemplates";
import { archiveSegmentTemplate } from "../../segmentTemplates/api";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";

function pickNextSelectedId(list: SegmentTemplateOut[]): number | null {
  // 优先：生效版本
  const act = list.find((x) => x.is_active);
  if (act) return act.id;

  // 其次：任意非归档
  const any = list.find((x) => String(x.status ?? "") !== "archived");
  if (any) return any.id;

  // 最后：如果全归档，选最新一条
  return list[0]?.id ?? null;
}

export function makeArchiveTemplate(ctx: WorkbenchActionCtx) {
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

  return async function archiveTemplateAction(templateId: number) {
    if (disabled) return;

    // 1) archive
    const archived = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "归档失败",
      fn: async () => await archiveSegmentTemplate(templateId),
    })) as SegmentTemplateOut | null;
    if (!archived) return;

    // 2) refresh list
    const list = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => await refreshTemplates(selectedTemplate?.id ?? null),
    })) as SegmentTemplateOut[] | null;

    const finalList = list ?? [];
    const selectedId = selectedTemplate?.id ?? null;

    // 如果归档的是当前选中，则切换到更合理的对象
    const nextId = selectedId === templateId ? pickNextSelectedId(finalList) : selectedId;

    if (!nextId) {
      setSelectedTemplateId(null);
      setSelectedTemplate(null);
      setDraftSegments([]);
      return;
    }

    setSelectedTemplateId(nextId);

    // 拉详情，保证右侧一致
    const detail = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "加载方案详情失败",
      fn: async () => await fetchSegmentTemplateDetail(nextId),
    })) as SegmentTemplateOut | null;

    setSelectedTemplate(detail ?? finalList.find((x) => x.id === nextId) ?? null);

    // 右侧编辑区会根据 selectedTemplate.status 决定是否可编辑；这里清空草稿缓存避免漂移
    setDraftSegments([]);
  };
}
