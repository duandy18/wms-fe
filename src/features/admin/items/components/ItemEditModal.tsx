// src/features/admin/items/components/ItemEditModal.tsx

import React from "react";
import type { Supplier } from "../../suppliers/api";

export type ItemDraft = {
  name: string;
  supplier_id: number | null;
  weight_kg: string;

  uom_mode: "preset" | "custom";
  uom_preset: string;
  uom_custom: string;

  shelf_mode: "yes" | "no";
  shelf_value: string;
  shelf_unit: "MONTH" | "DAY";

  enabled: boolean;
};

const COMMON_UOMS = ["袋", "个", "罐", "箱", "瓶"];

export const ItemEditModal: React.FC<{
  open: boolean;
  saving: boolean;

  suppliers: Supplier[];
  supLoading: boolean;

  error: string | null;
  supError: string | null;

  draft: ItemDraft;
  onChangeDraft: (next: ItemDraft) => void;

  onClose: () => void;
  onSave: () => void;
}> = ({ open, saving, suppliers, supLoading, error, supError, draft, onChangeDraft, onClose, onSave }) => {
  if (!open) return null;

  const effectiveUom = draft.uom_mode === "preset" ? draft.uom_preset.trim() : draft.uom_custom.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto space-y-5 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">编辑商品</h3>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        {(error || supError) ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">{error ?? supError}</div>
        ) : null}

        <div className="space-y-2">
          <div className="text-sm font-medium">商品名称</div>
          <input
            className="w-full rounded border px-3 py-2 text-base"
            value={draft.name}
            onChange={(e) => onChangeDraft({ ...draft, name: e.target.value })}
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">供货商</div>
          <select
            className="w-full rounded border px-3 py-2 text-base"
            value={draft.supplier_id ?? ""}
            onChange={(e) => onChangeDraft({ ...draft, supplier_id: e.target.value ? Number(e.target.value) : null })}
            disabled={saving || supLoading}
          >
            <option value="">{supLoading ? "加载中…" : "请选择供货商（必选）"}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">单位净重（kg）</div>
            <input
              className="w-full rounded border px-3 py-2 text-base font-mono"
              value={draft.weight_kg}
              onChange={(e) => onChangeDraft({ ...draft, weight_kg: e.target.value })}
              disabled={saving}
              placeholder="可为空"
            />
            <div className="text-[11px] text-slate-500">表示 1 个「最小包装单位」的净重（统一用 kg 存储）。</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">最小包装单位</div>
            <select
              className="w-full rounded border px-3 py-2 text-base"
              value={draft.uom_mode === "preset" ? draft.uom_preset : "__CUSTOM__"}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__CUSTOM__") onChangeDraft({ ...draft, uom_mode: "custom", uom_custom: "" });
                else onChangeDraft({ ...draft, uom_mode: "preset", uom_preset: v });
              }}
              disabled={saving}
            >
              {COMMON_UOMS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="__CUSTOM__">自定义</option>
            </select>

            {draft.uom_mode === "custom" ? (
              <input
                className="w-full rounded border px-3 py-2 text-base"
                placeholder="输入最小包装单位"
                value={draft.uom_custom}
                onChange={(e) => onChangeDraft({ ...draft, uom_custom: e.target.value })}
                disabled={saving}
              />
            ) : null}

            <div className="text-[11px] text-slate-500">系统中库存数量、重量、有效期均以此为最小单位计算。</div>
            <div className="text-[11px] text-slate-500">当前单位：<span className="font-mono">{effectiveUom || "—"}</span></div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">有效期</div>
            <select
              className="w-full rounded border px-3 py-2 text-base"
              value={draft.shelf_mode}
              onChange={(e) => {
                const v = e.target.value as "yes" | "no";
                if (v === "no") onChangeDraft({ ...draft, shelf_mode: v, shelf_value: "" });
                else onChangeDraft({ ...draft, shelf_mode: v });
              }}
              disabled={saving}
            >
              <option value="yes">有</option>
              <option value="no">无</option>
            </select>
          </div>
        </div>

        {draft.shelf_mode === "yes" ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-800">默认有效期参数（可选）</div>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                className="rounded border px-3 py-2 text-base font-mono"
                placeholder="例如 18（留空=不设置默认）"
                value={draft.shelf_value}
                onChange={(e) => onChangeDraft({ ...draft, shelf_value: e.target.value })}
                disabled={saving}
              />
              <select
                className="rounded border px-3 py-2 text-base"
                value={draft.shelf_unit}
                onChange={(e) => onChangeDraft({ ...draft, shelf_unit: e.target.value as "MONTH" | "DAY" })}
                disabled={saving || !draft.shelf_value.trim()}
                title={!draft.shelf_value.trim() ? "未填写数值时无需选择单位" : ""}
              >
                <option value="MONTH">月</option>
                <option value="DAY">天</option>
              </select>
              <div className="flex items-center text-[11px] text-slate-500">入库时：有生产日期可自动算到期日；也允许直接填到期日。</div>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-sm font-medium">状态</div>
          <label className="inline-flex items-center gap-2 text-base">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(e) => onChangeDraft({ ...draft, enabled: e.target.checked })}
              disabled={saving}
            />
            有效
          </label>
          <div className="text-[11px] text-slate-500">无效商品禁止新入库、新采购、扫描选择与新增条码绑定；不影响历史记录。</div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="rounded border px-4 py-2 text-base" onClick={onClose} disabled={saving}>
            取消
          </button>
          <button className="rounded bg-slate-900 px-5 py-2 text-base text-white disabled:opacity-60" onClick={onSave} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemEditModal;
