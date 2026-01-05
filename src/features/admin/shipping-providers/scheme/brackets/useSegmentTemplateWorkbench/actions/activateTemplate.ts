// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/activateTemplate.ts

import type { SegmentTemplateOut } from "../../segmentTemplates";
import { activateSegmentTemplate, fetchSegmentTemplateDetail, publishSegmentTemplate } from "../../segmentTemplates";
import { runGuarded } from "../helpers";
import type { WorkbenchActionCtx } from "./types";

export function makeActivateTemplate(ctx: WorkbenchActionCtx) {
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

  return async function activateTemplate() {
    if (disabled) return;
    if (!selectedTemplate) return;

    const st = String(selectedTemplate.status);
    if (st === "archived") {
      window.alert("已归档方案不可启用。");
      return;
    }
    if (st !== "draft" && st !== "published") return;

    const ok = window.confirm("确认启用该方案？\n\n启用后将立即替换线上生效方案。");
    if (!ok) return;

    let tpl: SegmentTemplateOut | null = selectedTemplate;

    if (st === "draft") {
      tpl = (await runGuarded({
        setBusy,
        setErr,
        onError,
        fallbackMsg: "启用失败：自动发布方案失败",
        fn: async () => await publishSegmentTemplate(selectedTemplate.id),
      })) as SegmentTemplateOut | null;
      if (!tpl) return;
    }

    const activated = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "启用方案失败",
      fn: async () => await activateSegmentTemplate((tpl as SegmentTemplateOut).id),
    })) as SegmentTemplateOut | null;
    if (!activated) return;

    const list = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "刷新方案列表失败",
      fn: async () => await refreshTemplates(activated.id),
    })) as SegmentTemplateOut[] | null;

    const act = (list ?? []).find((x) => x.is_active) ?? null;
    if (act) {
      setSelectedTemplateId(act.id);

      const detail = (await runGuarded({
        setBusy,
        setErr,
        onError,
        fallbackMsg: "加载启用方案详情失败",
        fn: async () => await fetchSegmentTemplateDetail(act.id),
      })) as SegmentTemplateOut | null;

      setSelectedTemplate(detail ?? act);
    } else {
      setSelectedTemplateId(activated.id);
      setSelectedTemplate(activated);
    }

    setDraftSegments([]);
  };
}
