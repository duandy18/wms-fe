// src/features/purchase-orders/createV2/presenter/useLinesDraft.ts

import { useState } from "react";
import type { ItemBasic } from "../../../../master-data/itemsApi";
import type { LineDraft } from "../lineDraft";
import { applySelectedItemToLine, makeEmptyLine } from "../lineDraft";

export function useLinesDraft(itemOptions: ItemBasic[]): {
  lines: LineDraft[];
  setLines: React.Dispatch<React.SetStateAction<LineDraft[]>>;
  selectItemForLine: (lineId: number, itemId: number | null) => void;
  changeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  addLine: () => void;
  removeLine: (lineId: number) => void;
  resetLines: () => void;
} {
  const [lines, setLines] = useState<LineDraft[]>([
    makeEmptyLine(1),
    makeEmptyLine(2),
    makeEmptyLine(3),
  ]);

  const selectItemForLine = (lineId: number, itemId: number | null) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? applySelectedItemToLine(l, itemOptions, itemId) : l)),
    );
  };

  const changeLineField = (lineId: number, field: keyof LineDraft, value: string) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)));
  };

  const addLine = () => {
    setLines((prev) => [...prev, makeEmptyLine(prev.length + 1)]);
  };

  const removeLine = (lineId: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== lineId)));
  };

  const resetLines = () => {
    setLines([makeEmptyLine(1), makeEmptyLine(2), makeEmptyLine(3)]);
  };

  return {
    lines,
    setLines,
    selectItemForLine,
    changeLineField,
    addLine,
    removeLine,
    resetLines,
  };
}
