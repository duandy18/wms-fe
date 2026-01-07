// src/features/admin/items/components/edit/ItemStatusSection.tsx

import React from "react";
import type { ItemDraft } from "../ItemEditModal";

export const ItemStatusSection: React.FC<{
  draft: ItemDraft;
  saving: boolean;
  onChangeDraft: (next: ItemDraft) => void;
}> = ({ draft, saving, onChangeDraft }) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">状态</div>
      <label className="inline-flex items-center gap-2 text-base">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => onChangeDraft({ ...draft, enabled: e.target.checked })}
          disabled={saving}
        />
        有效
      </label>
      <div className="text-[11px] text-slate-500">
        无效商品禁止新入库、新采购、扫描选择与新增条码绑定；不影响历史记录。
      </div>
    </div>
  );
};

export default ItemStatusSection;
