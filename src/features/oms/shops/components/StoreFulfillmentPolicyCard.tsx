// src/features/admin/stores/components/StoreFulfillmentPolicyCard.tsx

import React, { useMemo, useState } from "react";
import type { StoreBinding, WarehouseRole } from "../types";
import { bindWarehouse, deleteBinding, updateBinding } from "../api";
import { StoreBindWarehouseForm } from "../StoreBindWarehouseForm";
import { StoreDefaultWarehouseCard } from "../StoreDefaultWarehouseCard";

type Props = {
  storeId: number;
  canWrite: boolean;
  bindings: StoreBinding[];
  onReload: () => Promise<void> | void;
};

type ApiErr = { message?: string };

function sortedBindings(bindings: StoreBinding[]): StoreBinding[] {
  const arr = [...(bindings ?? [])];
  arr.sort((a, b) => {
    if (a.is_top !== b.is_top) return a.is_top ? -1 : 1;
    if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.warehouse_id - b.warehouse_id;
  });
  return arr;
}

function bindingLabel(b: StoreBinding): string {
  const parts = [
    `WH-${b.warehouse_id}`,
    b.warehouse_name ? `· ${b.warehouse_name}` : "",
    b.warehouse_code ? `（${b.warehouse_code}）` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

function roleText(b: StoreBinding): string {
  if (b.is_top) return "主仓";
  if (b.is_default) return "次仓";
  return "已绑定";
}

export const StoreFulfillmentPolicyCard: React.FC<Props> = ({ storeId, canWrite, bindings, onReload }) => {
  const rows = useMemo(() => sortedBindings(bindings ?? []), [bindings]);

  const topWarehouseId = useMemo(() => {
    const hit = rows.find((x) => x.is_top);
    return hit ? hit.warehouse_id : null;
  }, [rows]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    if (!canWrite) return;
    setSaving(true);
    setErr(null);
    try {
      await fn();
      await onReload();
    } catch (e: unknown) {
      const x = e as ApiErr;
      setErr(x?.message ?? "操作失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleBind(p: { warehouseId: number; role: WarehouseRole; priority: number }) {
    const role = p.role;

    // ✅ 中文化不暴露后端变量名：role -> 事实字段
    const is_top = role === "TOP" ? true : role === "DEFAULT" ? null : false;
    const is_default = role === "DEFAULT" ? true : false;

    await run(async () => {
      await bindWarehouse(storeId, {
        warehouse_id: p.warehouseId,
        is_default,
        is_top,
        priority: p.priority,
      });
    });
  }

  async function setAsTop(warehouseId: number) {
    await run(async () => {
      await updateBinding(storeId, warehouseId, { is_top: true });
    });
  }

  async function setAsSecondary(warehouseId: number) {
    await run(async () => {
      await updateBinding(storeId, warehouseId, { is_default: true });
    });
  }

  async function remove(warehouseId: number) {
    await run(async () => {
      await deleteBinding(storeId, warehouseId);
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-slate-900">履约策略（不拆单）</div>
          <div className="mt-1 text-sm text-slate-600">
            规则：整单同仓发货。先尝试主仓；主仓无法履约时允许切到次仓；仍无法履约则提示退货/取消（不做隐式兜底）。
          </div>
        </div>
        {saving ? <div className="text-sm text-slate-500">处理中…</div> : null}
      </div>

      {err ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
      ) : null}

      {/* 主仓选择：复用旧组件，但语义改成“主仓（TOP）” */}
      <StoreDefaultWarehouseCard
        defaultWarehouseId={topWarehouseId}
        bindings={rows}
        canWrite={canWrite}
        saving={saving}
        onSetDefault={(warehouseId) => void setAsTop(warehouseId)}
      />

      {/* 绑定列表（主仓/次仓/已绑定） */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span>仓库绑定（主仓 / 次仓 / 已绑定）</span>
          <span className="text-xs text-slate-500">共 {rows.length} 条</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            当前未绑定任何仓库：无法裁决起运仓（prepare-from-order 将返回空候选集）。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-t border-slate-200 bg-white">
                <tr className="text-slate-600">
                  <th className="px-4 py-2 text-left w-40">角色</th>
                  <th className="px-4 py-2 text-left">仓库</th>
                  <th className="px-4 py-2 text-left w-24">优先级</th>
                  <th className="px-4 py-2 text-left w-40">状态</th>
                  <th className="px-4 py-2 text-right w-56">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((b) => {
                  const isActive =
                    b.warehouse_active === undefined || b.warehouse_active === null ? true : Boolean(b.warehouse_active);

                  return (
                    <tr key={b.warehouse_id} className="text-slate-800">
                      <td className="px-4 py-3">
                        <span className="font-semibold">{roleText(b)}</span>
                        {b.is_top ? <span className="ml-2 text-xs text-slate-500">（优先）</span> : null}
                      </td>
                      <td className="px-4 py-3">{bindingLabel(b) || `WH-${b.warehouse_id}`}</td>
                      <td className="px-4 py-3 font-mono">{b.priority}</td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="text-emerald-700">启用</span>
                        ) : (
                          <span className="text-rose-700">已停用</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            disabled={!canWrite || saving}
                            onClick={() => void setAsTop(b.warehouse_id)}
                            title="设为主仓（优先）"
                          >
                            设为主仓
                          </button>

                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            disabled={!canWrite || saving}
                            onClick={() => void setAsSecondary(b.warehouse_id)}
                            title="设为次仓（备用）"
                          >
                            设为次仓
                          </button>

                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                            disabled={!canWrite || saving}
                            onClick={() => void remove(b.warehouse_id)}
                            title="解除绑定"
                          >
                            解除绑定
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

      {/* 新增绑定 */}
      <StoreBindWarehouseForm canWrite={canWrite} saving={saving} onSubmit={(p) => void handleBind(p)} />
    </section>
  );
};

export default StoreFulfillmentPolicyCard;
