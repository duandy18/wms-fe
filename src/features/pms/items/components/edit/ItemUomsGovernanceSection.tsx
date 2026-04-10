// src/features/pms/items/components/edit/ItemUomsGovernanceSection.tsx
//
// 拆分说明：
// - 本文件从“状态 + 保存逻辑 + 工具函数 + 渲染”混合体，收敛为“页面壳子 + JSX 渲染”
// - 状态与副作用迁到 useItemUomsGovernanceModel.ts
// - 纯函数与草稿类型迁到 itemUomsGovernanceUtils.ts
// - 本次顺手去掉“换算预览”，保持当前商品条码页终态方向

import React from "react";
import { tagLabel } from "./itemUomsGovernanceUtils";
import { useItemUomsGovernanceModel } from "./useItemUomsGovernanceModel";

const ItemUomsGovernanceSection: React.FC<{
  itemId: number;
  onChanged?: () => Promise<void> | void;
}> = ({ itemId, onChanged }) => {
  const m = useItemUomsGovernanceModel({ itemId, onChanged });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">包装方式</div>
        </div>

        <button
          type="button"
          onClick={m.addExtraPackageRow}
          disabled={m.loading || m.saving}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          新增包装
        </button>
      </div>

      {m.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {m.error}
        </div>
      ) : null}

      {m.success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {m.success}
        </div>
      ) : null}

      <form onSubmit={(e) => void m.handleSave(e)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_minmax(180px,1fr)_140px_minmax(180px,1fr)] md:items-center">
          <label className="text-sm font-medium text-slate-700">基础包装</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white font-mono"
            placeholder="如：袋 / 本 / 支"
            value={m.baseUom}
            onChange={(e) => m.setBaseUom(e.target.value)}
            disabled={m.saving}
          />

          <label className="text-sm font-medium text-slate-700">基础重量（kg）</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white font-mono"
            placeholder="如：0.25"
            value={m.baseWeightKg}
            onChange={(e) => m.setBaseWeightKg(e.target.value)}
            disabled={m.saving}
            inputMode="decimal"
          />
        </div>

        <div className="overflow-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b px-3 py-2 text-left font-semibold">包装名称</th>
                <th className="border-b px-3 py-2 text-left font-semibold">倍率</th>
                <th className="border-b px-3 py-2 text-left font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {m.loading ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                    包装方式加载中…
                  </td>
                </tr>
              ) : m.extraPackages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                    当前还没有扩展包装，可点击右上角“新增包装”。
                  </td>
                </tr>
              ) : (
                m.extraPackages.map((row) => (
                  <tr key={row.key} className="border-t">
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded border px-3 py-2 bg-white font-mono"
                        placeholder="如：箱 / 托"
                        value={row.name}
                        onChange={(e) =>
                          m.updateExtraPackageRow(row.key, { name: e.target.value })
                        }
                        disabled={m.saving}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded border px-3 py-2 bg-white font-mono"
                        placeholder="如：12"
                        value={row.ratio}
                        onChange={(e) =>
                          m.updateExtraPackageRow(row.key, { ratio: e.target.value })
                        }
                        disabled={m.saving}
                        inputMode="numeric"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void m.handleDeleteExtraPackage(row)}
                        disabled={m.saving}
                        className="rounded border border-red-300 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {m.rows.length > 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-2 text-sm font-medium text-slate-700">当前包装列表</div>
            <div className="space-y-1 text-sm text-slate-600">
              {m.rows.map((u) => (
                <div key={u.id}>
                  <span className="font-mono">{u.uom}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  倍率 <span className="font-mono">{u.ratio_to_base}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  {tagLabel(u)}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={m.saving}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {m.saving ? "保存中…" : "保存包装方式"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ItemUomsGovernanceSection;
