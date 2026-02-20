// src/features/admin/items/editor/sections/BarcodeSection.tsx

import React from "react";
import ItemBarcodesSection from "../../components/edit/ItemBarcodesSection";

const BarcodeSection: React.FC<{ itemId: number; disabled: boolean }> = ({ itemId, disabled }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-900">条码管理</div>
      <div className="text-[11px] text-slate-500">
        编辑商品时，主条码不在上方输入框修改；请在此区块新增/删除/设置主条码。
      </div>
      <ItemBarcodesSection itemId={itemId} disabled={disabled} />
    </div>
  );
};

export default BarcodeSection;
