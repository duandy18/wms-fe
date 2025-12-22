// src/features/dev/shipping-pricing/components/LabRawJsonCard.tsx

import React from "react";
import { safeJson } from "../labUtils";

export const LabRawJsonCard: React.FC<{ title: string; data: unknown }> = ({ title, data }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-700">
        {safeJson(data)}
      </pre>
    </div>
  );
};

export default LabRawJsonCard;
