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
  onCreateProvider: () => void;

  onEditProvider: (p: ShippingProvider) => void;
  onToggleProviderActive: (p: ShippingProvider) => void;

  // ✅ Phase 6：仓库字典翻译（id -> label）
  warehouseLabelById: Record<number, string>;
  warehousesLoading: boolean;
  warehousesError: string | null;
};

export const ProvidersTable: React.FC<Props> = ({
  canWrite,
  providers,
  loading,
  error,
  onlyActive,
  onOnlyActiveChange,
  onRefresh,
  onCreateProvider,
  onEditProvider,
  onToggleProviderActive,
  warehouseLabelById,
  warehousesLoading,
  warehousesError,
}) => {
  return (
    <section className={UI.card}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className={`${UI.h2} font-semibold text-slate-900`}>仓库可用快递网点列表</h2>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={onlyActive} onChange={(e) => onOnlyActiveChange(e.target.checked)} />
            <span className={UI.small}>仅显示启用</span>
          </label>

          <button
            type="button"
            className={UI.btnSecondary}
            disabled={!canWrite || loading}
            onClick={onCreateProvider}
            title={!canWrite ? "只读模式：无写权限" : ""}
          >
            新建
          </button>

          <button type="button" disabled={loading} onClick={onRefresh} className={UI.btnSecondary}>
            刷新
          </button>
        </div>
      </div>

      {error && <div className={UI.error}>{error}</div>}
      {warehousesError && <div className={UI.error}>{warehousesError}</div>}

      <div className={UI.tableWrap}>
        <table className={UI.table}>
          <thead>
            <tr className={UI.theadRow}>
              <th className={UI.th}>序号</th>
              <th className={UI.th}>网点名称</th>
              <th className={UI.th}>网点编号</th>
              <th className={UI.th}>所属仓库</th>
              <th className={UI.th}>联系人</th>
              <th className={UI.th}>电话</th>
              <th className={UI.th}>联系人数量</th>
              <th className={UI.th}>优先级</th>
              <th className={UI.th}>状态</th>
              <th className={UI.th}>操作</th>
            </tr>
          </thead>

          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={10} className={UI.empty}>
                  暂无记录
                </td>
              </tr>
            ) : (
              providers.map((p) => {
                const primary = pickPrimaryContact(p);

                // ✅ 关键修复：warehouse_id 兜底后再索引
                const whId = p.warehouse_id ?? null;
                const whLabel = whId != null ? warehouseLabelById[whId] ?? "—" : "—";

                return (
                  <tr key={p.id} className={UI.tr}>
                    <td className={UI.tdMono}>{p.id}</td>
                    <td className={UI.td}>{renderText(p.name)}</td>
                    <td className={UI.tdMono}>{renderText(p.code ?? null)}</td>

                    <td className={UI.td} title={whId != null ? `warehouse_id=${whId}` : undefined}>
                      {warehousesLoading ? <span className="text-sm text-slate-500">加载中…</span> : whLabel}
                    </td>

                    <td className={UI.td}>{primary ? renderText(primary.name) : "未设置"}</td>
                    <td className={UI.tdMono}>{primary ? renderText(primary.phone ?? null) : "—"}</td>
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
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={!canWrite}
                        onClick={() => onEditProvider(p)}
                        title={!canWrite ? "只读模式：无写权限" : ""}
                      >
                        编辑网点
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-slate-500">说明：每一行表示一个服务某仓库区域、参与运费比价的快递网点，仅展示主联系人信息。</div>
    </section>
  );
};
