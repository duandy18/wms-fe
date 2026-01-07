// src/features/admin/items/page/ProbeResultSection.tsx

import React from "react";
import type { BindInfo, ProbeInfo, ScanProbeResponse, ScanProbeError } from "./types";

export const ProbeResultSection: React.FC<{
  scannedBarcode: string;
  bindInfo: BindInfo | null;

  probeLoading: boolean;
  probeError: string | null;
  probeResult: ScanProbeResponse | null;
  probeInfo: ProbeInfo | null;

  barcodeOwners: Record<string, number[]>;
}> = ({
  scannedBarcode,
  bindInfo,
  probeLoading,
  probeError,
  probeResult,
  probeInfo,
  barcodeOwners,
}) => {
  return (
    <section className="space-y-2">
      <div className="space-y-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-800">
        <div>
          当前条码： <span className="font-mono">{scannedBarcode}</span>
        </div>
        {bindInfo && <div>{bindInfo.msg}</div>}
      </div>

      <div className="space-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800">条码体检（/scan probe）</span>
          {probeLoading && <span className="text-[11px] text-slate-500">调用 /scan 中…</span>}
        </div>

        {probeError && <div className="mt-1 text-[11px] text-red-600">{probeError}</div>}

        {probeResult ? (
          <>
            <div>
              后端解析 item_id：{" "}
              <span className="font-mono">{probeResult.item_id ?? "(未解析)"}</span>
            </div>
            <div>
              主数据绑定 item_ids：{" "}
              <span className="font-mono">
                {(barcodeOwners[scannedBarcode] || []).length > 0
                  ? (barcodeOwners[scannedBarcode] || []).join(", ")
                  : "(无)"}
              </span>
            </div>

            {probeInfo ? (
              <div
                className={
                  "mt-1 " +
                  (probeInfo.level === "ok"
                    ? "text-emerald-700"
                    : probeInfo.level === "warn"
                    ? "text-amber-700"
                    : "text-red-700")
                }
              >
                {probeInfo.msg}
              </div>
            ) : null}

            {probeResult.errors && probeResult.errors.length > 0 ? (
              <div className="mt-1 text-[11px] text-red-600">
                /scan 报告错误：
                {probeResult.errors.map((e: ScanProbeError, idx: number) => (
                  <div key={idx}>
                    [{e.stage ?? "stage"}] {e.error ?? ""}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : !probeError && !probeLoading ? (
          <div className="mt-1 text-[11px] text-slate-500">尚未拿到 /scan 体检结果。</div>
        ) : null}
      </div>
    </section>
  );
};

export default ProbeResultSection;
