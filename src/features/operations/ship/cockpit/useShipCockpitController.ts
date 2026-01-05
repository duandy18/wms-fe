// src/features/operations/ship/cockpit/useShipCockpitController.ts

import { useEffect, useMemo, useState } from "react";

import {
  calcShipQuotes,
  shipWithWaybill,
  type ShipQuote,
  type ShipWithWaybillResponse,
} from "../api";
import { buildQuoteSnapshot, parseOrderRef, type ShipApiErrorShape } from "./utils";

const DEFAULT_PROVINCE = "广东省";
const DEFAULT_CITY = "深圳市";
const DEFAULT_DISTRICT = "南山区";

export function useShipCockpitController() {
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
      const err = e as ShipApiErrorShape;
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
      const err = e as ShipApiErrorShape;
      setError(err?.message ?? "发货失败");
    } finally {
      setConfirming(false);
    }
  };

  return {
    // inputs
    orderRef,
    setOrderRef,
    weightKg,
    setWeightKg,
    packagingWeightKg,
    setPackagingWeightKg,
    province,
    setProvince,
    city,
    setCity,
    district,
    setDistrict,

    // derived
    numericWeight,
    numericPackagingWeight,

    // quotes
    quotes,
    recommendedSchemeId,
    selectedSchemeId,
    setSelectedSchemeId,
    selectedQuote,

    // status
    loadingCalc,
    confirming,
    error,

    // actions
    handleCalc,
    handleConfirmShip,
  };
}
