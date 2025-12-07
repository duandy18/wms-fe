// src/features/admin/items/SkuBuilderPanel.tsx
//
// SKU 生成器 v2（独立小面板）
//
// 目标：
// - 减少脑力消耗：品牌/物种/口味/重量/单位/序号分栏选择
// - 实时预览 SKU
// - 记住上次选择（localStorage）
// - 应用后自动递增序号（B01 -> B02）
//
// 用法示例（在 ItemsFormSection 里）：
// <SkuBuilderPanel
//   currentSku={form.sku}
//   onApplySku={(sku) => setForm((f) => ({ ...f, sku }))}
// />

import React, { useEffect, useMemo, useState } from "react";

const LS_KEY = "wmsdu_sku_builder_last_v1";

type Props = {
  currentSku?: string | null;
  onApplySku: (sku: string) => void;
};

type LastState = {
  brand: string;
  species: string;
  flavor: string;
  weight: string;
  unit: string;
  seq: string;
};

function loadLastState(): LastState {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) {
      return {
        brand: "",
        species: "",
        flavor: "",
        weight: "",
        unit: "G",
        seq: "B01",
      };
    }
    const parsed = JSON.parse(raw) as Partial<LastState>;
    return {
      brand: parsed.brand ?? "",
      species: parsed.species ?? "",
      flavor: parsed.flavor ?? "",
      weight: parsed.weight ?? "",
      unit: parsed.unit ?? "G",
      seq: parsed.seq ?? "B01",
    };
  } catch {
    return {
      brand: "",
      species: "",
      flavor: "",
      weight: "",
      unit: "G",
      seq: "B01",
    };
  }
}

function saveLastState(state: LastState) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // 忽略存储错误（无痕模式等）
  }
}

// 简单的序号递增：
// - "B01" -> "B02"
// - "B09" -> "B10"
// - "01"  -> "02"
// - 其他不符合规则时，直接返回原值
function nextSeq(seq: string): string {
  const s = (seq || "").trim();
  if (!s) return "B01";

  // 匹配 [字母前缀][数字部分]
  const m = s.match(/^([A-Za-z]*)(\d+)$/);
  if (!m) return s;

  const prefix = m[1];
  const numStr = m[2];
  const width = numStr.length;

  const n = Number(numStr);
  if (!Number.isFinite(n)) return s;

  const next = (n + 1).toString().padStart(width, "0");
  return `${prefix}${next}`;
}

export const SkuBuilderPanel: React.FC<Props> = ({
  currentSku,
  onApplySku,
}) => {
  const [brand, setBrand] = useState("");
  const [species, setSpecies] = useState("");
  const [flavor, setFlavor] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("G");
  const [seq, setSeq] = useState("B01");

  // 首次挂载时从 localStorage 读上次选择
  useEffect(() => {
    const last = loadLastState();
    setBrand(last.brand);
    setSpecies(last.species);
    setFlavor(last.flavor);
    setWeight(last.weight);
    setUnit(last.unit);
    setSeq(last.seq);
  }, []);

  // 任意字段变化时写回 localStorage
  useEffect(() => {
    const state: LastState = { brand, species, flavor, weight, unit, seq };
    saveLastState(state);
  }, [brand, species, flavor, weight, unit, seq]);

  const preview = useMemo(() => {
    const parts: string[] = [];

    if (brand.trim()) parts.push(brand.trim());
    if (species.trim()) parts.push(species.trim());
    if (flavor.trim()) parts.push(flavor.trim());

    const w = weight.trim();
    const u = unit.trim();
    if (w) {
      parts.push(u ? `${w}${u}` : w);
    }

    const prefix = parts.join("-");
    const seqPart = seq.trim();
    if (!prefix && !seqPart) return "";

    return seqPart ? `${prefix}-${seqPart}` : prefix;
  }, [brand, species, flavor, weight, unit, seq]);

  const canApply = !!preview.trim();

  const handleApply = () => {
    if (!preview.trim()) return;
    onApplySku(preview.trim());
  };

  const handleApplyAndNext = () => {
    if (!preview.trim()) return;
    onApplySku(preview.trim());
    setSeq((prev) => nextSeq(prev));
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          SKU 生成器（实验版）
        </h3>
        {currentSku && (
          <span className="text-[11px] text-slate-500">
            当前 SKU：<span className="font-mono">{currentSku}</span>
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        按「品牌 / 物种 / 口味 / 重量 / 单位 / 序号」拼出规范 SKU，自动记住上次选择。
        适合猫粮这类标准化商品。
      </p>

      {/* 字段区：两列布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-slate-600">品牌（Brand）</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            placeholder="例如 NP、BR01"
            value={brand}
            onChange={(e) => setBrand(e.target.value.trim().toUpperCase())}
          />
          <p className="text-[11px] text-slate-400">
            建议用简写编码，例如 NP（某品牌）或 BR01。
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-slate-600">物种（Species）</label>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="">未指定</option>
            <option value="C">C（猫）</option>
            <option value="D">D（狗）</option>
            <option value="O">O（其他）</option>
          </select>
          <p className="text-[11px] text-slate-400">
            C=猫，D=狗；也可以自定义其他缩写。
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-slate-600">口味 / 系列（Flavor）</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            placeholder="例如 CH（鸡肉）、SA（鲑鱼）"
            value={flavor}
            onChange={(e) => setFlavor(e.target.value.trim().toUpperCase())}
          />
          <p className="text-[11px] text-slate-400">
            建议用 2~4 位缩写，例如 CH（鸡）、SA（鲑鱼）、TU（金枪鱼）。
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-slate-600">重量 + 单位</label>
          <div className="flex gap-2">
            <input
              className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="重量"
              value={weight}
              onChange={(e) => setWeight(e.target.value.trim().toUpperCase())}
            />
            <select
              className="w-20 rounded border border-slate-300 px-2 py-1 text-xs"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="G">G</option>
              <option value="KG">KG</option>
              <option value="ML">ML</option>
              <option value="L">L</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400">
            例如 500 + G → 500G，2 + KG → 2KG。
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-slate-600">序号（Seq）</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            placeholder="例如 B01、B02"
            value={seq}
            onChange={(e) => setSeq(e.target.value.trim().toUpperCase())}
          />
          <p className="text-[11px] text-slate-400">
            支持前缀+数字，例如 B01，自动递增会保持前缀和位数。
          </p>
        </div>
      </div>

      {/* 预览区 */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600">预览 SKU：</span>
          {preview ? (
            <span className="font-mono text-sm text-slate-900">
              {preview}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              请先填写品牌 / 物种 / 口味 / 重量 / 序号中的至少一项。
            </span>
          )}
        </div>
      </div>

      {/* 按钮区 */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          disabled={!canApply}
          onClick={handleApply}
          className={
            "px-3 py-1 rounded border text-xs " +
            (canApply
              ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed")
          }
        >
          应用到当前商品
        </button>
        <button
          type="button"
          disabled={!canApply}
          onClick={handleApplyAndNext}
          className={
            "px-3 py-1 rounded border text-xs " +
            (canApply
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed")
          }
        >
          应用并递增序号
        </button>
        <span className="text-[11px] text-slate-400">
          适合批量录入同一品牌/物种/系列的多个规格，只需修改重量和序号。
        </span>
      </div>
    </section>
  );
};
