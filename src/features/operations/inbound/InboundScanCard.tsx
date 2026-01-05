// src/features/operations/inbound/InboundScanCard.tsx
// 收货扫码卡片（面向仓库作业）
// - 使用统一 /scan(mode=receive, probe=true) 做条码解析（BarcodeResolver + 条码表 + GS1）
// - 本地 parseScanBarcode 作为补充（数量）
// - 只负责解析 + 写入数量；批次/日期统一在收货明细里编辑

import React from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { InboundCockpitController } from "./types";
import { useInboundScanCardModel } from "./scan/useInboundScanCardModel";
import { StatusPill } from "./scan/StatusPill";

interface Props {
  c: InboundCockpitController;
}

export const InboundScanCard: React.FC<Props> = ({ c }) => {
  const m = useInboundScanCardModel(c);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">收货扫码台</h2>
        {c.currentTask && (
          <span className="text-[11px] text-slate-500">
            当前任务：#{c.currentTask.id}
            {c.currentTask.po_id != null && <> · PO-{c.currentTask.po_id}</>}
            ，仓库：{c.currentTask.warehouse_id}，状态：{c.currentTask.status}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">
        每次扫描将调用统一条码解析链
        <span className="font-mono mx-1">/scan(mode=receive, probe=true)</span>
        ，解析出 <span className="font-mono">item_id / qty</span> 等信息，落入当前收货任务的
        <span className="font-mono mx-1">receive_task_lines.scanned_qty</span> 上。下方“本次扫描数量”用于指定本次要累积多少件，无需重复扫码。
        批次与日期只在收货明细中统一维护。
      </p>

      <div className="border border-dashed border-slate-300 rounded-lg p-2">
        <ScanConsole
          title="收货扫码台"
          modeLabel="receive → 收货任务"
          scanMode="auto"
          onScan={m.handleScan}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">本次扫描数量</label>
          <input
            type="number"
            min={1}
            className="border rounded-md px-2 py-1 text-xs"
            value={m.scanQty}
            onChange={m.handleQtyChange}
          />
          <p className="text-[10px] text-slate-500">
            例如需要收 10 件，同一条码只需扫码一次，在此填 10 即可。
            若条码本身带数量，此处的值优先。
          </p>
        </div>
      </div>

      <div className="text-[11px]">
        {m.loading && <span className="text-slate-500">调用 /scan 中…</span>}
        {m.probeError && <span className="text-red-600 ml-2">{m.probeError}</span>}
        <StatusPill statusLevel={m.statusLevel} statusMsg={m.statusMsg} />
      </div>
    </section>
  );
};
