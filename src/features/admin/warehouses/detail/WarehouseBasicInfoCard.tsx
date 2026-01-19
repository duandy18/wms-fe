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

  // ✅ 与 useWarehouseDetailModel 对齐：表单态统一用 string
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

  // ✅ 表单输入态：string（允许空串）
  areaSqm: string;
  setAreaSqm: (v: string) => void;

  onSubmit: () => void;
}> = (p) => {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-10">
      <div className={UI.title2}>仓库基础信息</div>

      <div className="text-base text-slate-500">
        <span className="mr-2 text-slate-500">ID:</span>
        <span className="font-semibold text-slate-900">{p.detail.id}</span>
      </div>

      <form
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          p.onSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">仓库名称 *</label>
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            value={p.name}
            onChange={(e) => p.setName(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">仓库编码（手动填写）*</label>
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-mono"
            value={p.code}
            onChange={(e) => p.setCode(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">状态</label>
          <select
            value={p.active ? "1" : "0"}
            onChange={(e) => p.setActive(e.target.value === "1")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            disabled={p.saving}
          >
            <option value="1">启用</option>
            <option value="0">停用</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
          <label className="text-sm text-slate-600">地址</label>
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            value={p.address}
            onChange={(e) => p.setAddress(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">联系人</label>
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            value={p.contactName}
            onChange={(e) => p.setContactName(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">联系电话</label>
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-mono"
            value={p.contactPhone}
            onChange={(e) => p.setContactPhone(e.target.value)}
            disabled={p.saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">仓库面积（㎡）</label>
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-mono"
            value={p.areaSqm}
            onChange={(e) => p.setAreaSqm(e.target.value)}
            disabled={p.saving}
            placeholder="例如：800"
            inputMode="decimal"
          />
        </div>

        {/* ✅ 保存按钮：变小 + 去黑 */}
        <div className="flex items-center md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={!p.canWrite || p.saving}
            className="rounded-lg border border-slate-300 bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-60"
          >
            {p.saving ? "保存中…" : "保存修改"}
          </button>
        </div>
      </form>

      <div className="text-sm text-slate-500">
        说明：仓库不可删除（数据库 RESTRICT），需停用请将状态改为“停用”。
      </div>
    </section>
  );
};
