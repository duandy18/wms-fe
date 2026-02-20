// src/features/admin/items/ItemsFormSection.tsx
// 新建商品表单（路线 A：新建即完整事实，强校验）
// 拆分目标：让本文件只承担“页面编排”，把数据加载/校验/提交拆到子模块，降低维护成本

import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "./api";
import { useItemsStore } from "./itemsStore";

import { useSuppliersOptions } from "./create/useSuppliersOptions";
import { EMPTY_FORM, type FormState, type ShelfMode, type StatusMode } from "./create/types";
import { submitCreateItem, runCreateItem } from "./create/submit";

const ItemsFormSection: React.FC = () => {
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const loadItems = useItemsStore((s) => s.loadItems);

  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [created, setCreated] = useState<{ id: number; sku: string } | null>(null);

  const { suppliers, supLoading, supError } = useSuppliersOptions();

  // 扫码带入主条码（但条码仍可编辑）
  useEffect(() => {
    if (scannedBarcode && !form.barcode) {
      setForm((f) => ({ ...f, barcode: scannedBarcode }));
    }
  }, [scannedBarcode, form.barcode]);

  const shelfEnabled = useMemo(() => form.shelf_mode === "yes", [form.shelf_mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreated(null);

    const prepared = await submitCreateItem({
      form,
      suppliers,
      supLoading,
    });

    // 失败分支（SubmitResult）
    if ("ok" in prepared) {
      if (!prepared.ok) setError(prepared.error);
      return;
    }

    setSaving(true);
    try {
      const createdItem: Item = await runCreateItem(prepared.body);
      setCreated({ id: createdItem.id, sku: createdItem.sku });
      setForm({ ...EMPTY_FORM });
      await loadItems();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "创建商品失败";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">新建商品</h2>
          <div className="mt-1 text-[11px] text-slate-500">
            SKU：保存后自动生成（<span className="font-mono">AKT-000001...</span>）
          </div>
        </div>

        {created && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
            <div className="font-semibold">创建成功</div>
            <div>
              SKU：<span className="font-mono">{created.sku}</span>
            </div>
            <div>
              商品ID：<span className="font-mono">{created.id}</span>
            </div>
          </div>
        )}
      </div>

      {(supError || error) && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {supError ?? error}
        </div>
      )}

      {!supLoading && suppliers.length === 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          当前没有可用供货商（active=true）。请先到「系统管理 → 供应商主数据」新建并启用供应商。
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {/* Row 1: 商品名称 / 规格 / 主条码 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="rounded border px-3 py-2"
            placeholder="商品名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={saving}
          />

          <input
            className="rounded border px-3 py-2"
            placeholder="规格（可选，如：85g*12袋）"
            value={form.spec}
            onChange={(e) => setForm({ ...form, spec: e.target.value })}
            disabled={saving}
          />

          <input
            className="rounded border px-3 py-2 font-mono"
            placeholder="主条码"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            disabled={saving}
          />
        </div>

        {/* Row 2: 供货商 / 单位净重 / 最小包装单位 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="rounded border px-3 py-2"
            value={form.supplier_id}
            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
            disabled={supLoading || saving}
          >
            <option value="">
              {supLoading ? "供货商加载中…" : "请选择供货商（必选）"}
            </option>
            {suppliers.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            className="rounded border px-3 py-2 font-mono"
            placeholder="单位净重(kg)"
            value={form.weight_kg}
            onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
            disabled={saving}
          />

          <div className="space-y-2">
            <select
              className="w-full rounded border px-3 py-2"
              value={form.uom_mode === "preset" ? form.uom_preset : "__CUSTOM__"}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__CUSTOM__") {
                  setForm({ ...form, uom_mode: "custom", uom_custom: "" });
                } else {
                  setForm({ ...form, uom_mode: "preset", uom_preset: v });
                }
              }}
              disabled={saving}
            >
              <option value="">最小包装单位（必选）</option>
              {["PCS", "袋", "包", "罐", "瓶", "箱", "件"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="__CUSTOM__">自定义</option>
            </select>

            {form.uom_mode === "custom" && (
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="最小包装单位"
                value={form.uom_custom}
                onChange={(e) => setForm({ ...form, uom_custom: e.target.value })}
                disabled={saving}
              />
            )}
          </div>
        </div>

        {/* Row 3: 有效期 / 默认保质期数值 / 保质期单位 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="rounded border px-3 py-2"
            value={form.shelf_mode}
            onChange={(e) => {
              const v = e.target.value as ShelfMode;
              if (v === "no") {
                setForm({ ...form, shelf_mode: v, shelf_life_value: "" });
              } else {
                setForm({ ...form, shelf_mode: v });
              }
            }}
            disabled={saving}
          >
            <option value="yes">有效期：有</option>
            <option value="no">有效期：无</option>
          </select>

          <input
            className="rounded border px-3 py-2 font-mono"
            placeholder="默认保质期数值"
            value={form.shelf_life_value}
            onChange={(e) => setForm({ ...form, shelf_life_value: e.target.value })}
            disabled={!shelfEnabled || saving}
          />

          <select
            className="rounded border px-3 py-2"
            value={form.shelf_life_unit}
            onChange={(e) =>
              setForm({ ...form, shelf_life_unit: e.target.value as "MONTH" | "DAY" })
            }
            disabled={!shelfEnabled || saving}
          >
            <option value="MONTH">保质期单位：月</option>
            <option value="DAY">保质期单位：天</option>
          </select>
        </div>

        {/* Row 4: 状态 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="rounded border px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as StatusMode })}
            disabled={saving}
          >
            <option value="enabled">状态：有效</option>
            <option value="disabled">状态：无效</option>
          </select>

          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 flex items-center">
            <span className="text-slate-500">SKU：</span>
            <span className="ml-2 font-mono text-slate-900">保存后自动生成</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || supLoading || suppliers.length === 0}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {saving ? "保存中…" : "保存商品"}
        </button>
      </form>
    </section>
  );
};

export default ItemsFormSection;
