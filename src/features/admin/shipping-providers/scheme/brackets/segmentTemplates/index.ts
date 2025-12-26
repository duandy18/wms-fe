// src/features/admin/shipping-providers/scheme/brackets/segmentTemplates/index.ts
export type { SchemeWeightSegment, SegmentTemplateItemOut, SegmentTemplateOut } from "./types";

export {
  activateSegmentTemplate,
  apiPutTemplateItems,
  createSegmentTemplate,
  fetchSegmentTemplateDetail,
  fetchSegmentTemplates,
  patchSegmentTemplateItemActive,
  publishSegmentTemplate,
} from "./api";
