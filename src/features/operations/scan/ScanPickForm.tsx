// src/features/operations/scan/ScanPickForm.tsx

import React from "react";
import type { FormState } from "./scanPickTypes";

type Props = {
  form: FormState;
  loading: boolean;
  error: string | null;
  onUpdate: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
};

export const ScanPickForm: React.FC<Props> = ({
  form,
  loading,
  error,
  onUpdate,
  onSubmit,
  onReset,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">
        手工拣货（按 item + batch + qty 扣减库存）
      </h2>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">item_id</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.item_id || ""}
              onChange={(e) =>
                onUpdate("item_id", Number(e.target.value || 0))
              }
              placeholder="商品编码"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              qty（本次拣货数量）
            </label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.qty}
              onChange={(e) => onUpdate("qty", Number(e.target.value || 0))}
              placeholder="> 0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">warehouse_id</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.warehouse_id ?? ""}
              onChange={(e) =>
                onUpdate("warehouse_id", Number(e.target.value || 0))
              }
              placeholder="例如 1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">batch_code</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.batch_code}
              onChange={(e) => onUpdate("batch_code", e.target.value)}
              placeholder="批次编码"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
          >
            {loading ? "拣货中…" : "提交拣货"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-slate-100 text-xs text-slate-700"
          >
            重置
          </button>
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
        </div>
      </form>
    </section>
  );
};
