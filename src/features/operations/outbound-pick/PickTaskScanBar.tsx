// src/features/operations/outbound-pick/PickTaskScanBar.tsx
//
// 药房式扫码输入栏：永远聚焦、扫一下记一次
// - 不承载流程，只是“事实输入源”
// - onScan(barcode) 由上层控制器实现：解析条码→命中 item→POST /pick-tasks/{id}/scan→刷新 task+diff
//
// 设计目标：
// - 扫码枪回车即提交
// - 成功后清空并回焦点
// - 错误有明确提示

import React, { useEffect, useMemo, useRef, useState } from "react";

export const PickTaskScanBar: React.FC<{
  disabled: boolean;

  scanBusy: boolean;
  scanError: string | null;
  scanSuccess: boolean;

  scanQty: number;
  onChangeScanQty: (n: number) => void;

  batchCodeOverride: string;
  onChangeBatchCode: (s: string) => void;

  // ✅ 关键：由控制器负责“条码→item→写事实→刷新”
  onScan: (barcode: string) => Promise<void> | void;

  // 可选：用于显示最近一次扫描预览（控制器已有就传）
  previewItemId?: number | null;
  previewBatchCode?: string | null;
  previewQty?: number | null;
}> = ({
  disabled,
  scanBusy,
  scanError,
  scanSuccess,
  scanQty,
  onChangeScanQty,
  batchCodeOverride,
  onChangeBatchCode,
  onScan,
  previewItemId = null,
  previewBatchCode = null,
  previewQty = null,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [barcode, setBarcode] = useState("");

  // 永远聚焦：可用且不 busy 时，尽量把焦点放回扫码框
  useEffect(() => {
    if (disabled) return;
    if (scanBusy) return;
    inputRef.current?.focus();
  }, [disabled, scanBusy]);

  // 扫码成功：清空输入并回焦点（不依赖控制器内部实现）
  useEffect(() => {
    if (!scanSuccess) return;
    setBarcode("");
    inputRef.current?.focus();
  }, [scanSuccess]);

  const canSubmit = useMemo(() => {
    if (disabled) return false;
    if (scanBusy) return false;
    return barcode.trim().length > 0;
  }, [disabled, scanBusy, barcode]);

  function clampQty(n: number): number {
    if (!Number.isFinite(n)) return 1;
    if (n <= 0) return 1;
    if (n > 9999) return 9999;
    return Math.floor(n);
  }

  async function submit() {
    const code = barcode.trim();
    if (!code) return;
    await Promise.resolve(onScan(code));
    // 成功清空由 scanSuccess effect 负责；失败则保留条码便于重扫/复制
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="text-[11px] text-slate-500">扫码输入（光标保持在此，扫码枪回车即提交）</div>
          <input
            ref={inputRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (canSubmit) void submit();
              }
            }}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            placeholder={disabled ? "请先选择拣货任务" : "请扫码条码…"}
            autoComplete="off"
            inputMode="text"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="min-w-[92px]">
            <div className="text-[11px] text-slate-500">数量</div>
            <input
              type="number"
              value={scanQty}
              onChange={(e) => onChangeScanQty(clampQty(Number(e.target.value)))}
              disabled={disabled}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              min={1}
              step={1}
            />
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="mt-5 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-60"
          >
            {scanBusy ? "扫描中…" : "提交"}
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1 text-[11px]">
        {batchCodeOverride ? (
          <div className="text-slate-600">
            批次覆盖：<span className="font-mono">{batchCodeOverride}</span>
            <button
              type="button"
              className="ml-2 underline text-slate-500"
              onClick={() => onChangeBatchCode("")}
              disabled={disabled}
            >
              清空
            </button>
          </div>
        ) : (
          <div className="text-slate-500">批次覆盖：未设置（如需强制批次，可在下方输入）</div>
        )}

        <details className="mt-1">
          <summary className="cursor-pointer text-slate-500">批次覆盖（可选）</summary>
          <div className="mt-2">
            <input
              value={batchCodeOverride}
              onChange={(e) => onChangeBatchCode(e.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              placeholder="输入批次编码（可选）"
            />
          </div>
        </details>

        {scanError ? <div className="text-red-600">扫描失败：{scanError}</div> : null}
        {scanSuccess ? <div className="text-emerald-700">扫描成功 ✅</div> : null}

        {previewItemId != null || previewQty != null || previewBatchCode != null ? (
          <div className="text-slate-500">
            最近一次：item_id={previewItemId ?? "-"}，qty={previewQty ?? "-"}，batch={previewBatchCode ?? "-"}
          </div>
        ) : null}
      </div>
    </div>
  );
};
