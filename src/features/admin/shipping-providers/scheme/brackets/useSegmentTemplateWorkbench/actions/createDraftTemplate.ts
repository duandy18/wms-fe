// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/createDraftTemplate.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { apiPutTemplateItems, createSegmentTemplate } from "../../segmentTemplates";
import { templateItemsToWeightSegments, weightSegmentsToPutItemsDraftPrefix } from "../../SegmentsPanel/utils";
import { initDraftSegments, runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";
import { datePrefix } from "./shared";

export function makeCreateDraftTemplate(ctx: WorkbenchActionCtx) {
  const {
    schemeId,
    mirrorSegmentsJson,
    disabled,
    onError,
    setBusy,
    setErr,
    setSelectedTemplateId,
    setSelectedTemplate,
    setDraftSegments,
    refreshTemplates,
  } = ctx;

  return async function createDraftTemplate(nameInput?: string) {
    if (disabled) return;

    const dp = datePrefix();
    const raw = String(nameInput ?? "").trim();

    // ✅ 命名规则：保持“日期前缀收敛”
    // - 用户不填：用默认
    // - 用户填但没带日期：自动补日期前缀
    const name0 = raw;
    const name = name0
      ? /\d{4}-\d{2}-\d{2}/.test(name0)
        ? name0
        : `${dp} ${name0}`
      : `${dp} 方案`;

    // 1) 新建空模板（draft 壳子）
    const tpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "新建方案失败",
      fn: async () => await createSegmentTemplate(schemeId, { name }),
    })) as SegmentTemplateOut | null;
    if (!tpl) return;

    // 2) 写入默认段
    const defaults = initDraftSegments(mirrorSegmentsJson);
    const putItems = weightSegmentsToPutItemsDraftPrefix(defaults);

    const filledTpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "初始化草稿段失败",
      fn: async () => await apiPutTemplateItems(tpl.id, putItems),
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
    setSelectedTemplate(filledTpl);
    setDraftSegments(templateItemsToWeightSegments(filledTpl.items));
  };
}
