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

  // ✅ 新增：仅当这些省被升级为“按城市配置”时，才需要在这里配置城市
  enabledProvinces: string[];

  onSave: () => void;
}> = (p) => {
  const enabled = (p.enabledProvinces ?? []).filter(Boolean);
  const enabledText = enabled.join("、");

  // 例外区折叠（默认展开；用户可收起）
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
          <div className={UI.hint}>
            当前没有省被升级为“按城市配置”，因此城市规则无需配置。
          </div>
        </div>

        <div className="text-sm text-slate-500">
          提示：当某省出现多个仓库、无法仅靠省级规则覆盖时，请先在上方【需要按城市配置的省】中升级该省，再来这里配置城市归属。
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-10">
      {/* 顶部：例外区标题 + 折叠 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className={UI.title2}>服务城市（例外）</div>
          <div className={UI.hint}>
            仅用于：{enabledText}（这些省已冻结省级规则，订单必须按城市命中）。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 disabled:opacity-60"
            onClick={() => setOpen(!open)}
          >
            {open ? "收起" : "展开"}
          </button>

          <button
            type="button"
            disabled={p.saving || p.loading || !p.canWrite}
            className={UI.spBtn}
            onClick={p.onSave}
          >
            {p.saving ? "保存中…" : "保存服务城市"}
          </button>
        </div>
      </div>

      {/* 例外提示条（更显眼） */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-base text-slate-700">
        已升级为按城市配置的省：<span className="font-semibold">{enabledText}</span>。请在下方配置这些省内的城市归属。
      </div>

      {/* 折叠内容 */}
      {!open ? null : (
        <>
          {p.saveOk && <div className={UI.spOk}>✅ 服务城市已保存</div>}

          {p.error && (
            <div className={UI.spErr}>
              <div className="font-semibold">{p.error}</div>
              {p.conflicts.length > 0 && (
                <div className="mt-2">
                  <div className="text-base text-slate-700">冲突明细：</div>
                  <ul className="mt-1 list-disc pl-5 text-base text-slate-700">
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
            <div className="text-base text-slate-500">加载服务城市中…</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* 左侧：编辑 */}
              <div className={UI.spPanel}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className={UI.spPanelTitle}>添加城市</div>
                    <div className={UI.spPanelHint}>
                      已选择 {p.preview.length} 个城市。输入城市名后点击“添加”，可用逗号/空格/换行批量输入。
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 disabled:opacity-60"
                      disabled={p.saving || !p.canWrite}
                      onClick={addCitiesFromDraft}
                    >
                      添加
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 disabled:opacity-60"
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
                    提示：已被其它仓占用的城市会在保存时被 409 阻止；若你输入了占用城市，会被自动跳过（不会加入当前仓）。
                  </div>
                </div>

                <div className={UI.spListBox}>
                  {p.preview.length === 0 ? (
                    <div className="px-2 py-2 text-base text-slate-500">当前为空：该仓库不会命中任何城市。</div>
                  ) : (
                    <ul className="space-y-1">
                      {p.preview.map((city) => {
                        const blk = isBlocked(city);
                        const removable = p.canWrite && !p.saving && !blk.blocked;

                        return (
                          <li key={city} className={`${UI.spListItem} ${blk.blocked ? "opacity-60" : UI.spListItemHover}`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-900 text-base">{city}</span>
                              {blk.blocked && <span className={UI.spListBadge}>已属于仓库 {blk.owner}</span>}
                              {!blk.blocked && blk.owner === p.warehouseId && (
                                <span className="text-sm text-emerald-700">当前仓库</span>
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

              {/* 右侧：预览 */}
              <div className={UI.spPreviewBox}>
                <div className={UI.spPreviewTitle}>预览（将被保存）</div>
                <div className={UI.spPreviewHint}>共 {p.preview.length} 个城市。保存后按中文排序。</div>
                <div className={UI.spPreviewInner}>
                  {p.preview.length === 0 ? (
                    <div className="text-base text-slate-500">当前为空：该仓库不会命中任何城市。</div>
                  ) : (
                    <ul className="space-y-1 text-base">
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
