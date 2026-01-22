// src/features/admin/warehouses/detail/WarehouseShippingProvidersCard.tsx
import React from "react";
import { UI } from "./ui";
import type { ShippingProviderListItem, WarehouseShippingProviderListItem } from "../types";

function fmtProviderLabel(p: ShippingProviderListItem): string {
  const code = p.code ? `（${p.code}）` : "";
  return `${p.name}${code}`;
}

export const WarehouseShippingProvidersCard: React.FC<{
  canWrite: boolean;
  warehouseId: number;

  loading: boolean;
  busy: boolean;
  togglingProviderId: number | null;

  error: string | null;
  saveOk: boolean;

  items: WarehouseShippingProviderListItem[];
  providerOptions: Array<ShippingProviderListItem & { disabled: boolean; disabled_reason?: string | null }>;

  selectedProviderId: string;
  setSelectedProviderId: (v: string) => void;

  onBindSelected: () => void;
  onToggleActive: (item: WarehouseShippingProviderListItem, nextActive: boolean) => void;
  onRemove: (item: WarehouseShippingProviderListItem) => void;
}> = (p) => {
  return (
    <section className={UI.section}>
      {/* 标题 */}
      <div className="flex items-end justify-between">
        <div className={UI.title2}>可用快递公司</div>
      </div>

      {/* 状态提示 */}
      {p.saveOk && <div className={UI.spOk}>✅ 已生效</div>}
      {p.error && <div className={UI.spErr}>{p.error}</div>}

      {/* 具备服务资格 */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <div className="text-lg font-semibold text-slate-900">具备服务资格</div>
        <div className="mt-1 text-sm text-slate-500">
          说明：授予“服务资格”不会自动开始服务；开始服务需在下方列表显式勾选“正在服务”。
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-9">
            <label className="text-base text-slate-600">选择快递公司</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg"
              value={p.selectedProviderId}
              onChange={(e) => p.setSelectedProviderId(e.target.value)}
              disabled={p.loading || p.busy || !p.canWrite}
            >
              <option value="">请选择…</option>
              {p.providerOptions.map((sp) => (
                <option key={sp.id} value={String(sp.id)} disabled={sp.disabled}>
                  {fmtProviderLabel(sp)}
                  {sp.disabled_reason ? `（${sp.disabled_reason}）` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="button"
              disabled={p.busy || p.loading || !p.canWrite || !p.selectedProviderId}
              className="rounded-lg border border-slate-300 bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-60"
              onClick={p.onBindSelected}
            >
              {p.busy ? "处理中…" : "具备服务资格"}
            </button>
          </div>
        </div>
      </div>

      {/* 已具备服务资格列表 */}
      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-lg font-semibold text-slate-900">已具备服务资格</div>
          <div className="text-base text-slate-500">共 {p.items.length} 条</div>
        </div>

        {p.loading ? (
          <div className="p-6 text-base text-slate-500">加载中…</div>
        ) : p.items.length === 0 ? (
          <div className="p-6 text-base text-slate-500">当前无快递公司具备该仓库的服务资格。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-3">快递公司</th>
                  <th className="px-6 py-3">服务状态</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {p.items.map((it) => {
                  const providerInactive = !it.provider.active;
                  const isBusyRow = p.togglingProviderId === it.shipping_provider_id;

                  // 主数据禁用：允许展示/允许关闭；不允许开启
                  const disableEnableService = providerInactive && !it.active;

                  return (
                    <tr key={`${it.warehouse_id}-${it.shipping_provider_id}`} className="text-base">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{it.provider.name}</div>
                        <div className="text-sm text-slate-500">
                          {it.provider.code ? `编码：${it.provider.code}` : "编码：—"}
                          {providerInactive ? "（主数据已禁用）" : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={it.active}
                            disabled={
                              !p.canWrite ||
                              p.busy ||
                              isBusyRow ||
                              // ✅ 禁止把主数据已禁用的快递“开启服务”
                              disableEnableService
                            }
                            onChange={(e) => {
                              const next = e.target.checked;
                              // 双保险：即使被绕过 disabled，也不允许开启
                              if (providerInactive && next) return;
                              p.onToggleActive(it, next);
                            }}
                          />

                          <span>{it.active ? "正在服务" : "暂停服务"}</span>

                          {providerInactive && (
                            <span className="text-sm text-slate-500">主数据已禁用，不能开启服务</span>
                          )}

                          {isBusyRow && <span className="text-sm text-slate-500">处理中…</span>}
                        </label>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
                            disabled={!p.canWrite || p.busy}
                            onClick={() => p.onRemove(it)}
                          >
                            移除服务资格
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
