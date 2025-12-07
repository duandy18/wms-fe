// src/features/operations/outbound-pick/OutboundPickScanPanel.tsx
//
// 扫码拣货 Panel：只渲染 ScanConsole，不关心后端逻辑。

import React from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";

type Props = {
  onScanConsole: (barcode: string) => void;
};

export const OutboundPickScanPanel: React.FC<Props> = ({
  onScanConsole,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">拣货扫码台</h2>
      <ScanConsole
        title="扫码拣货"
        modeLabel="pick"
        onScan={onScanConsole}
      />
    </section>
  );
};
