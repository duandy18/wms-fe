import React from "react";
import { ScanConsole } from "../../../shared/scan/ui/ScanConsole";

type Props = {
  onScanConsole: (barcode: string) => void;
};

export const OutboundPickScanPanel: React.FC<Props> = ({
  onScanConsole,
}) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">拣货扫码台</h2>
      <ScanConsole
        title="扫码拣货"
        modeLabel="pick"
        onScan={onScanConsole}
      />
    </section>
  );
};
