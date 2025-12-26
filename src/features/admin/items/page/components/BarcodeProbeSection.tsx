// src/features/admin/items/page/components/BarcodeProbeSection.tsx

import React from "react";
import { UI } from "../ui";
import type { BindInfo, ProbeInfo, ScanProbeError, ScanProbeResponse } from "../types";

export const BarcodeProbeSection: React.FC<{
  scannedBarcode: string;
  owners: number[];

  bindInfo: BindInfo | null;

  probeLoading: boolean;
  probeError: string | null;
  probeResult: ScanProbeResponse | null;
  probeInfo: ProbeInfo | null;
}> = ({ scannedBarcode, owners, bindInfo, probeLoading, probeError, probeResult, probeInfo }) => {
  return (
    <section className="space-y-2">
      <div className={UI.infoBoxSky}>
        <div>
          当前条码： <span className={UI.mono}>{scannedBarcode}</span>
        </div>
        {bindInfo ? <div>{bindInfo.msg}</div> : null}
      </div>

      <div className={UI.infoBox}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800">条码体检（/scan probe）</span>
          {probeLoading ? <span className={UI.hint11}>调用 /scan 中…</span> : null}
        </div>

        {probeError ? <div className={UI.errText}>{probeError}</div> : null}

        {probeResult ? (
          <>
            <div>
              后端解析 item_id： <span className={UI.mono}>{probeResult.item_id ?? "(未解析)"}</span>
            </div>
            <div>
              主数据绑定 item_ids： <span className={UI.mono}>{owners.length ? owners.join(", ") : "(无)"}</span>
            </div>

            {probeInfo ? (
              <div className={probeInfo.level === "ok" ? UI.okText : probeInfo.level === "warn" ? UI.warnText : "text-red-700"}>
                {probeInfo.msg}
              </div>
            ) : null}

            {probeResult.errors && probeResult.errors.length > 0 ? (
              <div className={UI.errText}>
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
          <div className={UI.hint11}>尚未拿到 /scan 体检结果。</div>
        ) : null}
      </div>
    </section>
  );
};

export default BarcodeProbeSection;
