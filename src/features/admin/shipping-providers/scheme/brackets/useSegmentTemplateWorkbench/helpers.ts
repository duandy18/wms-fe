// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/helpers.ts
//
// 拆分 useSegmentTemplateWorkbench：
// - 默认草稿行策略（新建方案时自动出现几行）
// - 统一 try/catch 包装，减少主文件体积

import type { SchemeWeightSegment } from "../segmentTemplates";
import type { WeightSegment } from "../PricingRuleEditor";
import { segmentsJsonToWeightSegments } from "../SegmentsPanel/utils";

export function defaultDraftSegments(): WeightSegment[] {
  // 默认给 3 行，且 max 都有值（避免“空 max = ∞”导致后续行为被锁死）
  return [
    { min: "0", max: "1" },
    { min: "", max: "2" },
    { min: "", max: "3" },
  ];
}

export function initDraftSegments(mirrorSegmentsJson: SchemeWeightSegment[] | null): WeightSegment[] {
  const fromMirror = segmentsJsonToWeightSegments(mirrorSegmentsJson);
  if (fromMirror.length > 0) return fromMirror;
  return defaultDraftSegments();
}

export async function runGuarded<T>(args: {
  setBusy: (v: boolean) => void;
  setErr: (v: string | null) => void;
  onError?: (msg: string) => void;
  fallbackMsg: string;
  fn: () => Promise<T>;
}): Promise<T | null> {
  const { setBusy, setErr, onError, fallbackMsg, fn } = args;
  try {
    setBusy(true);
    setErr(null);
    return await fn();
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? fallbackMsg;
    setErr(msg);
    onError?.(msg);
    return null;
  } finally {
    setBusy(false);
  }
}
