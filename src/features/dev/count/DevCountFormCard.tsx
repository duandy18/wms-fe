// src/features/dev/count/DevCountFormCard.tsx
import React from "react";
import type { DevCountController } from "./types";

interface Props {
  c: DevCountController;
}

export const DevCountFormCard: React.FC<Props> = ({ c }) => {
  const f = c.form;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          盘点请求（item + warehouse + qty）
        </h2>
        {c.error && (
          <span className="text-xs text-red-600">{c.error}</span>
        )}
      </div>

      <form
        className="space-y-4 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void c.submit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* item */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">item_id</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.item_id ?? ""}
              onChange={(e) =>
                c.updateForm(
                  "item_id",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="商品 ID"
            />
          </div>

          {/* warehouse */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">warehouse_id</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.warehouse_id ?? ""}
              onChange={(e) =>
                c.updateForm(
                  "warehouse_id",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="仓库 ID"
            />
          </div>

          {/* qty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">qty（目标库存）</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.qty ?? ""}
              onChange={(e) =>
                c.updateForm(
                  "qty",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="≥ 0"
            />
          </div>
        </div>

        {/* batch + dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* batch_code */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">batch_code</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.batch_code}
              onChange={(e) => c.updateForm("batch_code", e.target.value)}
              placeholder="批次"
            />
          </div>

          {/* production_date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">production_date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.production_date || ""}
              onChange={(e) =>
                c.updateForm("production_date", e.target.value || undefined)
              }
            />
          </div>

          {/* expiry_date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">expiry_date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.expiry_date || ""}
              onChange={(e) =>
                c.updateForm("expiry_date", e.target.value || undefined)
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs">
          <button
            type="submit"
            disabled={c.loading}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
          >
            {c.loading ? "盘点中…" : "提交盘点（scan:count）"}
          </button>

          <button
            type="button"
            onClick={c.resetForm}
            className="px-4 py-2 rounded-lg bg-slate-100 text-xs text-slate-700"
          >
            重置
          </button>
        </div>
      </form>
    </section>
  );
};
