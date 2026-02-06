// src/features/system/shop-bundles/components/FskuBuildWorkspace.tsx
import React, { useMemo } from "react";
import type { FskuStatus } from "../types";
import { useFskuComponents } from "../useFskuComponents";
import { useItemsPicker } from "../useItemsPicker";

// ⛔️ build 目录被 .gitignore 忽略，不能作为业务代码目录
// ✅ 已迁移至 workspace/
import { ComponentsCard } from "./workspace/ComponentsCard";
import { ItemsPickerCard } from "./workspace/ItemsPickerCard";

export const FskuBuildWorkspace: React.FC<{
  fskuId: number | null;
  status: FskuStatus | null;
  onCreateDraft: (args: {
    name: string;
    shape: "bundle" | "single";
    codeText: string;
  }) => Promise<{ id: number; name: string }>;
  onPublishSelected: (id: number) => Promise<void>;
}> = ({ fskuId, status, onCreateDraft, onPublishSelected }) => {
  const readOnly = status === "published" || status === "retired";

  const C = useFskuComponents(fskuId);
  const I = useItemsPicker();

  const selectedItemIds = useMemo(() => {
    const s = new Set<number>();
    for (const r of C.components) {
      if (typeof r.item_id === "number") s.add(r.item_id);
    }
    return s;
  }, [C.components]);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ComponentsCard fskuId={fskuId} status={status} C={C} items={I.items} onCreateDraft={onCreateDraft} onPublishSelected={onPublishSelected} />

      <ItemsPickerCard fskuId={fskuId} readOnly={readOnly} I={I} C={C} selectedItemIds={selectedItemIds} />
    </div>
  );
};
