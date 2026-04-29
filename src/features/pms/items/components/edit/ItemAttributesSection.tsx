// src/features/pms/items/components/edit/ItemAttributesSection.tsx
import React from "react";
import type { ItemAttributeDef } from "../../../master-data/api/masterDataApi";
import { useItemAttributesModel } from "./useItemAttributesModel";

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60";

function typeLabel(def: ItemAttributeDef): string {
  if (def.value_type === "TEXT") return "文本";
  if (def.value_type === "NUMBER") return def.unit ? `数值 / ${def.unit}` : "数值";
  if (def.value_type === "OPTION") return "单选";
  if (def.value_type === "BOOL") return "是否";
  return def.value_type;
}

export const ItemAttributesSection: React.FC<{
  itemId: number;
  categoryId?: number | null;
  disabled?: boolean;
}> = ({ itemId, categoryId, disabled = false }) => {
  const m = useItemAttributesModel({ itemId, categoryId });
  const busy = disabled || m.loading || m.saving;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">商品属性</h3>
          <p className="mt-1 text-xs text-slate-500">
            根据当前内部分类加载属性模板。新建商品需先保存基础信息，生成 item_id 后再维护属性值。
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" className={btnCls} onClick={() => void m.refresh()} disabled={busy}>
            刷新属性
          </button>
          <button type="button" className={primaryBtnCls} onClick={() => void m.save()} disabled={busy || m.defs.length === 0}>
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
          当前商品分类下暂无属性模板。请先到「属性模板」页面维护 COMMON 或分类属性。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {m.defs.map((def) => {
            const draft = m.drafts[def.id] ?? {
              value_text: "",
              value_number: "",
              value_bool: false,
              value_option_id: "",
            };
            const options = m.optionsByDefId[def.id] ?? [];

            return (
              <label key={def.id} className="block rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="mb-1 flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                  <span>
                    {def.name_cn}
                    {def.is_required ? <span className="ml-1 text-red-500">*</span> : null}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {def.code} / {typeLabel(def)}
                  </span>
                </span>

                {def.value_type === "TEXT" ? (
                  <input
                    className={`${inputCls} w-full`}
                    value={draft.value_text}
                    onChange={(e) => m.setDraft(def.id, { value_text: e.target.value })}
                    disabled={busy}
                  />
                ) : null}

                {def.value_type === "NUMBER" ? (
                  <input
                    className={`${inputCls} w-full font-mono`}
                    inputMode="decimal"
                    value={draft.value_number}
                    onChange={(e) => m.setDraft(def.id, { value_number: e.target.value })}
                    disabled={busy}
                    placeholder={def.unit ? `单位：${def.unit}` : undefined}
                  />
                ) : null}

                {def.value_type === "OPTION" ? (
                  <select
                    className={`${inputCls} w-full`}
                    value={draft.value_option_id}
                    onChange={(e) => m.setDraft(def.id, { value_option_id: e.target.value })}
                    disabled={busy}
                  >
                    <option value="">请选择</option>
                    {options.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.option_name} / {option.option_code}
                      </option>
                    ))}
                  </select>
                ) : null}

                {def.value_type === "BOOL" ? (
                  <div className="flex h-10 items-center">
                    <input
                      type="checkbox"
                      checked={draft.value_bool}
                      onChange={(e) => m.setDraft(def.id, { value_bool: e.target.checked })}
                      disabled={busy}
                    />
                    <span className="ml-2 text-sm text-slate-700">{draft.value_bool ? "是" : "否"}</span>
                  </div>
                ) : null}

                {def.remark ? <div className="mt-1 text-xs text-slate-400">{def.remark}</div> : null}
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ItemAttributesSection;
