// src/features/admin/items/sku-builder/hooks/useSkuBuilderState.ts
//
// SkuBuilderPanel 状态 / orchestration
// - 首次从 localStorage 读
// - 任意字段变化写回
// - 计算 preview 与 canApply
// - apply / apply&next

import { useEffect, useMemo, useState } from "react";
import type { LastState } from "../types";
import { DEFAULT_STATE } from "../types";
import { loadLastState, saveLastState } from "../storage";
import { nextSeq } from "../seq";

function buildPreview(state: LastState): string {
  const parts: string[] = [];

  if (state.brand.trim()) parts.push(state.brand.trim());
  if (state.species.trim()) parts.push(state.species.trim());
  if (state.flavor.trim()) parts.push(state.flavor.trim());

  const w = state.weight.trim();
  const u = state.unit.trim();
  if (w) {
    parts.push(u ? `${w}${u}` : w);
  }

  const prefix = parts.join("-");
  const seqPart = state.seq.trim();
  if (!prefix && !seqPart) return "";

  return seqPart ? `${prefix}-${seqPart}` : prefix;
}

export function useSkuBuilderState() {
  const [state, setState] = useState<LastState>({ ...DEFAULT_STATE });

  // 首次挂载：从 localStorage 恢复
  useEffect(() => {
    const last = loadLastState();
    setState(last);
  }, []);

  // 任意字段变化：写回 localStorage
  useEffect(() => {
    saveLastState(state);
  }, [state]);

  const preview = useMemo(() => buildPreview(state), [state]);

  const canApply = !!preview.trim();

  function patch(p: Partial<LastState>) {
    setState((prev) => ({ ...prev, ...p }));
  }

  function apply(onApplySku: (sku: string) => void) {
    const v = preview.trim();
    if (!v) return;
    onApplySku(v);
  }

  function applyAndNext(onApplySku: (sku: string) => void) {
    const v = preview.trim();
    if (!v) return;
    onApplySku(v);
    setState((prev) => ({ ...prev, seq: nextSeq(prev.seq) }));
  }

  return {
    state,
    patch,
    preview,
    canApply,
    apply,
    applyAndNext,
  };
}

export default useSkuBuilderState;
