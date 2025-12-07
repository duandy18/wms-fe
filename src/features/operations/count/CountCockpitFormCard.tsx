// src/features/operations/count/CountCockpitFormCard.tsx
// 盘点 Cockpit 表单卡片（使用原生 date 控件，支持日历选择）

import React from "react";
import type { CountCockpitController } from "./types";

export const CountCockpitFormCard: React.FC<{
  c: CountCockpitController;
}> = ({ c }) => {
  const f = c.form;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          盘点目标（item + 仓库 + 目标库存）
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
        {/* 第一行：item / wh / qty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* item_id */}
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
              placeholder="待盘点商品 ID"
            />
          </div>

          {/* warehouse_id */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              warehouse_id（仓库）
            </label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.warehouse_id ?? ""}
              onChange={(e) =>
                c.updateForm(
                  "warehouse_id",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="仓库 ID，如 1"
            />
          </div>

          {/* qty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              qty（盘点后的绝对量）
            </label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.qty ?? ""}
              onChange={(e) =>
                c.updateForm(
                  "qty",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder=">= 0，代表最终应有库存量"
            />
          </div>
        </div>

        {/* 第二行：batch + dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* batch_code */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">batch_code</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.batch_code}
              onChange={(e) => c.updateForm("batch_code", e.target.value)}
              placeholder="批次（可选，但建议填写）"
            />
          </div>

          {/* production_date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              production_date（可选）
            </label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.production_date || ""}
              onChange={(e) =>
                c.updateForm(
                  "production_date",
                  e.target.value || undefined,
                )
              }
            />
          </div>

          {/* expiry_date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              expiry_date（可选）
            </label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={f.expiry_date || ""}
              onChange={(e) =>
                c.updateForm(
                  "expiry_date",
                  e.target.value || undefined,
                )
              }
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          说明：浏览器会用本地习惯显示日期（例如 01/01/2026），但提交给系统的实际格式是
          <span className="font-mono mx-1">YYYY-MM-DD</span>。盘盈（数量变多）
          时，必须至少提供生产日期或到期日期中的一项。
        </p>

        <div className="flex items-center gap-4 mt-2 text-xs">
          <button
            type="submit"
            disabled={c.loading}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
          >
            {c.loading ? "盘点中…" : "提交盘点请求"}
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
