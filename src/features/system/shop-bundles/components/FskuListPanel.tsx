// src/features/system/shop-bundles/components/FskuListPanel.tsx
import React from "react";
import type { Fsku } from "../types";
import { cls, statusLabel } from "../ui";

export const FskuListPanel: React.FC<{
  fskus: Fsku[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;

  selectedFskuId: number | null;
  setSelectedFskuId: (v: number | null) => void;
}> = ({ fskus, loading, error, onRefresh, selectedFskuId, setSelectedFskuId }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">① 履约组合库（FSKU）</div>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "刷新中…" : "刷新列表"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</div>
      ) : null}

      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-700">FSKU 列表</div>
          <div className="text-[11px] text-slate-500">{fskus.length ? `共 ${fskus.length}` : "—"}</div>
        </div>

        {fskus.length ? (
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left">FSKU</th>
                  <th className="px-3 py-2 text-left">名称</th>
                  <th className="px-3 py-2 text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                {fskus.map((f) => {
                  const active = selectedFskuId === f.id;
                  return (
                    <tr
                      key={f.id}
                      className={cls("border-b border-slate-100 cursor-pointer hover:bg-slate-50", active && "bg-slate-50")}
                      onClick={() => setSelectedFskuId(f.id)}
                    >
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{f.id}</td>
                      <td className="px-3 py-2 text-slate-900">{f.name}</td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[11px] text-slate-700">{statusLabel(f.status)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-3 py-3 text-[12px] text-slate-500">暂无 FSKU。请在左侧“组装 components”中先新建草稿。</div>
        )}
      </div>
    </section>
  );
};
