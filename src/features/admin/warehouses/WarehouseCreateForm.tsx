// src/features/admin/warehouses/WarehouseCreateForm.tsx

import React from "react";

type Props = {
  canWrite: boolean;
  saving: boolean;

  name: string;
  code: string;
  active: boolean;

  address: string;
  contactName: string;
  contactPhone: string;
  areaSqm: string;

  onNameChange: (v: string) => void;
  onCodeChange: (v: string) => void;
  onActiveChange: (v: boolean) => void;

  onAddressChange: (v: string) => void;
  onContactNameChange: (v: string) => void;
  onContactPhoneChange: (v: string) => void;
  onAreaSqmChange: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
};

export const WarehouseCreateForm: React.FC<Props> = ({
  canWrite,
  saving,

  name,
  code,
  active,

  address,
  contactName,
  contactPhone,
  areaSqm,

  onNameChange,
  onCodeChange,
  onActiveChange,

  onAddressChange,
  onContactNameChange,
  onContactPhoneChange,
  onAreaSqmChange,

  onSubmit,
}) => {
  if (!canWrite) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">创建仓库</h2>
        <div className="mt-1 text-sm text-slate-600">
          字段与仓库列表一致（除 ID/时间戳等机器字段）。仓库编码为业务标识：必填、手动输入。
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 text-base">
        {/* Row 1: name / code / active */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">仓库名称 *</label>
            <input
              className="rounded-lg border px-3 py-2 text-base"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="例如：上海主仓 / 北京冷链仓"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">
              仓库编码（手动填写）*
            </label>
            <input
              className="rounded-lg border px-3 py-2 text-base font-mono"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="例如：SH-MAIN / BJ-COLD / EAST-3PL"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">状态 *</label>
            <select
              className="rounded-lg border px-3 py-2 text-base"
              value={active ? "1" : "0"}
              onChange={(e) => onActiveChange(e.target.value === "1")}
              disabled={saving}
            >
              <option value="1">启用</option>
              <option value="0">停用</option>
            </select>
          </div>
        </div>

        {/* Row 2: address */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">地址</label>
            <input
              className="rounded-lg border px-3 py-2 text-base"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="例如：上海市·某某区·某某路·某某园区"
              disabled={saving}
            />
          </div>
        </div>

        {/* Row 3: contact / phone / area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">联系人</label>
            <input
              className="rounded-lg border px-3 py-2 text-base"
              value={contactName}
              onChange={(e) => onContactNameChange(e.target.value)}
              placeholder="例如：张三"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">联系电话</label>
            <input
              className="rounded-lg border px-3 py-2 text-base font-mono"
              value={contactPhone}
              onChange={(e) => onContactPhoneChange(e.target.value)}
              placeholder="手机/座机/分机"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">仓库面积（㎡）</label>
            <input
              type="number"
              min={0}
              className="rounded-lg border px-3 py-2 text-base font-mono"
              value={areaSqm}
              onChange={(e) => onAreaSqmChange(e.target.value)}
              placeholder="例如：800"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-base text-white disabled:opacity-60"
          >
            {saving ? "创建中…" : "创建仓库"}
          </button>
        </div>
      </form>
    </section>
  );
};
