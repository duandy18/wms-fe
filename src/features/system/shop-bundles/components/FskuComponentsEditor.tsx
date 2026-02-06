// src/features/system/shop-bundles/components/FskuComponentsEditor.tsx
import React, { useMemo } from "react";
import type { FskuStatus } from "../types";
import { useFskuComponents } from "../useFskuComponents";

function toIntOrNull(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i <= 0) return null;
  return i;
}

export const FskuComponentsEditor: React.FC<{
  fskuId: number | null;
  status: FskuStatus | null;
}> = ({ fskuId, status }) => {
  const readOnly = status === "published" || status === "retired";

  const C = useFskuComponents(fskuId);

  const headerHint = useMemo(() => {
    if (fskuId == null) return "请先在上方选择一个 FSKU。";
    if (status === "published") return "已发布（published），组件冻结，只读。";
    if (status === "retired") return "已停用（retired），只读。";
    return "草稿（draft）可编辑；保存即全量替换 components。";
  }, [fskuId, status]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">③ components（履约组成）</div>
          <div className="text-[11px] text-slate-500">{headerHint}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => void C.reload()}
            disabled={C.loading || fskuId == null}
          >
            {C.loading ? "加载中…" : "刷新"}
          </button>

          {!readOnly ? (
            <>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                onClick={C.addRow}
                disabled={C.loading || fskuId == null}
              >
                新增行
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                onClick={() => void C.save()}
                disabled={C.loading || fskuId == null}
              >
                保存
              </button>
            </>
          ) : null}
        </div>
      </div>

      {C.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{C.error}</div>
      ) : null}

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">
          当前 components（role 固定为 primary）
        </div>

        {fskuId == null ? (
          <div className="px-3 py-3 text-[12px] text-slate-500">未选择 FSKU。</div>
        ) : C.components.length ? (
          <div className="max-h-[320px] overflow-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left w-[140px]">item_id</th>
                  <th className="px-3 py-2 text-left w-[140px]">qty</th>
                  <th className="px-3 py-2 text-left w-[120px]">role</th>
                  <th className="px-3 py-2 text-left w-[120px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {C.components.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-50"
                        value={row.item_id == null ? "" : String(row.item_id)}
                        onChange={(e) => C.setItemId(idx, toIntOrNull(e.target.value))}
                        placeholder="例如：1"
                        disabled={readOnly || C.loading}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-50"
                        value={row.qty == null ? "" : String(row.qty)}
                        onChange={(e) => C.setQty(idx, toIntOrNull(e.target.value))}
                        placeholder="例如：2"
                        disabled={readOnly || C.loading}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-[11px] text-slate-700">primary</span>
                    </td>
                    <td className="px-3 py-2">
                      {!readOnly ? (
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => C.removeRow(idx)}
                          disabled={C.loading}
                        >
                          删除
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-3 py-3 text-[12px] text-slate-500">
            暂无 components。{readOnly ? "（已冻结，无法新增）" : "（可新增行后保存）"}
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500">
        说明：保存为“全量替换”，后端会做最终校验（包括 422/409/403），本页只展示 message。
      </div>
    </section>
  );
};
