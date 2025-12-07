// src/features/operations/scan/ScanCountForm.tsx

import React from "react";
import type { FormState } from "./scanCountTypes";

type Props = {
  form: FormState;
  loading: boolean;
  error: string | null;
  onUpdate: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
};

export const ScanCountForm: React.FC<Props> = ({
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
        手工盘点（按 item + batch 录入盘后数量）
      </h2>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* item_id */}
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

          {/* actual */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">actual（盘点后数量）</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.actual}
              onChange={(e) =>
                onUpdate("actual", Number(e.target.value || 0))
              }
              placeholder="≥ 0"
            />
          </div>

          {/* warehouse */}
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

        {/* batch */}
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

        {/* Dates (Production / Expiry) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* production_date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              production_date（选填）
            </label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.production_date || ""}
              onChange={(e) =>
                onUpdate("production_date", e.target.value || undefined)
              }
            />
          </div>

          {/* expiry_date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              expiry_date（选填）
            </label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.expiry_date || ""}
              onChange={(e) =>
                onUpdate("expiry_date", e.target.value || undefined)
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
          >
            {loading ? "盘点中…" : "提交盘点"}
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
