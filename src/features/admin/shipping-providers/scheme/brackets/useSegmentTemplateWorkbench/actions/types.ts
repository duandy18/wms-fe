// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/types.ts

import type { SegmentTemplateOut, SchemeWeightSegment, SegmentTemplateItemOut } from "../../segmentTemplates";
import type { WeightSegment } from "../../PricingRuleEditor";

export type WorkbenchActionCtx = {
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
};

export type WorkbenchActions = {
  createDraftTemplate: (name?: string) => Promise<void>;
  cloneSelectedToDraft: () => Promise<void>;
  saveDraftItems: () => Promise<void>;
  activateTemplate: () => Promise<void>;
  toggleActiveItem: (item: SegmentTemplateItemOut) => Promise<void>;

  // ✅ 归档（只允许 published 且非 active；后端也会再挡一层）
  archiveTemplate: (templateId: number) => Promise<void>;

  // ✅ 取消归档（只允许 archived；取消后回到 published）
  unarchiveTemplate: (templateId: number) => Promise<void>;
};
