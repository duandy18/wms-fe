// src/features/admin/items/barcodes-panel/PanelHeader.tsx

import React from "react";

export const PanelHeader: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-semibold text-slate-800">条码管理</h3>
      <button
        type="button"
        onClick={onClose}
        className="rounded border border-slate-300 px-4 py-2 text-base hover:bg-slate-50"
      >
        关闭
      </button>
    </div>
  );
};

export default PanelHeader;
