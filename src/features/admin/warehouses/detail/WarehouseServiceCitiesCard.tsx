// src/features/admin/warehouses/detail/WarehouseServiceCitiesCard.tsx
import React, { useMemo, useState } from "react";
import { UI } from "./ui";
import type { ServiceCityConflict } from "./useWarehouseServiceCitiesModel";

function toSet(list: string[]): Set<string> {
  const s = new Set<string>();
  for (const x of list || []) {
    const v = (x || "").trim();
    if (v) s.add(v);
  }
  return s;
}

function sortZh(list: string[]): string[] {
  return [...list].sort((a, b) => a.localeCompare(b, "zh"));
}

function parseCityInput(raw: string): string[] {
  const s = (raw || "").trim();
  if (!s) return [];
  return s
    .split(/[\n,，、\s]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export const WarehouseServiceCitiesCard: React.FC<{
  canWrite: boolean;
  warehouseId: number;

  loading: boolean;
  saving: boolean;

  error: string | null;
  saveOk: boolean;

  text: string;
  setText: (v: string) => void;

  conflicts: ServiceCityConflict[];
  preview: string[];

  ownerByCity: Record<string, number>;

  enabledProvinces: string[];

  onSave: () => void;
}> = (p) => {
  const enabled = (p.enabledProvinces ?? []).filter(Boolean);
  const enabledText = enabled.join("、");

  const [open, setOpen] = useState(true);

  const selected = useMemo(() => toSet(p.preview), [p.preview]);
  const [draft, setDraft] = useState("");

  function isBlocked(city: string): { blocked: boolean; owner?: number } {
    const owner = p.ownerByCity[city];
    if (!owner) return { blocked: false };
    if (owner === p.warehouseId) return { blocked: false, owner };
    return { blocked: true, owner };
  }

  function writeSelected(next: Set<string>) {
    p.setText(sortZh(Array.from(next)).join("\n"));
  }

  function addCitiesFromDraft() {
    const parts = parseCityInput(draft);
    if (!parts.length) return;

    const next = new Set(selected);
    for (const city of parts) {
      const blk = isBlocked(city);
      if (blk.blocked) continue;
      next.add(city);
    }
    writeSelected(next);
    setDraft("");
  }

  function removeCity(city: string) {
    const next = new Set(selected);
    next.delete(city);
    writeSelected(next);
  }

  function clearAll() {
    p.setText("");
    setDraft("");
  }

  // 没有任何升级省份：城市规则无需配置（例外区空态）
  if (enabled.length === 0) {
    return (
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-10">
        <div>
          <div className={UI.title2}>服务城市（例外）</div>
          <div className={UI.hint}>当前没有省被设为按城市配置，因此城市规则无需配置。</div>
        </div>

        <div className="text-sm text-slate-500">
          提示：当某省需要按城市划分时，请先在上方省列表中将该省切换为「按城市」，再来这里配置城市归属。
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className={UI.title2}>服务城市（例外）</div>
          <div className={UI.hint}>仅用于：{enabledText}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => setOpen(!open)}
          >
            {open ? "收起" : "展开"}
          </button>

          {/* ✅ 保存按钮：变小 + 去黑（统一风格） */}
          <button
            type="button"
            disabled={p.saving || p.loading || !p.canWrite}
            onClick={p.onSave}
            className="rounded-lg border border-slate-300 bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-60"
          >
            {p.saving ? "保存中…" : "保存服务城市"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-700">
        已设为按城市配置的省：<span className="font-semibold">{enabledText}</span>。请在下方配置这些省内的城市归属。
      </div>

      {!open ? null : (
        <>
          {p.saveOk && <div className="text-sm text-emerald-700">✅ 服务城市已保存</div>}

          {p.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="font-semibold">{p.error}</div>
              {p.conflicts.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-slate-700">冲突明细：</div>
                  <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                    {p.conflicts.map((c) => (
                      <li key={`${c.city}-${c.owner_warehouse_id}`}>
                        {c.city} 已属于仓库 {c.owner_warehouse_id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {p.loading ? (
            <div className="text-sm text-slate-500">加载服务城市中…</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className={UI.spPanel}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className={UI.spPanelTitle}>添加城市</div>
                    <div className={UI.spPanelHint}>
                      已选择 {p.preview.length} 个城市。可用逗号/空格/换行批量输入。
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      disabled={p.saving || !p.canWrite}
                      onClick={addCitiesFromDraft}
                    >
                      添加
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      disabled={p.saving || !p.canWrite}
                      onClick={clearAll}
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className={UI.spSearchLabel}>城市输入</label>
                  <input
                    className={UI.spSearchInput}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="例如：石家庄市，廊坊市"
                    disabled={p.saving}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCitiesFromDraft();
                      }
                    }}
                  />
                  <div className="mt-2 text-sm text-slate-500">
                    提示：已被其它仓占用的城市会被阻止；输入后若冲突，会自动跳过（不会加入当前仓）。
                  </div>
                </div>

                <div className={UI.spListBox}>
                  {p.preview.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-slate-500">当前为空：该仓库不会命中任何城市。</div>
                  ) : (
                    <ul className="space-y-1">
                      {p.preview.map((city) => {
                        const blk = isBlocked(city);
                        const removable = p.canWrite && !p.saving && !blk.blocked;

                        return (
                          <li key={city} className={`${UI.spListItem} ${blk.blocked ? "opacity-60" : UI.spListItemHover}`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-900 text-sm">{city}</span>
                              {blk.blocked && <span className={UI.spListBadge}>已属于仓库 {blk.owner}</span>}
                              {!blk.blocked && blk.owner === p.warehouseId && (
                                <span className="text-xs text-emerald-700">当前仓库</span>
                              )}
                            </div>

                            <div className="ml-auto">
                              <button
                                type="button"
                                className="text-sm text-slate-700 underline disabled:opacity-60"
                                disabled={!removable}
                                onClick={() => removeCity(city)}
                              >
                                删除
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className={UI.spPreviewBox}>
                <div className={UI.spPreviewTitle}>预览（将被保存）</div>
                <div className={UI.spPreviewHint}>共 {p.preview.length} 个城市。保存后按中文排序。</div>
                <div className={UI.spPreviewInner}>
                  {p.preview.length === 0 ? (
                    <div className="text-sm text-slate-500">当前为空：该仓库不会命中任何城市。</div>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {p.preview.map((city) => (
                        <li key={city} className="font-mono">
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
