// src/features/operations/outbound-pick/OutboundPickFormPanel.tsx
//
// 拣货表单 Panel：warehouse_id / item_id / qty / batch_code（必填）
// - 支持手输批次
// - 也支持从 snapshot 的批次列表中下拉选择（FEFO 排序）

import React from "react";
import type { ItemSlice } from "../../inventory/snapshot/api";

export type FormState = {
  warehouseId: number;
  itemId: number;
  qty: number;
  batchCode: string;
};

type Props = {
  form: FormState;
  loading: boolean;
  error: string | null;
  batchSlices: ItemSlice[];
  onChangeField: (patch: Partial<FormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const OutboundPickFormPanel: React.FC<Props> = ({
  form,
  loading,
  error,
  batchSlices,
  onChangeField,
  onSubmit,
}) => {
  // FEFO 排序（按 expire_at）
  const sortedBatches = [...batchSlices]
    .filter((s) => s.batch_code)
    .sort((a, b) => {
      const da = a.expire_at ? Date.parse(a.expire_at) : Infinity;
      const db = b.expire_at ? Date.parse(b.expire_at) : Infinity;
      return da - db;
    });

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">手工拣货</h2>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600">
              warehouse_id
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={form.warehouseId}
              onChange={(e) =>
                onChangeField({
                  warehouseId: Number(e.target.value) || 0,
                })
              }
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600">item_id</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={form.itemId}
              onChange={(e) =>
                onChangeField({
                  itemId: Number(e.target.value) || 0,
                })
              }
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600">qty</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={form.qty}
              onChange={(e) =>
                onChangeField({
                  qty: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-slate-600">
              batch_code（必填）
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={form.batchCode}
              onChange={(e) => onChangeField({ batchCode: e.target.value })}
              placeholder="请输入本次拣货的批次编码"
            />
          </div>

          {sortedBatches.length > 0 && (
            <div className="text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>从现有批次中选择：</span>
              </div>
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px]"
                value={form.batchCode}
                onChange={(e) =>
                  onChangeField({ batchCode: e.target.value })
                }
              >
                <option value="">- 选择一个批次（可选） -</option>
                {sortedBatches.map((s, idx) => (
                  <option
                    key={`${s.batch_code}-${idx}`}
                    value={s.batch_code!}
                  >
                    {s.batch_code} · 可用 {s.available_qty}
                    {s.expire_at ? ` · 过期 ${s.expire_at}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "拣货中…" : "提交拣货"}
          </button>
          {error && (
            <span className="text-xs text-red-600">错误：{error}</span>
          )}
        </div>
      </form>
    </section>
  );
};
