// src/features/admin/shipping-providers/components/SchemesPanel.tsx

import React from "react";
import { UI } from "../ui";
import { type PricingScheme, type ShippingProvider } from "../api";

function formatDt(v?: string | null) {
  if (!v) return "—";
  return v.replace("T", " ").replace("Z", "");
}

type Props = {
  canWrite: boolean;

  selectedProvider: ShippingProvider | null;

  schemes: PricingScheme[];
  loadingSchemes: boolean;
  schemesError: string | null;

  newSchemeName: string;
  newSchemeCurrency: string;
  newSchemeSaving: boolean;

  onChangeName: (v: string) => void;
  onChangeCurrency: (v: string) => void;

  onCreateScheme: () => void;
  onRefresh: () => void;
  onOpenWorkbench: (schemeId: number) => void;

  onClearSelectedProvider: () => void;

  hasMultiActive: boolean;
  fixingActive: boolean;
  onFixMultiActive: () => void;

  settingActive: boolean;
  onSetActive: (schemeId: number) => void;
};

export const SchemesPanel: React.FC<Props> = ({
  canWrite,
  selectedProvider,
  schemes,
  loadingSchemes,
  schemesError,
  newSchemeName,
  newSchemeCurrency,
  newSchemeSaving,
  onChangeName,
  onChangeCurrency,
  onCreateScheme,
  onRefresh,
  onOpenWorkbench,
  onClearSelectedProvider,
  hasMultiActive,
  fixingActive,
  onFixMultiActive,
  settingActive,
  onSetActive,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  const sortedSchemes = React.useMemo(() => {
    // 启用排第一；同状态下 id 升序稳定
    return [...schemes].sort((a, b) => {
      const aa = a.active ? 1 : 0;
      const bb = b.active ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return a.id - b.id;
    });
  }, [schemes]);

  const visibleSchemes = React.useMemo(() => {
    if (showAll) return sortedSchemes;

    // 默认只显示 5 条：先启用，再最近停用（id 大的优先展示）
    const actives = sortedSchemes.filter((s) => s.active);
    const inactives = sortedSchemes.filter((s) => !s.active).sort((a, b) => b.id - a.id);

    const limit = 5;
    const restSlots = Math.max(0, limit - actives.length);
    return [...actives, ...inactives.slice(0, restSlots)];
  }, [sortedSchemes, showAll]);

  return (
    <section className={UI.card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`${UI.h2} font-semibold text-slate-900`}>收费标准</h2>

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

      {!canWrite && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="mt-1 text-amber-800">你没有写权限（config.store.write），可查看但不能创建/启用/修复收费标准。</div>
        </div>
      )}

      {schemesError && <div className={UI.error}>{schemesError}</div>}

      {!selectedProvider ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          先选一个物流/快递公司，再新建/维护收费标准。
        </div>
      ) : (
        <div className="space-y-3">
          {/* 多启用冲突提示 */}
          {hasMultiActive ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="font-semibold">当前存在多条“启用”收费标准（不符合单启用规则）。</div>
              <div className="mt-1 text-amber-800">
                系统应当只保留 1 条启用。点击“一键修复”将保留启用中 id 最大的一条，其余全部停用。
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                  disabled={!canWrite || fixingActive || loadingSchemes || settingActive}
                  onClick={onFixMultiActive}
                  title={!canWrite ? "只读模式：无写权限" : ""}
                >
                  {fixingActive ? "修复中…" : "一键修复"}
                </button>
              </div>
            </div>
          ) : null}

          {/* 新的收费标准 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">新的收费标准</div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm text-slate-600">名称 *</label>
                <input
                  className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
                  value={newSchemeName}
                  onChange={(e) => onChangeName(e.target.value)}
                  disabled={!canWrite}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-600">币种</label>
                <input
                  className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                  value={newSchemeCurrency}
                  onChange={(e) => onChangeCurrency(e.target.value)}
                  disabled={!canWrite}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  className={UI.btnPrimaryGreen}
                  disabled={!canWrite || newSchemeSaving}
                  onClick={onCreateScheme}
                  title={!canWrite ? "只读模式：无写权限" : ""}
                >
                  {newSchemeSaving ? "创建中…" : "创建收费标准"}
                </button>
              </div>
            </div>
          </div>

          {/* 列表头 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {loadingSchemes ? "加载中…" : `共 ${schemes.length} 条收费标准`}
              {!showAll && schemes.length > visibleSchemes.length ? (
                <span className="ml-2 text-slate-500">（当前仅展示 {visibleSchemes.length} 条）</span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className={UI.btnSecondary} disabled={loadingSchemes} onClick={onRefresh}>
                刷新
              </button>

              {schemes.length > 5 ? (
                <button type="button" className={UI.btnSecondary} onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "收起" : "展开全部"}
                </button>
              ) : null}
            </div>
          </div>

          {/* 表 */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-base">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">序号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">名称</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">币种</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">生效窗</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">操作</th>
                </tr>
              </thead>

              <tbody>
                {visibleSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      暂无收费标准
                    </td>
                  </tr>
                ) : (
                  visibleSchemes.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono">{s.id}</td>
                      <td className="px-4 py-3">{s.name}</td>

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
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                            onClick={() => onOpenWorkbench(s.id)}
                          >
                            打开收费标准
                          </button>

                          {!s.active ? (
                            <button
                              type="button"
                              className="inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                              disabled={!canWrite || settingActive || loadingSchemes || fixingActive}
                              onClick={() => onSetActive(s.id)}
                              title={!canWrite ? "只读模式：无写权限" : ""}
                            >
                              {settingActive ? "切换中…" : "设为启用"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-slate-600">
            规则：同一物流/快递公司只允许 1 条收费标准处于“启用”。历史收费标准默认折叠，必要时再展开查看。
          </div>
        </div>
      )}
    </section>
  );
};
