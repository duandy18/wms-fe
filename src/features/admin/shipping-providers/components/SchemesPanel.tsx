// src/features/admin/shipping-providers/components/SchemesPanel.tsx

import React from "react";
import { UI } from "../ui";
import { type PricingScheme, type ShippingProvider } from "../api";

function formatDt(v?: string | null) {
  if (!v) return "—";
  return v.replace("T", " ").replace("Z", "");
}

function toIntOrNegInf(v: unknown) {
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

type Props = {
  selectedProvider: ShippingProvider | null;

  schemes: PricingScheme[];
  loadingSchemes: boolean;
  schemesError: string | null;

  newSchemeName: string;
  newSchemePriority: string;
  newSchemeCurrency: string;
  newSchemeSaving: boolean;

  onChangeName: (v: string) => void;
  onChangePriority: (v: string) => void;
  onChangeCurrency: (v: string) => void;

  onCreateScheme: () => void;
  onRefresh: () => void;
  onOpenWorkbench: (schemeId: number) => void;

  onClearSelectedProvider: () => void;
};

export const SchemesPanel: React.FC<Props> = ({
  selectedProvider,
  schemes,
  loadingSchemes,
  schemesError,
  newSchemeName,
  newSchemePriority,
  newSchemeCurrency,
  newSchemeSaving,
  onChangeName,
  onChangePriority,
  onChangeCurrency,
  onCreateScheme,
  onRefresh,
  onOpenWorkbench,
  onClearSelectedProvider,
}) => {
  const sortedSchemes = React.useMemo(() => {
    // 规则：启用排第一；同状态下优先级高的排前；再按 id 升序稳定
    return [...schemes].sort((a, b) => {
      const aa = a.active ? 1 : 0;
      const bb = b.active ? 1 : 0;
      if (aa !== bb) return bb - aa;

      const pa = toIntOrNegInf(a.priority);
      const pb = toIntOrNegInf(b.priority);
      if (pa !== pb) return pb - pa;

      return a.id - b.id;
    });
  }, [schemes]);

  return (
    <section className={UI.card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`${UI.h2} font-semibold text-slate-900`}>价格方案</h2>

        <div className="flex items-center gap-3">
          {selectedProvider ? (
            <div className="text-sm text-slate-600">
              物流/快递公司：<span className="font-mono">{selectedProvider.name}</span>
            </div>
          ) : (
            <div className="text-sm text-slate-500">请从左侧选择一个物流/快递公司</div>
          )}

          {selectedProvider ? (
            <button type="button" className={UI.btnSecondary} onClick={onClearSelectedProvider}>
              返回列表
            </button>
          ) : null}
        </div>
      </div>

      {schemesError && <div className={UI.error}>{schemesError}</div>}

      {!selectedProvider ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          先选一个物流/快递公司，再新建/维护价格方案。
        </div>
      ) : (
        <div className="space-y-3">
          {/* 新方案 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">新方案</div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="flex flex-col">
                <label className="text-sm text-slate-600">名称 *</label>
                <input
                  className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
                  value={newSchemeName}
                  onChange={(e) => onChangeName(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-600">优先级</label>
                <input
                  className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                  value={newSchemePriority}
                  onChange={(e) => onChangePriority(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-600">币种</label>
                <input
                  className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                  value={newSchemeCurrency}
                  onChange={(e) => onChangeCurrency(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  className={UI.btnPrimaryGreen}
                  disabled={newSchemeSaving}
                  onClick={onCreateScheme}
                >
                  {newSchemeSaving ? "创建中…" : "创建方案"}
                </button>
              </div>
            </div>
          </div>

          {/* 列表头 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {loadingSchemes ? "加载中…" : `共 ${schemes.length} 套方案`}
            </div>
            <button type="button" className={UI.btnSecondary} disabled={loadingSchemes} onClick={onRefresh}>
              刷新
            </button>
          </div>

          {/* 方案表 */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-base">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">序号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">名称</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">优先级</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">币种</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">生效窗</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">操作</th>
                </tr>
              </thead>

              <tbody>
                {sortedSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      暂无方案
                    </td>
                  </tr>
                ) : (
                  sortedSchemes.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono">{s.id}</td>
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3 font-mono">{s.priority}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            s.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {s.active ? "启用" : "停用"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono">{s.currency}</td>

                      <td className="px-4 py-3 font-mono text-sm">
                        {formatDt(s.effective_from)} ~ {formatDt(s.effective_to)}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                          onClick={() => onOpenWorkbench(s.id)}
                        >
                          打开工作台
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-slate-600">提示：工作台用于维护区域、重量段、报价与附加费。</div>
        </div>
      )}
    </section>
  );
};
