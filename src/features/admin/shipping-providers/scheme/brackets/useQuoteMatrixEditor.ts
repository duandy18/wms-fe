// src/features/admin/shipping-providers/scheme/brackets/useQuoteMatrixEditor.ts
//
// QuoteMatrix 编辑状态管理（Hook）
// - 管理：editing / editingDraft
// - 提供：openEditor / saveEditor / cancelEditor / editingKey
// - 保留原有行为：
//   * disabled 或 busy 时不允许打开
//   * schemeMode 变化时不强行覆盖用户正在编辑的 mode，只做安全兜底

import { useEffect, useMemo, useState } from "react";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { QuoteColumn } from "./quoteMatrixUtils";
import type { RowDraft } from "./quoteModel";
import { defaultDraft } from "./quoteModel";

export type EditingCell = {
  zoneId: number;
  key: string;
  min: number;
  max: number | null;
};

export function useQuoteMatrixEditor(args: {
  schemeMode: SchemeDefaultPricingMode;
  busy: boolean;
  disabled: boolean;

  draftsByZoneId: Record<number, Record<string, RowDraft>>;

  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;
}) {
  const { schemeMode, busy, disabled, draftsByZoneId, onUpsertCell } = args;

  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [editingDraft, setEditingDraft] = useState<RowDraft>(defaultDraft(schemeMode));

  function openEditor(zoneId: number, col: QuoteColumn) {
    if (disabled) return;
    if (busy) return;
    if (!col.valid || !col.key) return;

    const rowDrafts = draftsByZoneId[zoneId] ?? {};
    const d = rowDrafts[col.key] ?? null;

    setEditingDraft(d ? d : defaultDraft(schemeMode));
    setEditing({ zoneId, key: col.key, min: col.min, max: col.max });
  }

  async function saveEditor() {
    if (!editing) return;
    if (disabled) return;

    await onUpsertCell({
      zoneId: editing.zoneId,
      min: editing.min,
      max: editing.max,
      draft: editingDraft,
    });

    setEditing(null);
  }

  function cancelEditor() {
    setEditing(null);
  }

  const editingKey = useMemo(() => {
    if (!editing) return null;
    return { zoneId: editing.zoneId, key: editing.key };
  }, [editing]);

  // schemeMode 变化时：不强行覆盖当前 draft（只做兜底）
  useEffect(() => {
    setEditingDraft((prev) => (prev ? { ...prev, mode: prev.mode } : defaultDraft(schemeMode)));
  }, [schemeMode]);

  return {
    editing,
    editingKey,
    editingDraft,
    setEditingDraft,
    openEditor,
    saveEditor,
    cancelEditor,
  };
}

export default useQuoteMatrixEditor;
