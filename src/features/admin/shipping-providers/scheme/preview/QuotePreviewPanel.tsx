// src/features/admin/shipping-providers/scheme/preview/QuotePreviewPanel.tsx
//
// 算价预览（摘要）
// - 调用后端：POST /shipping-quote/calc（单 scheme）
// - Admin 只展示：结果摘要 + 对账摘要
// - reasons/breakdown/raw 等解释能力：迁入 DevConsole → Shipping Pricing Lab
//
// ✅ Phase 4.x 合同：warehouse_id 为强前置（起运仓上下文）
// - 前端不得绕过仓库边界发起报价
// - 不做 fallback，不做默认全仓可用

import React, { useEffect, useMemo, useState } from "react";
import { apiPost } from "../../../../../lib/api";
import type { CalcOut, Dims } from "./types";
import { normalizeAddrPart, toReasonsList } from "./utils";
import { QuotePreviewForm } from "./QuotePreviewForm";
import { QuotePreviewResult } from "./QuotePreviewResult";

// ✅ 复用仓库域现有接口：不引入新后端能力
import { fetchActiveWarehouses } from "../../../warehouses/api";
import type { WarehouseListItem } from "../../../warehouses/types";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  return code || name || `WH-${w.id}`;
}

export const QuotePreviewPanel: React.FC<{
  schemeId: number;
  disabled?: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, disabled, onError }) => {
  // ✅ 起运仓（强前置上下文）
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [whLoading, setWhLoading] = useState(false);
  const [whError, setWhError] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>("");

  async function loadWarehouses() {
    setWhLoading(true);
    setWhError(null);
    try {
      const list = await fetchActiveWarehouses();
      setWarehouses(list ?? []);
    } catch (e) {
      const msg = toHumanError(e, "加载起运仓失败");
      setWhError(msg);
      setWarehouses([]);
    } finally {
      setWhLoading(false);
    }
  }

  useEffect(() => {
    void loadWarehouses();
  }, []);

  // 如果仓库列表变化且当前选择已不存在，清空选择（避免隐式 fallback）
  useEffect(() => {
    if (!warehouseId) return;
    const wid = Number(warehouseId);
    if (!Number.isFinite(wid) || wid <= 0) return;
    const ok = warehouses.some((w) => w.id === wid);
    if (!ok) setWarehouseId("");
  }, [warehouses, warehouseId]);

  const warehouseOptions = useMemo(() => {
    const arr = [...warehouses];
    arr.sort((a, b) => warehouseLabel(a).localeCompare(warehouseLabel(b), "zh"));
    return arr.map((w) => ({ id: w.id, label: warehouseLabel(w) }));
  }, [warehouses]);

  const parsedWarehouseId = useMemo(() => {
    const n = Number(warehouseId);
    return Number.isFinite(n) ? n : NaN;
  }, [warehouseId]);

  const canCalc = useMemo(() => {
    if (disabled) return false;
    if (whLoading) return false;
    if (!Number.isFinite(parsedWarehouseId) || parsedWarehouseId <= 0) return false;
    return true;
  }, [disabled, whLoading, parsedWarehouseId]);

  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");

  const [realWeightKg, setRealWeightKg] = useState("2.36");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [flags, setFlags] = useState(""); // 逗号分隔：bulky,cold,fragile...

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcOut | null>(null);

  const parsedReal = useMemo(() => Number(realWeightKg), [realWeightKg]);

  const dims: Dims | null = useMemo(() => {
    const lt = lengthCm.trim();
    const wt = widthCm.trim();
    const ht = heightCm.trim();
    if (!lt && !wt && !ht) return null;
    if (!lt || !wt || !ht) return null;

    const l = Number(lt);
    const w = Number(wt);
    const h = Number(ht);
    if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
    if (l < 0 || w < 0 || h < 0) return null;

    return { length_cm: l, width_cm: w, height_cm: h };
  }, [lengthCm, widthCm, heightCm]);

  const showDimsWarning = useMemo(() => {
    const any = Boolean(lengthCm.trim() || widthCm.trim() || heightCm.trim());
    if (!any) return false;
    return dims === null;
  }, [lengthCm, widthCm, heightCm, dims]);

  const flagsList = useMemo(() => {
    return flags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [flags]);

  const handleCalc = async () => {
    if (!schemeId) {
      onError("缺少 scheme_id");
      return;
    }

    // ✅ 合同：warehouse_id 强前置
    if (!Number.isFinite(parsedWarehouseId) || parsedWarehouseId <= 0) {
      onError("请先选择起运仓（warehouse_id）");
      return;
    }

    if (!Number.isFinite(parsedReal) || parsedReal <= 0) {
      onError("real_weight_kg 必须是 > 0 的数字");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const provinceNorm = normalizeAddrPart(province);
      const cityNorm = normalizeAddrPart(city);

      const districtNormRaw = normalizeAddrPart(district);
      const districtNorm = districtNormRaw ? districtNormRaw : null;

      const body: Record<string, unknown> = {
        scheme_id: schemeId,

        // ✅ 强前置：起运仓上下文
        warehouse_id: parsedWarehouseId,

        dest: {
          province: provinceNorm,
          city: cityNorm,
          district: districtNorm,
        },
        real_weight_kg: parsedReal,
        flags: flagsList,
      };

      if (dims) {
        body["length_cm"] = dims.length_cm;
        body["width_cm"] = dims.width_cm;
        body["height_cm"] = dims.height_cm;
      }

      const res = await apiPost<CalcOut>("/shipping-quote/calc", body);

      // reasons 兼容（不吞错）：确保返回结构在 UI 解释链路上可用（即便 Admin 不展示 reasons）
      toReasonsList(res);

      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "算价失败";
      onError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ✅ 合同告知：这里的起运仓仅作为“预览上下文”，不等同于 scheme 已绑定起运仓（后端接口尚未暴露） */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-semibold">合同提示：起运仓为强前置</div>
        <div className="mt-1 text-amber-800">
          本预览必须选择起运仓（warehouse_id）后才能算价。这里选择的是“预览上下文”，不会写入方案绑定事实。
        </div>
      </div>

      <QuotePreviewForm
        disabled={disabled}
        loading={loading}
        // ✅ 起运仓（强前置）
        warehouseId={warehouseId}
        warehouseOptions={warehouseOptions}
        warehousesLoading={whLoading}
        warehousesError={whError}
        onChangeWarehouseId={setWarehouseId}
        onReloadWarehouses={() => void loadWarehouses()}
        canCalc={canCalc}
        // ===== 目的地 / 重量 / flags / 体积 =====
        province={province}
        city={city}
        district={district}
        onChangeProvince={setProvince}
        onChangeCity={setCity}
        onChangeDistrict={setDistrict}
        realWeightKg={realWeightKg}
        onChangeRealWeightKg={setRealWeightKg}
        flags={flags}
        onChangeFlags={setFlags}
        lengthCm={lengthCm}
        widthCm={widthCm}
        heightCm={heightCm}
        onChangeLengthCm={setLengthCm}
        onChangeWidthCm={setWidthCm}
        onChangeHeightCm={setHeightCm}
        showDimsWarning={showDimsWarning}
        onCalc={handleCalc}
      />

      <QuotePreviewResult result={result} />

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={disabled || loading}
          onClick={() => setResult(null)}
          title="清空结果"
        >
          清空结果
        </button>
      </div>
    </div>
  );
};

export default QuotePreviewPanel;
