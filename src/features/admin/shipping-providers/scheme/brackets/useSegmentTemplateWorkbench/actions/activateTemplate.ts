// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/activateTemplate.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { activateSegmentTemplate, fetchSegmentTemplateDetail } from "../../segmentTemplates";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";

export function makeActivateTemplate(ctx: WorkbenchActionCtx) {
  const { disabled, onError, selectedTemplate, setBusy, setErr, setSelectedTemplateId, setSelectedTemplate, setDraftSegments, refreshTemplates } = ctx;

  return async function activateTemplate() {
    if (disabled) return;
    if (!selectedTemplate) return;

    const st = String(selectedTemplate.status);

    if (st === "archived") {
      const msg = "已归档方案不可启用。";
      setErr(msg);
      onError?.(msg);
      return;
    }

    // ✅ 刚性：只允许已保存（published）启用为生效（可多条）
    if (st !== "published") {
      const msg = "该方案尚未保存为版本：请先点击“保存”，再设为生效。";
      setErr(msg);
      onError?.(msg);
      return;
    }

    const activated = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "设为生效失败",
      fn: async () => await activateSegmentTemplate(selectedTemplate.id),
    })) as SegmentTemplateOut | null;
    if (!activated) return;

    // ✅ 刷新列表（保持选中为“刚启用”的模板）
    await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => await refreshTemplates(activated.id),
    });

    // ✅ 载入刚启用模板详情（不再跳转到“第一条 active”）
    const detail = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "加载启用方案详情失败",
      fn: async () => await fetchSegmentTemplateDetail(activated.id),
    })) as SegmentTemplateOut | null;

    setSelectedTemplateId(activated.id);
    setSelectedTemplate(detail ?? activated);

    // 启用后：清空草稿编辑缓存（右侧编辑器会以当前选中模板重新加载）
    setDraftSegments([]);
  };
}
