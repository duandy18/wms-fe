// src/features/admin/shipping-providers/pages/edit/SchemesSectionCard.tsx
import React, { useMemo, useState } from "react";
import { UI } from "../../ui";
import type { PricingScheme } from "../../api/types";
import { createPricingScheme, patchPricingScheme } from "../../api/schemes";

function badge(active: boolean) {
  return active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700";
}

export const SchemesSectionCard: React.FC<{
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;

  schemes: PricingScheme[];
  loading: boolean;
  error: string | null;

  onRefresh: () => void | Promise<void>;
  onOpenWorkbench: (schemeId: number) => void;
}> = ({ canWrite, busy, providerId, schemes, loading, error, onRefresh, onOpenWorkbench }) => {
  const disabled = busy || !canWrite;

  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("CNY");
  const [creating, setCreating] = useState(false);
  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const summary = useMemo(() => {
    const total = schemes.length;
    const activeN = schemes.filter((s) => s.active).length;
    return { total, activeN };
  }, [schemes]);

  async function onCreate() {
    if (!providerId) return;
    if (disabled) return;

    setLocalErr(null);
    const name = newName.trim();
    if (!name) {
      setLocalErr("收费标准名称不能为空");
      return;
    }
    setCreating(true);
    try {
      await createPricingScheme(providerId, { name, currency: newCurrency || "CNY" });
      setNewName("");
      await onRefresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "创建失败";
      setLocalErr(msg);
    } finally {
      setCreating(false);
    }
  }

  async function setActive(schemeId: number, active: boolean) {
    if (disabled) return;
    setLocalErr(null);
    setRowBusy(schemeId);
    try {
      await patchPricingScheme(schemeId, { active });
      await onRefresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "操作失败";
      setLocalErr(msg);
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <section className={UI.card}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={`${UI.h2} font-semibold text-slate-900`}>收费标准</div>
          <div className="text-xs text-red-500">[SCHEMES-CARD-NEW]</div>
          <div className="mt-1 text-sm text-slate-600">
            当前 {summary.total} 条（启用 {summary.activeN} 条）。深度编辑请进入工作台。
          </div>
        </div>

        <button type="button" className={UI.btnSecondary} disabled={loading} onClick={() => void onRefresh()}>
          刷新
        </button>
      </div>

      {(error || localErr) && <div className={`mt-3 ${UI.error}`}>{error ?? localErr}</div>}

      {!providerId ? (
        <div className="mt-3 text-sm text-slate-500">请先保存网点基础信息，再维护收费标准。</div>
      ) : (
        <>
          {/* 创建区 */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-3">
              <label className={UI.label}>新建收费标准名称 *</label>
              <input
                className={UI.input}
                value={newName}
                disabled={disabled || creating}
                placeholder="例如：河北一仓-标准件"
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="md:col-span-1">
              <label className={UI.label}>币种</label>
              <input
                className={UI.inputMono}
                value={newCurrency}
                disabled={disabled || creating}
                onChange={(e) => setNewCurrency(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button type="button" className={UI.btnPrimary} disabled={disabled || creating} onClick={() => void onCreate()}>
                {creating ? "创建中…" : "创建收费标准"}
              </button>
            </div>
          </div>

          {/* 列表区 */}
          <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">名称</th>
                  <th className="px-3 py-2 text-left">币种</th>
                  <th className="px-3 py-2 text-left">优先级</th>
                  <th className="px-3 py-2 text-left">状态</th>
                  <th className="px-3 py-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-3 py-2 font-mono">{s.id}</td>
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2 font-mono">{s.currency}</td>
                    <td className="px-3 py-2 font-mono">{typeof s.priority === "number" ? s.priority : "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(Boolean(s.active))}`}>
                        {s.active ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className={UI.btnSecondary} onClick={() => onOpenWorkbench(s.id)}>
                          打开工作台
                        </button>

                        {s.active ? (
                          <button
                            type="button"
                            className={UI.btnSecondary}
                            disabled={disabled || rowBusy === s.id}
                            onClick={() => void setActive(s.id, false)}
                          >
                            停用
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={UI.btnSecondary}
                            disabled={disabled || rowBusy === s.id}
                            onClick={() => void setActive(s.id, true)}
                          >
                            设为启用
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {schemes.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={6}>
                      暂无收费标准
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
