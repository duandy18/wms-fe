// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/cloneSelectedToDraft.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { apiPutTemplateItems, createSegmentTemplate, fetchSegmentTemplateDetail } from "../../segmentTemplates";
import { templateItemsToWeightSegments } from "../../SegmentsPanel/utils";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";
import { datePrefix, safeName, sortItems } from "./shared";

function timeSuffixHHmm(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}${mm}`;
}

export function makeCloneSelectedToDraft(ctx: WorkbenchActionCtx) {
  const {
    schemeId,
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

  return async function cloneSelectedToDraft() {
    if (disabled) return;
    if (!selectedTemplate) return;

    const st = String(selectedTemplate.status ?? "");
    if (st === "draft") {
      // ✅ 不弹窗：用页内错误通道表达“无需复制”
      const msg = "当前已是草稿方案，无需复制，可直接编辑。";
      setErr(msg);
      onError?.(msg);
      return;
    }

    const baseName = safeName(selectedTemplate.name) || "方案";
    const dp = datePrefix();
    const name = `${dp} ${baseName}（草稿） ${timeSuffixHHmm()}`;

    // 1) 新建空模板（draft）
    const draftTpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "复制为草稿失败：新建草稿方案失败",
      fn: async () => await createSegmentTemplate(schemeId, { name }),
    })) as SegmentTemplateOut | null;
    if (!draftTpl) return;

    // 2) 写入 items（过滤 active=false 的段）
    const srcItems = sortItems((selectedTemplate.items ?? []).filter((it) => it.active !== false));

    // ord 必须从 0 连续
    const putItems = srcItems.map((it, idx) => ({
      ord: idx,
      min_kg: it.min_kg,
      max_kg: it.max_kg ?? null,
      active: true,
    }));

    const filledTpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "复制为草稿失败：写入重量段失败",
      fn: async () => await apiPutTemplateItems(draftTpl.id, putItems),
    })) as SegmentTemplateOut | null;
    if (!filledTpl) return;

    // 3) 刷新列表并选中新草稿
    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => {
        await refreshTemplates(filledTpl.id);
      },
    });

    setSelectedTemplateId(filledTpl.id);

    // 4) 拉详情并进入可编辑分支
    const detail = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "加载草稿方案详情失败",
      fn: async () => await fetchSegmentTemplateDetail(filledTpl.id),
    })) as SegmentTemplateOut | null;

    const tpl = detail ?? filledTpl;
    setSelectedTemplate(tpl);
    setDraftSegments(templateItemsToWeightSegments(tpl.items));
  };
}
