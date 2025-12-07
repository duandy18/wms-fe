// src/features/operations/scan/ScanCountResultPanel.tsx

import React from "react";
import type { ScanResponse } from "./api";

type Props = {
  result: ScanResponse | null;
};

export const ScanCountResultPanel: React.FC<Props> = ({ result }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <h2 className="text-sm font-semibold text-slate-800">
        最近一次 ScanResponse
      </h2>
      {result ? (
        <>
          <div className="text-xs text-slate-700 space-y-1">
            <div>
              scan_ref:{" "}
              <span className="font-mono">{result.scan_ref}</span> · ok=
              {String(result.ok)} · committed=
              {String(result.committed)} · source={result.source}
            </div>

            <div className="flex items-center gap-3 pt-1">
              {result.scan_ref && (
                <a
                  href={`/diagnostics/trace?trace_id=${encodeURIComponent(
                    result.scan_ref,
                  )}`}
                  className="inline-flex items-center rounded-lg border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  查看链路（Trace）
                </a>
              )}

              {result.item_id && result.item_id > 0 && (
                <a
                  href={`/inventory/snapshot?item_id=${result.item_id}`}
                  className="inline-flex items-center rounded-lg border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  查看库存（Snapshot）
                </a>
              )}
            </div>
          </div>

          <pre className="bg-slate-50 p-3 rounded text-[11px] whitespace-pre-wrap break-all max-h-64 overflow-auto mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      ) : (
        <div className="text-xs text-slate-500">
          暂无结果，提交一次盘点后会显示。
        </div>
      )}
    </section>
  );
};
