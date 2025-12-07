// src/features/operations/scan/ScanPickScanPanel.tsx

import React from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { ParsedBarcode } from "./barcodeParser";

type ScanMode = "fill" | "auto";

type Props = {
  scanMode: ScanMode;
  onChangeScanMode: (mode: ScanMode) => void;
  onScan: (barcode: string) => void;
  onScanParsed: (parsed: ParsedBarcode) => void;
};

export const ScanPickScanPanel: React.FC<Props> = ({
  scanMode,
  onChangeScanMode,
  onScan,
  onScanParsed,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          拣货扫码台（mode=pick）
        </h2>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>扫描模式：</span>
          <select
            className="rounded border border-slate-300 px-2 py-1 text-[11px]"
            value={scanMode}
            onChange={(e) => onChangeScanMode(e.target.value as ScanMode)}
          >
            <option value="auto">自动提交（推荐）</option>
            <option value="fill">填表模式（只解析，不提交）</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        自动提交：解析条码后立即调用 /scan pick；填表模式：仅解析并回填表单，由人工点击“提交拣货”。
      </div>

      <div className="border border-dashed border-slate-300 rounded-lg p-2 mt-2">
        <ScanConsole
          title="拣货扫码台"
          modeLabel="拣货（pick）"
          scanMode={scanMode}
          onScan={onScan}
          onParsedFields={onScanParsed}
        />
      </div>
    </section>
  );
};
