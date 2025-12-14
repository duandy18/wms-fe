// src/features/operations/ship/ShipCockpitPage.tsx
//
// 发货 Ship Cockpit（作业台）
// - 左：ShipInputPanel（订单 / 重量 / 地址 / 电子称）
// - 中：OrderSummaryPanel（订单明细占位）
// - 右：QuoteComparePanel（报价对比）
//
// Phase 3 → Phase 4 过渡裁决：
// - 报价必须可解释（reasons）
// - 关键输入变化 → 旧报价失效（前端防呆）
// - 发货固化 quote_snapshot（input + selected_quote）

import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";
import {
  calcShipQuotes,
  shipWithWaybill,
  type ShipQuote,
  type ShipWithWaybillResponse,
} from "./api";

import { ShipInputPanel } from "./components/ShipInputPanel";
import { OrderSummaryPanel } from "./components/OrderSummaryPanel";
import { QuoteComparePanel } from "./components/QuoteComparePanel";

const DEFAULT_PROVINCE = "广东省";
const DEFAULT_CITY = "深圳市";
const DEFAULT_DISTRICT = "南山区";

type ApiErrorShape = { message?: string };

function parseOrderRef(ref: string): { platform: string; shopId: string; extOrderNo: string } {
  const parts = ref.split(":");
  if (parts.length >= 4 && parts[0] === "ORD") {
    return {
      platform: parts[1] || "PDD",
      shopId: parts[2] || "1",
      extOrderNo: parts.slice(3).join(":"),
    };
  }
  return { platform: "PDD", shopId: "1", extOrderNo: ref };
}

function buildQuoteSnapshot(
  input: {
    dest: { province: string; city: string; district: string };
    real_weight_kg: number;
    packaging_weight_kg: number | null;
    dims_cm: null;
    flags: string[];
  },
  quote: ShipQuote,
) {
  return {
    input,
    selected_quote: {
      provider_id: quote.provider_id,
      scheme_id: quote.scheme_id,
      scheme_name: quote.scheme_name,
      carrier_code: quote.carrier_code,
      carrier_name: quote.carrier_name,
      currency: quote.currency ?? "CNY",
      total_amount: quote.total_amount,
      weight: quote.weight,
      zone: quote.zone ?? null,
      bracket: quote.bracket ?? null,
      breakdown: quote.breakdown,
      reasons: quote.reasons ?? [],
    },
  };
}

