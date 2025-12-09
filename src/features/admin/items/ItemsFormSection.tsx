// src/features/admin/items/ItemsFormSection.tsx
// 新建商品表单 + SKU 生成器（v2：记忆 + 自动编号），使用 ItemsStore 管理部分状态。

import React, { useEffect, useMemo, useState } from "react";
import { createItem } from "./api";
import type { Item } from "./api";
import { useItemsStore } from "./itemsStore";

interface SkuParts {
  category: string;
  target: string;
  brand: string;
  specCode: string;
  serial: string;
}

interface FormState {
  sku: string;
  name: string;
  spec: string;
  uom: string;
  barcode: string;
  enabled: boolean;
  weight_kg: string; // 单件重量输入（字符串），提交时解析为 number
}

const CATEGORY_OPTIONS: { code: string; label: string }[] = [
  { code: "KF", label: "KF · 干粮" },
  { code: "GT", label: "GT · 罐头" },
  { code: "LX", label: "LX · 零食" },
  { code: "BJ", label: "BJ · 保健品" },
];

const TARGET_OPTIONS: { code: string; label: string }[] = [
  { code: "C", label: "C · 猫" },
  { code: "G", label: "G · 狗" },
  { code: "T", label: "T · 通用" },
];

const BRAND_OPTIONS: { code: string; label: string }[] = [
  { code: "NZ", label: "NZ · 皇家" },
  { code: "GS", label: "GS · 冠能" },
  { code: "WP", label: "WP · 自有品牌" },
];

const EMPTY_SKU_PARTS: SkuParts = {
  category: "KF",
  target: "C",
  brand: "",
  specCode: "",
  serial: "001",
};

const EMPTY_FORM: FormState = {
  sku: "",
  name: "",
  spec: "",
  uom: "PCS",
  barcode: "",
  enabled: true,
  weight_kg: "",
};

const SKU_PARTS_LS_KEY = "wmsdu_items_sku_parts_v1";

/**
 * 从 localStorage 读取上次的 SKU 片段；
 * 若无记录，则使用默认值（KF/C/空品牌/空规格/001）。
 */
function loadSkuPartsFromStorage(): SkuParts {
  if (typeof window === "undefined") return { ...EMPTY_SKU_PARTS };
  try {
    const raw = window.localStorage.getItem(SKU_PARTS_LS_KEY);
    if (!raw) return { ...EMPTY_SKU_PARTS };
    const parsed = JSON.parse(raw) as Partial<SkuParts>;
    return {
      category: parsed.category ?? EMPTY_SKU_PARTS.category,
      target: parsed.target ?? EMPTY_SKU_PARTS.target,
      brand: parsed.brand ?? EMPTY_SKU_PARTS.brand,
      specCode: parsed.specCode ?? EMPTY_SKU_PARTS.specCode,
      serial: parsed.serial ?? EMPTY_SKU_PARTS.serial,
    };
  } catch {
    return { ...EMPTY_SKU_PARTS };
  }
}

function saveSkuPartsToStorage(parts: SkuParts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SKU_PARTS_LS_KEY, JSON.stringify(parts));
  } catch {
    // 忽略（无痕模式等）
  }
}

/**
 * 序号自动递增：
 * - "001" -> "002"
 * - "009" -> "010"
 * - "123" -> "124"
 * - 非纯数字则原样返回
 */
function nextSerial(serial: string): string {
  const s = (serial || "").trim();
  if (!s) return "001";
  const digits = s.replace(/\D/g, "");
  if (!digits) return s;
  const n = Number(digits);
  if (!Number.isFinite(n)) return s;
  const width = digits.length;
  return String(n + 1).padStart(width, "0");
}

type ApiErrorShape = {
  message?: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
};

const getErrorMessage = (e: unknown, fallback: string): string => {
  const err = e as ApiErrorShape;
  return err?.response?.data?.detail ?? err?.message ?? fallback;
};

