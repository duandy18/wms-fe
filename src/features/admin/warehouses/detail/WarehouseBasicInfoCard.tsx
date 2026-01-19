// src/features/admin/warehouses/detail/WarehouseBasicInfoCard.tsx
import React from "react";
import { UI } from "./ui";
import type { WarehouseListItem } from "../types";

export const WarehouseBasicInfoCard: React.FC<{
  detail: WarehouseListItem;

  canWrite: boolean;
  saving: boolean;

  name: string;
  setName: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;

  address: string;
  setAddress: (v: string) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  areaSqm: string;
  setAreaSqm: (v: string) => void;

  onSubmit: () => void;
}> = (p) => {
  return (
    <section className={UI.section}>
      <div className="text-lg">
        <span className="mr-2 text-slate-500">ID:</span>
        <span className="font-semibold">{p.detail.id}</span>
      </div>

      <form
        className="grid grid-cols-1 gap-6 text-lg md:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          p.onSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
          <label className={UI.labelBasic}>仓库名称 *</label>
          <input
            className={UI.inputBasic}
            value={p.name}
            onChange={(e) => p.setName(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={UI.labelBasic}>仓库编码（手动填写）*</label>
          <input
            className={UI.inputBasicMono}
            value={p.code}
            onChange={(e) => p.setCode(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={UI.labelBasic}>状态</label>
          <select
            value={p.active ? "1" : "0"}
            onChange={(e) => p.setActive(e.target.value === "1")}
            className={UI.selectBasic}
            disabled={p.saving}
          >
            <option value="1">启用</option>
            <option value="0">停用</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
          <label className={UI.labelBasic}>地址</label>
          <input
            className={UI.inputBasic}
            value={p.address}
            onChange={(e) => p.setAddress(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={UI.labelBasic}>联系人</label>
          <input
            className={UI.inputBasic}
            value={p.contactName}
            onChange={(e) => p.setContactName(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={UI.labelBasic}>联系电话</label>
          <input
            className={UI.inputBasicMono}
            value={p.contactPhone}
            onChange={(e) => p.setContactPhone(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={UI.labelBasic}>仓库面积（㎡）</label>
          <input
            type="number"
            min={0}
            className={UI.inputBasicMono}
            value={p.areaSqm}
            onChange={(e) => p.setAreaSqm(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex items-center lg:col-span-3">
          <button type="submit" disabled={p.saving || !p.canWrite} className={UI.btnPrimaryBasic}>
            {p.saving ? "保存中…" : "保存修改"}
          </button>
        </div>
      </form>

      <div className="text-sm text-slate-500">
        说明：仓库不可删除（数据库已 RESTRICT），需要停用请改状态为“停用”。
      </div>
    </section>
  );
};
