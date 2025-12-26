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
};

export const ProvidersTable: React.FC<Props> = ({
  providers,
  loading,
  error,
  onlyActive,
  onOnlyActiveChange,
  search,
  onSearchChange,
  onRefresh,
  selectedProviderId,
  onSelectProviderForSchemes,
  onEditProvider,
}) => {
  return (
    <section className={UI.card}>
      <div className={UI.providersHeadRow}>
        <h2 className={`${UI.h2} font-semibold text-slate-900`}>物流/快递公司列表</h2>

        <div className={UI.providersFiltersRow}>
          <label className={UI.providersOnlyActiveLabel}>
            <input
              type="checkbox"
              className={UI.providersOnlyActiveCheckbox}
              checked={onlyActive}
              onChange={(e) => onOnlyActiveChange(e.target.checked)}
            />
            <span className={UI.small}>仅显示启用</span>
          </label>

          <input
            className={UI.providersSearchInput}
            placeholder="名称 / 联系人 搜索"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <button type="button" disabled={loading} onClick={onRefresh} className={UI.btnSecondary}>
            {loading ? "查询中…" : "刷新"}
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
              <th className={UI.th}>主联系人</th>
              <th className={UI.th}>电话</th>
              <th className={UI.th}>优先级</th>
              <th className={UI.th}>状态</th>
              <th className={UI.th}>报价</th>
              <th className={UI.th}>操作</th>
            </tr>
          </thead>

          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={9} className={UI.empty}>
                  暂无记录
                </td>
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

                    <td className={UI.td}>{renderText(primary?.name ?? null)}</td>
                    <td className={UI.tdMono}>{renderText(primary?.phone ?? null)}</td>

                    <td className={UI.tdMono}>{renderNumber(p.priority)}</td>

                    <td className={UI.td}>
                      <span className={`${UI.pill} ${p.active ? UI.pillActive : UI.pillInactive}`}>
                        {p.active ? "启用" : "停用"}
                      </span>
                    </td>

                    <td className={UI.td}>
                      <button
                        type="button"
                        className={`${UI.badgeBtn} ${selected ? UI.badgeBtnActive : UI.badgeBtnIdle}`}
                        onClick={() => onSelectProviderForSchemes(p.id)}
                      >
                        {selected ? "已选中" : "查看报价"}
                      </button>
                    </td>

                    <td className={UI.td}>
                      <button type="button" className={UI.btnSecondary} onClick={() => onEditProvider(p)}>
                        编辑
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

export default ProvidersTable;