const ItemsFormSection: React.FC = () => {
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const loadItems = useItemsStore((s) => s.loadItems);
  const items = useItemsStore((s) => s.items);

  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [skuParts, setSkuParts] = useState<SkuParts>(() =>
    loadSkuPartsFromStorage(),
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 保证 useMemo 依赖不乱：先解构 serial 出来
  const { serial } = skuParts;

  // skuParts 变化时写回 localStorage
  useEffect(() => {
    saveSkuPartsToStorage(skuParts);
  }, [skuParts]);

  // 扫描带来的条码 → 预填主条码（仅当表单还没填时）
  useEffect(() => {
    if (scannedBarcode && !form.barcode) {
      setForm((prev) => ({ ...prev, barcode: scannedBarcode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedBarcode]);

  function updateForm<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSkuPart<K extends keyof SkuParts>(
    field: K,
    value: SkuParts[K],
  ) {
    setSkuParts((prev) => ({ ...prev, [field]: value }));
  }

  // SKU 前缀
  const skuPrefix = useMemo(() => {
    const { category, target, brand, specCode } = skuParts;
    if (!category || !target || !brand || !specCode) return "";
    return (
      category.trim().toUpperCase() +
      "-" +
      target.trim().toUpperCase() +
      "-" +
      brand.trim().toUpperCase() +
      "-" +
      specCode.trim().toUpperCase()
    );
  }, [skuParts]);

  // SKU 预览
  const previewSku = useMemo(() => {
    if (!skuPrefix) return "";
    const n = serial.trim();
    const digits = n.replace(/\D/g, "");
    const padded = digits ? digits.padStart(3, "0") : "";
    return padded ? `${skuPrefix}-${padded}` : skuPrefix;
  }, [skuPrefix, serial]);

  // 是否与已有 SKU 冲突
  const skuConflict = useMemo(
    () =>
      previewSku
        ? items.some((it: Item) => it.sku === previewSku)
        : false,
    [items, previewSku],
  );

  const handleBuildSku = () => {
    setSaveError(null);

    if (!skuPrefix) {
      setSaveError("请先选择/填写 分类 + 对象 + 品牌 + 规格编码");
      return;
    }
    const n = serial.trim();
    if (!n) {
      setSaveError("请填写序号（3 位）");
      return;
    }
    const digits = n.replace(/\D/g, "");
    if (!digits) {
      setSaveError("序号必须是数字");
      return;
    }
    const padded = digits.padStart(3, "0");
    const finalSku = `${skuPrefix}-${padded}`;

    if (items.some((it) => it.sku === finalSku)) {
      setSaveError(`SKU 已存在：${finalSku}，请更换序号`);
      return;
    }

    setForm((prev) => ({ ...prev, sku: finalSku }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const sku = form.sku.trim();
    const name = form.name.trim();

    if (!sku) {
      setSaveError("SKU 必填（可先用右侧生成 SKU 再调整）。");
      return;
    }
    if (!name) {
      setSaveError("商品名称必填。");
      return;
    }

    // 解析重量
    let weight_kg: number | null = null;
    const w = form.weight_kg.trim();
    if (w) {
      const num = Number(w);
      if (!Number.isFinite(num) || num < 0) {
        setSaveError("单件重量(kg) 必须是大于等于 0 的数字");
        return;
      }
      weight_kg = num;
    }

    setSaving(true);
    try {
      await createItem({
        sku,
        name,
        spec: form.spec.trim() || undefined,
        uom: form.uom.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        enabled: form.enabled,
        weight_kg,
      });

      // 表单重置
      setForm({ ...EMPTY_FORM });

      // SKU 片段保留大部分，只自动递增序号
      setSkuParts((prev) => ({
        ...prev,
        serial: nextSerial(prev.serial),
      }));

      await loadItems();
    } catch (e: unknown) {
      console.error("createItem failed", e);
      setSaveError(getErrorMessage(e, "创建商品失败"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {/* 左：新建商品表单 */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">新建商品</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* SKU + 名称 */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">SKU</label>
              <input
                className="rounded-lg border px-3 py-2 font-mono text-sm"
                value={form.sku}
                onChange={(e) => updateForm("sku", e.target.value)}
                placeholder="KF-C-NZ-2KG-001"
              />
              <span className="text-[11px] text-slate-500">
                可直接手填，也可以右侧生成 SKU 再微调。
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">商品名称</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="如：皇家猫粮 2kg 成猫"
              />
            </div>
          </div>

          {/* 规格 / 单位 / 条码 / 重量 */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">规格说明</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                value={form.spec}
                onChange={(e) => updateForm("spec", e.target.value)}
                placeholder="如：2kg 鸡肉味"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">单位 (uom)</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                value={form.uom}
                onChange={(e) => updateForm("uom", e.target.value)}
                placeholder="KG / G / BAG / PCS / 袋 / 箱 / 罐 / 听"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                {["袋", "箱", "罐", "听", "个", "件"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    className="rounded-full border px-2 py-0.5 text-[11px] hover:bg-slate-50"
                    onClick={() => updateForm("uom", u)}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">主条码</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                value={form.barcode}
                onChange={(e) => updateForm("barcode", e.target.value)}
                placeholder="EAN13 / 内码"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">
                单件重量(kg)
              </label>
              <input
                className="rounded-lg border px-3 py-2 text-sm font-mono"
                value={form.weight_kg}
                onChange={(e) =>
                  updateForm("weight_kg", e.target.value)
                }
                placeholder="如：2.000"
              />
              <span className="text-[11px] text-slate-500">
                用于发货成本预估，后续电子秤可覆盖。
              </span>
            </div>
          </div>

          {/* 启用 + 提交按钮 */}
          <div className="mt-1 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  updateForm("enabled", e.target.checked)
                }
              />
              启用（可售）
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? "保存中…" : "保存商品"}
              </button>
              {saveError && (
                <span className="text-xs text-red-600">{saveError}</span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 右：SKU 生成器 */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <h2 className="text-sm font-semibold text-slate-800">SKU 生成器</h2>

        {/* 分类 + 对象 */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">分类代码(2)</label>
            <select
              className="rounded-lg border px-2 py-1 text-sm"
              value={skuParts.category}
              onChange={(e) =>
                updateSkuPart(
                  "category",
                  e.target.value.toUpperCase(),
                )
              }
            >
              <option value="">请选择或自填</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              className="mt-1 rounded-lg border px-2 py-1 font-mono"
              value={skuParts.category}
              onChange={(e) =>
                updateSkuPart(
                  "category",
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="自定义分类代码，如 KF / GT"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">对象代码(1)</label>
            <select
              className="rounded-lg border px-2 py-1 text-sm"
              value={skuParts.target}
              onChange={(e) =>
                updateSkuPart("target", e.target.value.toUpperCase())
              }
            >
              <option value="">请选择或自填</option>
              {TARGET_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              className="mt-1 rounded-lg border px-2 py-1 font-mono"
              value={skuParts.target}
              onChange={(e) =>
                updateSkuPart("target", e.target.value.toUpperCase())
              }
              placeholder="自定义对象代码，如 C / G / T"
            />
          </div>
        </div>

        {/* 品牌 + 规格编码 */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">品牌代码(2)</label>
            <select
              className="rounded-lg border px-2 py-1 text-sm"
              value={skuParts.brand}
              onChange={(e) =>
                updateSkuPart("brand", e.target.value.toUpperCase())
              }
            >
              <option value="">请选择或自填</option>
              {BRAND_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              className="mt-1 rounded-lg border px-2 py-1 font-mono"
              value={skuParts.brand}
              onChange={(e) =>
                updateSkuPart("brand", e.target.value.toUpperCase())
              }
              placeholder="自定义品牌代码，如 WP / RC"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              规格+口味编码(3+)
            </label>
            <input
              className="rounded-lg border px-2 py-1 font-mono"
              value={skuParts.specCode}
              onChange={(e) =>
                updateSkuPart(
                  "specCode",
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="如 2KG / CH2 / FD1 / 2KG-CH1"
            />
          </div>
        </div>

        {/* 序号 + 按钮 */}
        <div className="grid grid-cols-[1.5fr_auto] items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">
              序号(3，自填 / 自动递增)
            </label>
            <input
              className="rounded-lg border px-2 py-1 font-mono"
              value={skuParts.serial}
              onChange={(e) =>
                updateSkuPart(
                  "serial",
                  e.target.value.replace(/\s+/g, ""),
                )
              }
              placeholder="001 / 010 / 101"
            />
            {skuPrefix && (
              <span className="text-[11px] text-slate-500">
                前缀：
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">
                  {skuPrefix}
                </span>
              </span>
            )}
            {previewSku && (
              <span className="text-[11px] text-slate-500">
                预览 SKU：
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">
                  {previewSku}
                </span>
              </span>
            )}
            {skuConflict && previewSku && (
              <span className="text-[11px] text-red-600">
                SKU {previewSku} 已存在，请调整序号。
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleBuildSku}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            使用当前编码生成 SKU
          </button>
        </div>
      </div>
    </section>
  );
};

export default ItemsFormSection;
