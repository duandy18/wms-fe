// src/features/admin/shipping-providers/scheme/workbench/SuccessBar.tsx

import React from "react";

export const SuccessBar: React.FC<{
  msg: string | null;
  onClose: () => void;
}> = ({ msg, onClose }) => {
  if (!msg) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <div className="min-w-0">{msg}</div>
      <button
        type="button"
        className="shrink-0 text-emerald-800/70 hover:text-emerald-900"
        onClick={onClose}
        aria-label="关闭提示"
        title="关闭"
      >
        ×
      </button>
    </div>
  );
};

export default SuccessBar;
