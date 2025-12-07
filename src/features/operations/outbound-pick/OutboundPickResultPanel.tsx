// src/features/operations/outbound-pick/OutboundPickResultPanel.tsx
//
// 最近一次 ScanResponse 展示 Panel

import React from "react";
import type { ScanResponse } from "../scan/api";

type Props = {
  result: ScanResponse | null;
};

export const OutboundPickResultPanel: React.FC<Props> = ({ result }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <h2 className="text-sm font-semibold text-slate-800">
        最近一次 ScanResponse
      </h2>
      {result ? (
        <pre className="text-xs bg-slate-50 rounded-md p-2 overflow-auto max-h-60">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        <p className="text-xs text-slate-500">暂无结果。</p>
      )}
    </section>
  );
};
