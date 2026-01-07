// src/features/operations/inbound/scan-work/ScanInputCard.tsx

import React, { useRef, useState } from "react";
import type { InboundCockpitController } from "../types";

export const ScanInputCard: React.FC<{
  c: InboundCockpitController;
  scanQty: number;
  onQtyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: (barcodeRaw: string) => void | Promise<void>;
}> = ({ c, scanQty, onQtyChange, onScan }) => {
  const task = c.currentTask;

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onScan(trimmed);
      setCode("");
      // 扫码枪/键盘连续录入体验：提交后自动聚焦回输入框
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">条码 / SKU 输入</h2>
        {task ? (
          <span className="text-[11px] text-slate-500">
            任务 #{task.id} · 仓库 {task.warehouse_id}
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">未绑定收货任务</span>
        )}
      </div>

      {/* 输入区：只保留一个大输入框 + 数量 */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_160px] gap-3 items-end">
        <div className="space-y-1">
          <input
            ref={inputRef}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="请将光标置于此处并扫描条码（或键盘输入后回车）"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
            disabled={submitting}
            autoComplete="off"
            inputMode="text"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">本次数量</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={scanQty}
            onChange={onQtyChange}
            disabled={submitting}
          />
        </div>
      </div>
    </section>
  );
};
