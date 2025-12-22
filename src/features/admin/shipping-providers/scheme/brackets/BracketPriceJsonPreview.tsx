// src/features/admin/shipping-providers/scheme/brackets/BracketPriceJsonPreview.tsx
import React from "react";

export const BracketPriceJsonPreview: React.FC<{ value: Record<string, unknown> }> = ({ value }) => {
  return (
    <>
      <div className="mt-2 text-sm text-slate-600">
        本表单优先写入结构化字段（pricing_mode / base_amount / rate_per_kg / rounding_*），同时生成镜像 price_json 便于审计与兼容。
      </div>

      <pre className="mt-2 overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </>
  );
};
