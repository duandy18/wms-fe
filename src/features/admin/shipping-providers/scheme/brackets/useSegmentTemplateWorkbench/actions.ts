// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions.ts
import type { SegmentTemplateItemOut, SegmentTemplateOut, SchemeWeightSegment } from "../segmentTemplates";
import type { WeightSegment } from "../PricingRuleEditor";

import {
  activateSegmentTemplate,
  apiPutTemplateItems,
  createSegmentTemplate,
  fetchSegmentTemplateDetail,
  patchSegmentTemplateItemActive,
  publishSegmentTemplate,
} from "../segmentTemplates";

import { templateItemsToWeightSegments, weightSegmentsToPutItemsDraftPrefix } from "../SegmentsPanel/utils";
import { initDraftSegments, runGuarded } from "./helpers";

function datePrefix(): string {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function createWorkbenchActions(ctx: {
  schemeId: number;
  mirrorSegmentsJson: SchemeWeightSegment[] | null;
  disabled?: boolean;
  onError?: (msg: string) => void;

  selectedTemplate: SegmentTemplateOut | null;
  draftSegments: WeightSegment[];
  activeTemplate: SegmentTemplateOut | null;

  setBusy: (v: boolean) => void;
  setErr: (v: string | null) => void;
  setSelectedTemplateId: (v: number | null) => void;
  setSelectedTemplate: (v: SegmentTemplateOut | null) => void;
  setDraftSegments: (v: WeightSegment[]) => void;

  refreshTemplates: (keepSelectedId?: number | null) => Promise<SegmentTemplateOut[]>;
}) {
  const {
    schemeId,
    mirrorSegmentsJson,
    disabled,
    onError,
    selectedTemplate,
    draftSegments,
    activeTemplate,
    setBusy,
    setErr,
    setSelectedTemplateId,
    setSelectedTemplate,
    setDraftSegments,
    refreshTemplates,
  } = ctx;

  async function createDraftTemplate() {
    if (disabled) return;

    const dp = datePrefix();
    const raw = window.prompt("请输入方案名称（建议包含日期）", `${dp} 方案`);
    if (raw === null) return;

    const name0 = String(raw).trim();
    const name = name0 ? (/\d{4}-\d{2}-\d{2}/.test(name0) ? name0 : `${dp} ${name0}`) : `${dp} 方案`;

    const tpl = (await runGuarded({
      setBusy,
      setErr,
      onError,
      fallbackMsg: "新建方案失败",
      fn: async () => await createSegmentTemplate(schemeId, { name }),
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

    setSelectedTemplateId(tpl.id);
    setDraftSegments(initDraftSegments(mirrorSegmentsJson));
  }

  async function saveDraftItems() {
    if (disabled) return;
    if (!selectedTemplate || String(selectedTemplate.status) !== "draft") return;

    const ok = window.confirm("确认保存方案？\n\n提示：保存不会影响线上；只有“启用”才会替换当前生效方案。");
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
  }

  async function activateTemplate() {
    if (disabled) return;
    if (!selectedTemplate) return;

    const st = String(selectedTemplate.status);
    if (st === "archived") {
      window.alert("已归档方案不可启用。");
      return;
    }
    if (st !== "draft" && st !== "published") return;

    const ok = window.confirm("确认启用该方案？\n\n启用后将立即替换线上生效方案（录价页立即生效）。");
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
  }

  async function toggleActiveItem(item: SegmentTemplateItemOut) {
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
    setSelectedTemplate(tpl);
  }

  return {
    createDraftTemplate,
    saveDraftItems,
    activateTemplate,
    toggleActiveItem,
  };
}
