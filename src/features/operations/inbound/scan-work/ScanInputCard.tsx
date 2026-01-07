// src/features/operations/inbound/scan-work/ScanInputCard.tsx

import React, { useRef, useState } from "react";
import type { InboundCockpitController } from "../types";
import { InboundUI } from "../ui";

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
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={InboundUI.title}>条码 / SKU 输入</h2>
        {task ? (
          <span className={InboundUI.quiet}>
            任务 #{task.id} · 仓库 {task.warehouse_id}
          </span>
        ) : (
          <span className={InboundUI.quiet}>未绑定收货任务</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px] gap-3 items-end">
        <div className="space-y-1">
          <input
            ref={inputRef}
            className={InboundUI.inputText}
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
          <label className={InboundUI.hint}>本次数量</label>
          <input
            type="number"
            min={1}
            className={InboundUI.inputNumber}
            value={scanQty}
            onChange={onQtyChange}
            disabled={submitting}
          />
        </div>
      </div>
    </section>
  );
};