const ShipCockpitPage: React.FC = () => {
  // ===== 输入 =====
  const [orderRef, setOrderRef] = useState("");
  const [weightKg, setWeightKg] = useState("2.36");
  const [packagingWeightKg, setPackagingWeightKg] = useState("0.10");

  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [district, setDistrict] = useState(DEFAULT_DISTRICT);

  // ===== 报价 =====
  const [quotes, setQuotes] = useState<ShipQuote[]>([]);
  const [recommendedSchemeId, setRecommendedSchemeId] = useState<number | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);

  // ===== 状态 =====
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericWeight = Number(weightKg) || 0;
  const numericPackagingWeight = Number(packagingWeightKg) || 0;

  const selectedQuote = useMemo(
    () => quotes.find((q) => q.scheme_id === selectedSchemeId) ?? null,
    [quotes, selectedSchemeId],
  );

  // ================= 前端防呆 =================
  // 关键输入变化 → 旧报价全部失效
  useEffect(() => {
    if (quotes.length > 0) {
      setQuotes([]);
      setSelectedSchemeId(null);
      setRecommendedSchemeId(null);
      setError("关键信息已变更，请重新计算运费。");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericWeight, province, city, district]);

  // ================= actions =================

  const handleCalc = async () => {
    if (!numericWeight || numericWeight <= 0) {
      setError("请先填写正确的包裹总重量（kg）");
      return;
    }
    setError(null);
    setLoadingCalc(true);
    try {
      const res = await calcShipQuotes({
        real_weight_kg: numericWeight,
        province,
        city,
        district,
        flags: [],
        max_results: 10,
      });

      const list = res.quotes ?? [];
      setQuotes(list);

      const rec = (res.recommended_scheme_id ?? null) as number | null;
      setRecommendedSchemeId(rec);
      setSelectedSchemeId(rec ?? (list[0]?.scheme_id ?? null));
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "计算运费失败");
      setQuotes([]);
      setSelectedSchemeId(null);
      setRecommendedSchemeId(null);
    } finally {
      setLoadingCalc(false);
    }
  };

  const handleConfirmShip = async () => {
    if (!orderRef.trim()) {
      setError("请先填写订单号 / 业务引用");
      return;
    }

    if (!numericWeight || numericWeight <= 0) {
      setError("请先填写正确的包裹总重量（kg）");
      return;
    }

    if (!selectedQuote) {
      setError("当前没有有效报价，请重新算价");
      return;
    }

    // ✅ build 修复点：carrier_code 需要 string（非 null）
    if (!selectedQuote.carrier_code) {
      setError("该报价缺少 carrier_code（请检查物流公司主数据）");
      return;
    }

    // ✅ 强约束：必须可解释（reasons 非空）
    if (!Array.isArray(selectedQuote.reasons) || selectedQuote.reasons.length === 0) {
      setError("报价缺少可解释证据（reasons），禁止发货");
      return;
    }

    const { platform, shopId, extOrderNo } = parseOrderRef(orderRef.trim());

    setConfirming(true);
    setError(null);

    try {
      const snapshot = buildQuoteSnapshot(
        {
          dest: { province, city, district },
          real_weight_kg: numericWeight,
          packaging_weight_kg: Number.isFinite(numericPackagingWeight) ? numericPackagingWeight : null,
          dims_cm: null,
          flags: [],
        },
        selectedQuote,
      );

      // 二次防御（snapshot 侧）
      if (!Array.isArray(snapshot.selected_quote.reasons) || snapshot.selected_quote.reasons.length === 0) {
        setError("quote_snapshot.selected_quote.reasons 为空：拒绝发货（避免不可解释账本）。");
        setConfirming(false);
        return;
      }

      const res: ShipWithWaybillResponse = await shipWithWaybill({
        platform,
        shop_id: shopId,
        ext_order_no: extOrderNo,
        warehouse_id: 1,
        carrier_code: selectedQuote.carrier_code,
        carrier_name: selectedQuote.carrier_name,
        weight_kg: numericWeight,
        receiver_name: "",
        receiver_phone: "",
        province,
        city,
        district,
        address_detail: "",
        quote_snapshot: snapshot,
      });

      alert(`已生成运单号：${res.tracking_no}`);
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "发货失败");
    } finally {
      setConfirming(false);
    }
  };

  // ================= render =================

  return (
    <div className={UI.page}>
      <PageTitle title="发货 Ship Cockpit" description="不可误操作的发货决策中枢" />

      {error && <div className={UI.errorBox}>{error}</div>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
        {/* 左 */}
        <ShipInputPanel
          orderRef={orderRef}
          onOrderRefChange={setOrderRef}
          weightKg={weightKg}
          onWeightChange={setWeightKg}
          packagingWeightKg={packagingWeightKg}
          onPackagingWeightChange={setPackagingWeightKg}
          province={province}
          city={city}
          district={district}
          onProvinceChange={setProvince}
          onCityChange={setCity}
          onDistrictChange={setDistrict}
          loadingCalc={loadingCalc}
          onCalc={handleCalc}
        />

        {/* 中 */}
        <OrderSummaryPanel
          province={province}
          city={city}
          district={district}
          totalWeightKg={numericWeight}
          packagingWeightKg={numericPackagingWeight}
        />

        {/* 右 */}
        <section className={UI.card}>
          <h2 className={UI.h2}>报价对比</h2>

          <QuoteComparePanel
            quotes={quotes}
            selectedSchemeId={selectedSchemeId}
            recommendedSchemeId={recommendedSchemeId}
            onSelect={setSelectedSchemeId}
          />

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            Phase 4：多包裹 / 拆单结构将在此处展开
          </div>

          <button
            type="button"
            className={`${UI.btnPrimary} mt-4 w-full`}
            disabled={!selectedQuote || confirming}
            onClick={handleConfirmShip}
          >
            {confirming ? "提交中…" : "确认发货"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default ShipCockpitPage;
