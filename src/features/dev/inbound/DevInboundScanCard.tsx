// src/features/dev/inbound/DevInboundScanCard.tsx
// 收货扫码 + 批次/日期覆盖（使用原生日历控件）

import React, { useState } from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { DevInboundController } from "./types";
import type { ParsedBarcode } from "../../operations/scan/barcodeParser";

interface Props {
  c: DevInboundController;
}

// 扩展后的 ParsedBarcode，增加生产/到期日期字段
type ParsedBarcodeWithDates = ParsedBarcode & {
  production_date?: string | null;
  expiry_date?: string | null;
};

export const DevInboundScanCard: React.FC<Props> = ({ c }) => {
  const [batchCode, setBatchCode] = useState("");
  const [productionDate, setProductionDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const handleParsed = (parsed: ParsedBarcode) => {
    const parsedWithDates = parsed as ParsedBarcodeWithDates;

    const parsedBatch = parsed.batch_code ?? "";
    const parsedProd = parsedWithDates.production_date ?? undefined;
    const parsedExp = parsedWithDates.expiry_date ?? undefined;

    if (!batchCode && parsedBatch) setBatchCode(parsedBatch);
    if (!productionDate && parsedProd) {
      setProductionDate(parsedProd.slice(0, 10));
    }
    if (!expiryDate && parsedExp) {
      setExpiryDate(parsedExp.slice(0, 10));
    }

    const overridden: ParsedBarcodeWithDates = {
      ...parsedWithDates,
      batch_code: batchCode || parsedBatch || undefined,
    };

    if (productionDate || parsedProd) {
      overridden.production_date = productionDate || parsedProd || undefined;
    }
    if (expiryDate || parsedExp) {
      overridden.expiry_date = expiryDate || parsedExp || undefined;
    }

    c.handleScanParsed(overridden);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          收货扫码台（receive_task.scan）
        </h2>
        {c.currentTask && (
          <span className="text-[11px] text-slate-500">
            当前任务：#{c.currentTask.id}
            {c.currentTask.po_id != null && <> · PO-{c.currentTask.po_id}</>}
            ，仓库：{c.currentTask.warehouse_id}，状态：{c.currentTask.status}
          </span>
        )}
      </div>

      <div className="border border-dashed border-slate-300 rounded-lg p-2">
        <ScanConsole
          title="Inbound 收货扫码台"
          modeLabel="receive → receive_task.scan"
          scanMode="fill"
          onScan={c.handleScan}
          onParsedFields={handleParsed}
        />
      </div>

      {/* 批次 / 日期 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">批次编码（batch_code）</label>
          <input
            className="border rounded-md px-2 py-1 text-xs"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="扫描或手工输入批次"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-slate-600">生产日期（production_date）</label>
          <input
            type="date"
            className="border rounded-md px-2 py-1 text-xs"
            value={productionDate}
            onChange={(e) => setProductionDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-slate-600">到期日期（expiry_date）</label>
          <input
            type="date"
            className="border rounded-md px-2 py-1 text-xs"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};
