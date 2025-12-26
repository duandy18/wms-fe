// src/features/admin/items/form/ItemCreateFormCard.tsx

import React from "react";
import { UI } from "./ui";
import type { FormState } from "./types";

export const ItemCreateFormCard: React.FC<{
  form: FormState;
  saving: boolean;
  saveError: string | null;

  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}> = ({ form, saving, saveError, onChange, onSubmit }) => {
  return (
    <div className={UI.card}>
      <h2 className={UI.h2}>新建商品</h2>

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* SKU + 名称 */}
        <div className={UI.grid2}>
          <div className="flex flex-col gap-1">
            <label className={UI.label}>SKU</label>
            <input
              className={UI.inputMono}
              value={form.sku}
              onChange={(e) => onChange("sku", e.target.value)}
              placeholder="KF-C-NZ-2KG-001"
            />
            <span className={UI.hint}>可直接手填，也可以右侧生成 SKU 再微调。</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className={UI.label}>商品名称</label>
            <input
              className={UI.input}
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="如：皇家猫粮 2kg 成猫"
            />
          </div>
        </div>

        {/* 规格 / 单位 / 条码 / 重量 */}
        <div className={UI.grid4}>
          <div className="flex flex-col gap-1">
            <label className={UI.label}>规格说明</label>
            <input
              className={UI.input}
              value={form.spec}
              onChange={(e) => onChange("spec", e.target.value)}
              placeholder="如：2kg 鸡肉味"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={UI.label}>单位 (uom)</label>
            <input
              className={UI.input}
              value={form.uom}
              onChange={(e) => onChange("uom", e.target.value)}
              placeholder="KG / G / BAG / PCS / 袋 / 箱 / 罐 / 听"
            />
            <div className="mt-1 flex flex-wrap gap-1">
              {["袋", "箱", "罐", "听", "个", "件"].map((u) => (
                <button key={u} type="button" className={UI.chip} onClick={() => onChange("uom", u)}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={UI.label}>主条码</label>
            <input
              className={UI.input}
              value={form.barcode}
              onChange={(e) => onChange("barcode", e.target.value)}
              placeholder="EAN13 / 内码"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={UI.label}>单件重量(kg)</label>
            <input
              className={UI.inputMono}
              value={form.weight_kg}
              onChange={(e) => onChange("weight_kg", e.target.value)}
              placeholder="如：2.000"
            />
            <span className={UI.hint}>用于发货成本预估，后续电子秤可覆盖。</span>
          </div>
        </div>

        {/* 启用 + 提交按钮 */}
        <div className="mt-1 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={form.enabled} onChange={(e) => onChange("enabled", e.target.checked)} />
            启用（可售）
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className={UI.btnPrimary}>
              {saving ? "保存中…" : "保存商品"}
            </button>
            {saveError ? <span className={UI.err}>{saveError}</span> : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ItemCreateFormCard;
