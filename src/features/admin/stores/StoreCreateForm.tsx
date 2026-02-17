// src/features/admin/stores/StoreCreateForm.tsx

import React from "react";
import type { ShopType } from "./types";

type StoreCreateFormProps = {
  plat: string;
  shopId: string;
  name: string;

  // ✅ 新增：店铺类型（创建时选择 TEST / PROD）
  shopType?: ShopType;
  onShopTypeChange?: (v: ShopType) => void;

  saving: boolean;
  canWrite: boolean;
  onPlatChange: (v: string) => void;
  onShopIdChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const StoreCreateForm: React.FC<StoreCreateFormProps> = ({
  plat,
  shopId,
  name,
  shopType,
  onShopTypeChange,
  saving,
  canWrite,
  onPlatChange,
  onShopIdChange,
  onNameChange,
  onSubmit,
}) => {
  if (!canWrite) return null;

  const currentType: ShopType = shopType ?? "PROD";

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">创建 / 补录店铺</h2>

      <form className="grid grid-cols-1 md:grid-cols-5 gap-4 text-base" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-500">platform</label>
          <input
            className="border rounded-lg px-3 py-2 text-base"
            value={plat}
            onChange={(e) => onPlatChange(e.target.value)}
            placeholder="PDD / TB / JD ..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-500">shop_id</label>
          <input
            className="border rounded-lg px-3 py-2 text-base"
            value={shopId}
            onChange={(e) => onShopIdChange(e.target.value)}
            placeholder="平台店铺 ID"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-500">店铺类型</label>
          <select
            className="border rounded-lg px-3 py-2 text-base"
            value={currentType}
            onChange={(e) => onShopTypeChange?.(e.target.value as ShopType)}
          >
            <option value="PROD">实际店铺</option>
            <option value="TEST">测试店铺</option>
          </select>
          <div className="text-[11px] text-slate-500">
            TEST 用于 order-sim 等门禁功能；PROD 为正常履约店铺。
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-500">店铺名（可选）</label>
          <input
            className="border rounded-lg px-3 py-2 text-base"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="不填则默认 {PLAT}-{shop_id}"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-base disabled:opacity-60"
          >
            {saving ? "提交中…" : "创建 / 补录"}
          </button>
        </div>
      </form>
    </section>
  );
};
