// src/features/operations/outbound-pick/PickTaskScanPanel.tsx
//
// 扫码拣货 Panel（执行采集器，协同裁决版）：
// - 显示当前 active item 的 sku/name/spec/uom
// - 数量输入：一次扫描对应本次拣货的数量（例如 5 件）
// - 批次输入：仅当商品为批次受控（requires_batch/has_shelf_life）时强制出现
// - 预览（item_id + qty + batch），错误/成功提示
// - 扫码台调用上层 onScan（实际写入任务）

import React, { useEffect, useMemo, useRef } from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { PickTask } from "./pickTasksApi";
import type { ItemBasic } from "../../../master-data/itemsApi";

const NO_BATCH_CODE = "NOEXP";

function isBatchRequired(meta: ItemBasic | null): boolean {
  if (!meta) return false;
  const m = meta as unknown as {
    requires_batch?: unknown;
    has_shelf_life?: unknown;
  };
  if (typeof m.requires_batch === "boolean") return m.requires_batch;
  return m.has_shelf_life === true;
}

type Props = {
  task: PickTask | null;
  scanBusy: boolean;
  scanError: string | null;
  scanSuccess: boolean;

  batchCodeOverride: string;
  onChangeBatchCode: (v: string) => void;

  scanQty: number;
  onChangeScanQty: (v: number) => void;

  onScan: (barcode: string) => Promise<void> | void;

  previewItemId: number | null;
  previewBatchCode: string | null;
  previewQty: number | null;

  activeItemMeta: ItemBasic | null;
};

export const PickTaskScanPanel: React.FC<Props> = ({
  scanBusy,
  scanError,
  scanSuccess,
  batchCodeOverride,
  onChangeBatchCode,
  scanQty,
  onChangeScanQty,
  onScan,
  previewItemId,
  previewBatchCode,
  previewQty,
  activeItemMeta,
}) => {
  const qtyInputRef = useRef<HTMLInputElement | null>(null);

  const batchRequired = useMemo(
    () => isBatchRequired(activeItemMeta),
    [activeItemMeta],
  );

  const hasPreview =
    previewItemId != null || !!previewBatchCode || previewQty != null;

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v) || v <= 0) {
      onChangeScanQty(1);
    } else {
      onChangeScanQty(v);
    }
  };

  // 扫描成功后自动聚焦数量输入框并选中，方便下一次修改数量
  useEffect(() => {
    if (scanSuccess && qtyInputRef.current) {
      qtyInputRef.current.focus();
      qtyInputRef.current.select();
    }
  }, [scanSuccess]);

  const activeLabel = useMemo(() => {
    if (!activeItemMeta) return null;
    return `${activeItemMeta.sku ?? ""}`.trim();
  }, [activeItemMeta]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">扫码拣货（写入任务）</h3>

      {/* 当前拣货商品信息 */}
      {activeItemMeta ? (
        <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <div>
            当前拣货商品：
            <span className="mr-1 font-mono">{activeItemMeta.sku}</span>
            <span>{activeItemMeta.name}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {activeItemMeta.spec && `规格：${activeItemMeta.spec} `}
            {activeItemMeta.uom && ` · 最小单位：${activeItemMeta.uom}`}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            批次策略：{" "}
            {batchRequired ? (
              <span className="text-red-700 font-semibold">
                批次受控（必须录入批次号）
              </span>
            ) : (
              <span className="text-slate-700">
                非批次受控（无需批次；系统内部按{" "}
                <span className="font-mono">{NO_BATCH_CODE}</span>{" "}
                归桶记账，不代表真实批次）
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">
          当前任务行中没有可识别的商品信息。
        </div>
      )}

      {/* 说明文字（简化版） */}
      <div className="space-y-1 text-[11px] text-slate-600">
        <p>
          扫码后系统调用 <code>/pick-tasks/&lt;task_id&gt;/scan</code>{" "}
          只写任务，不直接扣库存。
        </p>
        <p>
          <span className="font-semibold">数量</span>{" "}
          表示本次要拣多少件：例如需要 5 件，只需扫码一次，数量填 5。
        </p>
      </div>

      {/* 输入区：批次（仅受控时显示） + 数量 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {batchRequired ? (
          <div className="space-y-1">
            <label className="text-slate-600">
              批次号（必填：条码不带批次时必须输入）
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={batchCodeOverride}
              onChange={(e) => onChangeBatchCode(e.target.value)}
              placeholder="请输入或扫描批次号，例如 BATCH-20251201-01"
            />
            <p className="text-[11px] text-slate-500">
              人机协同：批次受控商品必须由现场人员确认批次号；系统不代替你“猜批次”。
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-slate-600">批次号</label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              非批次受控商品：不需要录入批次号（系统内部统一按{" "}
              <span className="font-mono">{NO_BATCH_CODE}</span> 归桶）。
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-slate-600">数量（本次扫描要拣的数量）</label>
          <input
            ref={qtyInputRef}
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={scanQty}
            onChange={handleQtyChange}
            placeholder="例如 5，表示本次拣 5 件"
          />
          <p className="text-[11px] text-slate-500">你填写的数量优先级最高。</p>
        </div>
      </div>

      {/* 预览 / 错误 / 成功 */}
      <div className="space-y-2">
        {hasPreview && (
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-slate-700">
            <div className="mb-1 text-[11px] font-semibold text-sky-800">
              本次拣货预览
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {previewItemId != null && (
                <span>
                  item_id=<span className="font-mono">{previewItemId}</span>
                </span>
              )}
              {previewQty != null && (
                <span>
                  qty=<span className="font-mono">{previewQty}</span>
                </span>
              )}
              <span>
                batch=<span className="font-mono">{previewBatchCode ?? "-"}</span>
              </span>
            </div>
          </div>
        )}

        {scanError && (
          <div className="animate-pulse rounded-md border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            {scanError}
          </div>
        )}

        {!scanError && scanSuccess && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
            最近一次拣货写入成功。
          </div>
        )}
      </div>

      {/* 扫码台 */}
      <div className="mt-1 rounded-lg border border-dashed border-slate-300 p-2">
        <ScanConsole
          title="拣货任务扫码台"
          modeLabel={activeLabel ? `task-pick · ${activeLabel}` : "task-pick"}
          scanMode="auto"
          onScan={onScan}
        />
      </div>

      {scanBusy && <div className="text-[11px] text-slate-500">处理中…</div>}
    </div>
  );
};
