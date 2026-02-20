// src/features/admin/items/editor/sections/FlashBar.tsx

import React from "react";
import type { Flash } from "../schema";

const FlashBar: React.FC<{ flash: Flash }> = ({ flash }) => {
  if (!flash) return null;

  return (
    <div
      className={
        flash.kind === "success"
          ? "rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          : "rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      }
      role="status"
    >
      {flash.text}
    </div>
  );
};

export default FlashBar;
