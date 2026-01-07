// src/features/admin/items/components/edit/ModalShell.tsx

import React from "react";

export const ModalShell: React.FC<{
  open: boolean;
  title: string;
  saving: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, saving, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto space-y-5 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="text-slate-500 hover:text-slate-800"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ModalShell;
