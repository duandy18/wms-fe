// src/features/admin/warehouses/WarehouseCreateForm.tsx

import React from "react";

type Props = {
  canWrite: boolean;
  saving: boolean;
  name: string;
  code: string;
  onNameChange: (v: string) => void;
  onCodeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const WarehouseCreateForm: React.FC<Props> = ({
  canWrite,
  saving,
  name,
  code,
  onNameChange,
  onCodeChange,
  onSubmit,
}) => {
  if (!canWrite) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">创建 / 补录仓库</h2>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base"
      >
        {/* 仓库名称 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-500">仓库名称</label>
          <input
            className="border rounded-lg px-3 py-2 text-base"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="例如 主仓 / 备仓1 ..."
          />
        </div>

        {/* 仓库编码 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-500">仓库编码（可选）</label>
          <input
            className="border rounded-lg px-3 py-2 text-base"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="例如 WH1"
          />
        </div>

        {/* 提交按钮 */}
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

      <p className="text-xs text-slate-500">
        地址、联系人、电话、面积等信息，可在创建后于仓库详情页中补充完善。
      </p>
    </section>
  );
};
