// src/features/pms/items/components/edit/ItemAttributesSection.tsx
import React from "react";
import type { ItemAttributeDef, ItemAttributeOption } from "../../../master-data/api/masterDataApi";
import { useItemAttributesModel, type ItemAttributeDraftValue } from "./useItemAttributesModel";

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60";

const PRODUCT_KIND_ORDER = ["COMMON", "FOOD", "SUPPLY", "OTHER"] as const;

function productKindLabel(kind: string): string {
  if (kind === "COMMON") return "通用属性";
  if (kind === "FOOD") return "食品属性";
  if (kind === "SUPPLY") return "用品属性";
  if (kind === "OTHER") return "其他属性";
  return kind;
}

function typeLabel(def: ItemAttributeDef): string {
  if (def.value_type === "TEXT") return "文本输入";
  if (def.value_type === "NUMBER") return def.unit ? `数字输入 / ${def.unit}` : "数字输入";
  if (def.value_type === "OPTION") return def.selection_mode === "MULTI" ? "预设选项 / 多选" : "预设选项 / 单选";
  if (def.value_type === "BOOL") return "是/否选择";
  return def.value_type;
}

function groupedDefs(defs: ItemAttributeDef[]): Array<{ kind: string; defs: ItemAttributeDef[] }> {
  const groups: Array<{ kind: string; defs: ItemAttributeDef[] }> = [];

  for (const kind of PRODUCT_KIND_ORDER) {
    const rows = defs.filter((def) => def.product_kind === kind);
    if (rows.length > 0) {
      groups.push({ kind, defs: rows });
    }
  }

  const known = new Set(PRODUCT_KIND_ORDER);
  const others = defs.filter((def) => !known.has(def.product_kind as (typeof PRODUCT_KIND_ORDER)[number]));
  if (others.length > 0) {
    groups.push({ kind: "UNKNOWN", defs: others });
  }

  return groups;
}

function isOptionChecked(draft: ItemAttributeDraftValue, option: ItemAttributeOption): boolean {
  return draft.value_option_ids.includes(String(option.id));
}

const OptionValueList: React.FC<{
  def: ItemAttributeDef;
  draft: ItemAttributeDraftValue;
  options: ItemAttributeOption[];
  busy: boolean;
  onToggle: (def: ItemAttributeDef, optionId: number, checked: boolean) => void;
}> = ({ def, draft, options, busy, onToggle }) => {
  if (options.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400">
        暂无可选值，请先到属性模板页维护选项。
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = isOptionChecked(draft, option);

        return (
          <label
            key={option.id}
            className={
              checked
                ? "inline-flex items-center gap-2 rounded border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white"
                : "inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            }
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={busy}
              onChange={(e) => onToggle(def, option.id, e.target.checked)}
            />
            <span>{option.option_name}</span>
            <span className={checked ? "font-mono text-slate-200" : "font-mono text-slate-400"}>
              {option.option_code}
            </span>
          </label>
        );
      })}
    </div>
  );
};

const AttributeValueInput: React.FC<{
  def: ItemAttributeDef;
  draft: ItemAttributeDraftValue;
  options: ItemAttributeOption[];
  busy: boolean;
  setDraft: (attributeDefId: number, patch: Partial<ItemAttributeDraftValue>) => void;
  setOptionChecked: (def: ItemAttributeDef, optionId: number, checked: boolean) => void;
}> = ({ def, draft, options, busy, setDraft, setOptionChecked }) => {
  if (def.value_type === "TEXT") {
    return (
      <input
        className={`${inputCls} w-full`}
        value={draft.value_text}
        onChange={(e) => setDraft(def.id, { value_text: e.target.value })}
        disabled={busy}
      />
    );
  }

  if (def.value_type === "NUMBER") {
    return (
      <input
        className={`${inputCls} w-full font-mono`}
        inputMode="decimal"
        value={draft.value_number}
        onChange={(e) => setDraft(def.id, { value_number: e.target.value })}
        disabled={busy}
        placeholder={def.unit ? `单位：${def.unit}` : undefined}
      />
    );
  }

  if (def.value_type === "OPTION") {
    return (
      <OptionValueList
        def={def}
        draft={draft}
        options={options}
        busy={busy}
        onToggle={setOptionChecked}
      />
    );
  }

  if (def.value_type === "BOOL") {
    return (
      <label className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={draft.value_bool}
          onChange={(e) => setDraft(def.id, { value_bool: e.target.checked })}
          disabled={busy}
        />
        <span>{draft.value_bool ? "是" : "否"}</span>
      </label>
    );
  }

  return <div className="text-xs text-slate-400">暂不支持的属性类型：{def.value_type}</div>;
};

export const ItemAttributesSection: React.FC<{
  itemId: number;
  categoryId?: number | null;
  disabled?: boolean;
  onSaved?: () => Promise<void> | void;
}> = ({ itemId, categoryId, disabled = false, onSaved }) => {
  const m = useItemAttributesModel({ itemId, categoryId });
  const busy = disabled || m.loading || m.saving;
  const groups = groupedDefs(m.defs);

  async function handleSave() {
    const ok = await m.save();
    if (ok) {
      await onSaved?.();
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">商品属性</h3>
          <p className="mt-1 text-xs text-slate-500">
            按通用属性和当前商品类型属性分层展示。预设选项按值逐个展示，单选属性只能勾选一个，多选属性可以勾选多个。
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" className={btnCls} onClick={() => void m.refresh()} disabled={busy}>
            刷新属性
          </button>
          <button type="button" className={primaryBtnCls} onClick={() => void handleSave()} disabled={busy || m.defs.length === 0}>
            {m.saving ? "保存中…" : "保存属性"}
          </button>
        </div>
      </div>

      {m.banner ? (
        <div
          className={
            m.banner.kind === "success"
              ? "mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              : "mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {m.banner.text}
        </div>
      ) : null}

      {m.loading ? (
        <div className="text-sm text-slate-500">商品属性加载中…</div>
      ) : m.defs.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-400">
          当前商品类型下暂无属性模板。请先到「属性模板」页面维护通用、食品、用品或其他属性模板。
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.kind} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                {productKindLabel(group.kind)}
              </div>

              <div className="space-y-2">
                {group.defs.map((def) => {
                  const draft = m.drafts[def.id] ?? {
                    value_text: "",
                    value_number: "",
                    value_bool: false,
                    value_option_ids: [],
                  };
                  const options = m.optionsByDefId[def.id] ?? [];

                  return (
                    <div
                      key={def.id}
                      className="grid grid-cols-1 gap-3 rounded border border-slate-200 bg-white p-3 lg:grid-cols-[220px_minmax(0,1fr)]"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {def.name_cn}
                          {def.is_item_required ? <span className="ml-1 text-red-500">*</span> : null}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-slate-400">
                          {def.code} / {typeLabel(def)}
                        </div>
                        {def.remark ? (
                          <div className="mt-1 text-xs text-slate-400">{def.remark}</div>
                        ) : null}
                      </div>

                      <AttributeValueInput
                        def={def}
                        draft={draft}
                        options={options}
                        busy={busy}
                        setDraft={m.setDraft}
                        setOptionChecked={m.setOptionChecked}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ItemAttributesSection;
