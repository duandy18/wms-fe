// src/features/operations/outbound-pick/PickTaskScanPanel.tsx
//
// 扫码拣货 Panel（内容模块）：
// - 显示当前 active item 的 sku/name/spec/uom
// - 批次输入（条码不含批次时必填）
// - 数量输入：一次扫描对应本次拣货的数量（例如 5 件）
// - 本次扫描预览（item_id + qty + batch），蓝色高亮卡片
// - 错误红色闪烁提示，成功绿色提示
// - 扫码台调用上层 onScan（实际写入任务）

import React, { useEffect, useRef } from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { PickTask } from "./pickTasksApi";
import type { ItemBasic } from "../../../master-data/itemsApi";

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
  task,
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
  const uniqueItems = Array.from(
    new Set((task?.lines ?? []).map((l) => l.item_id)),
  );

  const hasPreview =
    previewItemId != null || !!previewBatchCode || previewQty != null;

  const qtyInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">
        扫码拣货（写入任务）
      </h3>

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
            {activeItemMeta.uom && ` · 单位：${activeItemMeta.uom}`}
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">
          当前任务行中没有可识别的商品信息。
        </div>
      )}

      {/* 说明文字 */}
      <div className="space-y-1 text-[11px] text-slate-600">
        <p>
          使用扫描枪扫描条码，系统会根据条码（以及下方填写的批次）
          调用 <code>/pick-tasks/&lt;task_id&gt;/scan</code>，只写任务，不直接扣库存。
        </p>
        <p>
          <span className="font-semibold">数量</span> 表示
          <span className="font-semibold mx-1">本次扫描要拣多少件</span>
          ：例如同一商品需要 5 件，只需扫码一次，在数量输入框填 5 即可。
        </p>
        {uniqueItems.length > 0 && (
          <p>
            当前任务包含 item_id：{" "}
            <span className="font-mono">
              {uniqueItems.join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* 批次 + 数量输入卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-slate-600">
            批次编码（必填，如果条码本身不包含批次）
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={batchCodeOverride}
            onChange={(e) => onChangeBatchCode(e.target.value)}
            placeholder="请输入或扫描批次编码，例如 BATCH-20251201-01"
          />
          <p className="text-[11px] text-slate-500">
            实际调用时使用逻辑：优先使用条码解析出的批次；若条码不带批次，则使用此处填写的批次。
            与 FEFO 卡片的“使用推荐批次”联动，将自动填充此处。
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-slate-600">
            数量（本次扫描要拣的数量）
          </label>
          <input
            ref={qtyInputRef}
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={scanQty}
            onChange={handleQtyChange}
            placeholder="例如 5，表示本次拣 5 件"
          />
          <p className="text-[11px] text-slate-500">
            若条码中带有数量信息（如 QTY:3），系统会作为候选数量；否则默认视为 1。
            你填写的数量优先级最高。
          </p>
        </div>
      </div>

      {/* 预览 / 错误 / 成功 状态区 */}
      <div className="space-y-2">
        {/* 预览条 */}
        {hasPreview && (
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-slate-700">
            <div className="mb-1 text-[11px] font-semibold text-sky-800">
              本次拣货预览
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {previewItemId != null && (
                <span>
                  item_id=
                  <span className="font-mono">{previewItemId}</span>
                </span>
              )}
              {previewQty != null && (
                <span>
                  qty=
                  <span className="font-mono">{previewQty}</span>
                </span>
              )}
              {previewBatchCode && (
                <span>
                  batch=
                  <span className="font-mono">{previewBatchCode}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* 错误提示（红色高亮，轻微闪烁） */}
        {scanError && (
          <div className="animate-pulse rounded-md border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            {scanError}
          </div>
        )}

        {/* 成功提示（绿色） */}
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
          modeLabel="task-pick"
          scanMode="auto"
          onScan={onScan}
        />
      </div>

      {scanBusy && (
        <div className="text-[11px] text-slate-500">处理中…</div>
      )}
    </div>
  );
};
