// src/features/admin/shipping-providers/components/ProvidersTable.tsx

import React from "react";
import { UI } from "../ui";
import { type ShippingProvider, type ShippingProviderContact } from "../api";

function renderText(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}
function renderNumber(v: number | null | undefined) {
  return typeof v === "number" && !Number.isNaN(v) ? v : "—";
}
function pickPrimaryContact(provider: ShippingProvider): ShippingProviderContact | null {
  const list = provider.contacts ?? [];
  if (list.length === 0) return null;
  return list.find((c) => c.is_primary) ?? list[0] ?? null;
}

function getContactsCount(provider: ShippingProvider): number {
  return (provider.contacts ?? []).length;
}

function formatContactSummary(primary: ShippingProviderContact | null): string {
  if (!primary) return "未设置";
  const name = renderText(primary.name);
  const phone = renderText(primary.phone ?? null);
  return phone === "—" ? name : `${name} / ${phone}`;
}

type ProviderWarehouseUsage = {
  qualifiedWarehouseLabels: string[];
  activeWarehouseLabels: string[];
};

function summarizeLabels(labels: string[]): { text: string; title: string } {
  const xs = labels ?? [];
  if (xs.length === 0) return { text: "—", title: "" };
  const shown = xs.slice(0, 2);
  const rest = xs.length - shown.length;
  const text = rest > 0 ? `${shown.join("、")} +${rest}` : shown.join("、");
  const title = xs.join("、");
  return { text, title };
}

type Props = {
  canWrite: boolean;

  providers: ShippingProvider[];
  loading: boolean;
  error: string | null;

  onlyActive: boolean;
  onOnlyActiveChange: (v: boolean) => void;

  search: string;
  onSearchChange: (v: string) => void;

  onRefresh: () => void;

  selectedProviderId: number | null;
  onSelectProviderForSchemes: (id: number) => void;

  onEditProvider: (p: ShippingProvider) => void;
  onToggleProviderActive: (p: ShippingProvider) => void;

  // ✅ 只读事实：被哪些仓使用（资格/正在服务）
  usageByProviderId: Record<number, ProviderWarehouseUsage>;
  usageLoading: boolean;
  usageError: string | null;
  onRefreshUsage: () => void;
};

export const ProvidersTable: React.FC<Props> = ({
  canWrite,
  providers,
  loading,
  error,
  onlyActive,
  onOnlyActiveChange,
  onRefresh,
  selectedProviderId,
  onSelectProviderForSchemes,
  onEditProvider,
  onToggleProviderActive,
  usageByProviderId,
  usageLoading,
  usageError,
  onRefreshUsage,
}) => {
  return (
    <section className={UI.card}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className={`${UI.h2} font-semibold text-slate-900`}>物流/快递公司列表</h2>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => onOnlyActiveChange(e.target.checked)}
            />
            <span className={UI.small}>仅显示启用</span>
          </label>

          <button type="button" disabled={loading} onClick={onRefresh} className={UI.btnSecondary}>
            刷新
          </button>

          <button
            type="button"
            disabled={usageLoading}
            onClick={onRefreshUsage}
            className={UI.btnSecondary}
            title="刷新“被哪些仓使用”的只读事实"
          >
            刷新使用情况
          </button>
        </div>
      </div>

      {error && <div className={UI.error}>{error}</div>}
      {usageError && <div className={UI.error}>{usageError}</div>}

      <div className={UI.tableWrap}>
        <table className={UI.table}>
          <thead>
            <tr className={UI.theadRow}>
              <th className={UI.th}>序号</th>
              <th className={UI.th}>名称</th>
              <th className={UI.th}>编码</th>
              <th className={UI.th}>联系人摘要</th>
              <th className={UI.th}>联系人数量</th>
              <th className={UI.th}>优先级</th>
              <th className={UI.th}>状态</th>

              {/* ✅ 只读事实展示：不在快递公司页做绑定/履约配置 */}
              <th className={UI.th}>被哪些仓使用（事实）</th>

              <th className={UI.th}>收费标准</th>
              <th className={UI.th}>操作</th>
            </tr>
          </thead>

          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={10} className={UI.empty}>暂无记录</td>
              </tr>
            ) : (
              providers.map((p) => {
                const primary = pickPrimaryContact(p);
                const selected = selectedProviderId === p.id;

                const usage = usageByProviderId[p.id] ?? { qualifiedWarehouseLabels: [], activeWarehouseLabels: [] };
                const q = summarizeLabels(usage.qualifiedWarehouseLabels);
                const a = summarizeLabels(usage.activeWarehouseLabels);

                return (
                  <tr key={p.id} className={UI.tr}>
                    <td className={UI.tdMono}>{p.id}</td>
                    <td className={UI.td}>{renderText(p.name)}</td>
                    <td className={UI.tdMono}>{renderText(p.code ?? null)}</td>
                    <td className={UI.td}>{formatContactSummary(primary)}</td>
                    <td className={UI.tdMono}>{getContactsCount(p)}</td>
                    <td className={UI.tdMono}>{renderNumber(p.priority)}</td>

                    <td className={UI.td}>
                      <button
                        type="button"
                        disabled={!canWrite || loading}
                        onClick={() => onToggleProviderActive(p)}
                        className={`rounded-full px-3 py-1 text-sm disabled:opacity-60 ${
                          p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                        }`}
                        title={!canWrite ? "只读模式：无写权限" : ""}
                      >
                        {p.active ? "启用" : "停用"}
                      </button>
                    </td>

                    <td className={UI.td}>
                      {usageLoading ? (
                        <div className="text-sm text-slate-500">加载中…</div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm text-slate-700" title={q.title}>
                            资格：{q.text}
                          </div>
                          <div className="text-sm text-slate-700" title={a.title}>
                            服务：{a.text}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className={UI.td}>
                      <button
                        className={`${UI.badgeBtn} ${selected ? UI.badgeBtnActive : UI.badgeBtnIdle}`}
                        onClick={() => onSelectProviderForSchemes(p.id)}
                      >
                        查看收费标准
                      </button>
                    </td>

                    <td className={UI.td}>
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={!canWrite}
                        onClick={() => onEditProvider(p)}
                        title={!canWrite ? "只读模式：无写权限" : ""}
                      >
                        管理联系人
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        说明：本页只读展示“快递公司被哪些仓授予资格/正在服务”的事实；履约资格的写入与启停必须在【仓库详情 → 可用快递公司】中操作。
      </div>
    </section>
  );
};
