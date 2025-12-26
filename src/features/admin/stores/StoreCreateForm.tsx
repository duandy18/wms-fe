// src/features/admin/stores/StoreCreateForm.tsx

import React from "react";
import { UI } from "./ui";

type StoreCreateFormProps = {
  plat: string;
  shopId: string;
  name: string;
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
  saving,
  canWrite,
  onPlatChange,
  onShopIdChange,
  onNameChange,
  onSubmit,
}) => {
  if (!canWrite) return null;

  return (
    <section className={UI.cardP5}>
      <h2 className={UI.titleLg}>创建 / 补录店铺</h2>

      <form className={UI.formGrid4} onSubmit={onSubmit}>
        <div className={UI.fieldCol}>
          <label className={UI.labelSm}>platform</label>
          <input
            className={UI.inputBase}
            value={plat}
            onChange={(e) => onPlatChange(e.target.value)}
            placeholder="PDD / TB / JD ..."
          />
        </div>

        <div className={UI.fieldCol}>
          <label className={UI.labelSm}>shop_id</label>
          <input
            className={UI.inputBase}
            value={shopId}
            onChange={(e) => onShopIdChange(e.target.value)}
            placeholder="平台店铺 ID"
          />
        </div>

        <div className={UI.fieldCol}>
          <label className={UI.labelSm}>店铺名（可选）</label>
          <input
            className={UI.inputBase}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="不填则默认 {PLAT}-{shop_id}"
          />
        </div>

        <div className="flex items-end">
          <button type="submit" disabled={saving} className={UI.btnPrimary}>
            {saving ? "提交中…" : "创建 / 补录"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default StoreCreateForm;
