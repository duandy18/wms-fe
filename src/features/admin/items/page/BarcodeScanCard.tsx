// src/features/admin/items/page/BarcodeScanCard.tsx

import React from "react";
import { ScanConsole } from "../../../../components/scan/ScanConsole";

export const BarcodeScanCard: React.FC<{
  onScan: (code: string) => void;
}> = ({ onScan }) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">Items 条码扫描台</h2>
      <p className="text-[11px] text-slate-500">
        扫描任意条码，系统会调用 /scan(mode=pick, probe=true) 做一次条码体检，
        并在下方展示主数据绑定情况。你可以在条码管理卡片中完成绑定或调整。
      </p>

      <ScanConsole
        title="条码扫描（barcode → item）"
        modeLabel="items-page"
        scanMode="auto"
        onScan={onScan}
      />
    </section>
  );
};

export default BarcodeScanCard;
