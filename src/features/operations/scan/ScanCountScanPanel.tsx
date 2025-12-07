// src/features/operations/scan/ScanCountScanPanel.tsx

import React from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { ParsedBarcode } from "./barcodeParser";

type ScanMode = "fill" | "auto";

type Props = {
  scanMode: ScanMode;
  onChangeScanMode: (m: ScanMode) => void;
  onScan: (barcode: string) => void;
  onScanParsed: (parsed: ParsedBarcode) => void;
};

export const ScanCountScanPanel: React.FC<Props> = ({
  scanMode,
  onChangeScanMode,
  onScan,
  onScanParsed,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          盘点扫码台（mode=count）
        </h2>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>扫描模式：</span>
          <select
            className="rounded border border-slate-300 px-2 py-1 text-[11px]"
            value={scanMode}
            onChange={(e) => onChangeScanMode(e.target.value as ScanMode)}
          >
            <option value="fill">填表模式（只解析，不提交）</option>
            <option value="auto">自动提交（解析 + 调用 /scan）</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        填表模式：仅解析条码并回填表单；自动提交模式：解析后自动调用
        /scan count。
      </div>

      <div className="border border-dashed border-slate-300 rounded-lg p-2 mt-2">
        <ScanConsole
          title="盘点扫码台"
          modeLabel="盘点（count）"
          scanMode={scanMode}
          onScan={onScan}
          onParsedFields={onScanParsed}
        />
      </div>
    </section>
  );
};
