// src/features/operations/inbound/scan-work/ScanInputCard.tsx

import React from "react";
import { ScanConsole } from "../../../../components/scan/ScanConsole";
import type { InboundCockpitController } from "../types";

export const ScanInputCard: React.FC<{
  c: InboundCockpitController;
  scanQty: number;
  onQtyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: (barcodeRaw: string) => void | Promise<void>;
}> = ({ c, scanQty, onQtyChange, onScan }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">条码 / SKU 输入</h2>
        {c.currentTask ? (
          <span className="text-[11px] text-slate-500">
            当前任务：#{c.currentTask.id}，仓库：{c.currentTask.warehouse_id}
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">未绑定收货任务</span>
        )}
      </div>

      <div className="text-[11px] text-slate-500">
        支持扫码枪或键盘输入（回车提交）。定位到商品行后，请在下方“采购手工收货”录入数量并记录。
      </div>

      <div className="border border-dashed border-slate-300 rounded-lg p-2">
        <ScanConsole
          title="条码 / SKU（回车提交）"
          modeLabel="收货"
          scanMode="auto"
          onScan={onScan}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">本次累加数量</label>
          <input
            type="number"
            min={1}
            className="border rounded-md px-2 py-1 text-xs"
            value={scanQty}
            onChange={onQtyChange}
          />
          <p className="text-[10px] text-slate-500">
            同一条码需要累加多件时，在此填写数量即可。
          </p>
        </div>
      </div>
    </section>
  );
};
