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

type Props = {
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
};

export const ProvidersTable: React.FC<Props> = ({
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
        </div>
      </div>

      {error && <div className={UI.error}>{error}</div>}

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
              <th className={UI.th}>收费标准</th>
              <th className={UI.th}>操作</th>
            </tr>
          </thead>

          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={9} className={UI.empty}>暂无记录</td>
              </tr>
            ) : (
              providers.map((p) => {
                const primary = pickPrimaryContact(p);
                const selected = selectedProviderId === p.id;

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
                        onClick={() => onToggleProviderActive(p)}
                        className={`rounded-full px-3 py-1 text-sm ${
                          p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.active ? "启用" : "停用"}
                      </button>
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
                      <button className={UI.btnSecondary} onClick={() => onEditProvider(p)}>
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
    </section>
  );
};
