// src/features/operations/ship/cockpit/useShipCockpitController.ts

import { useEffect, useMemo, useState } from "react";

import {
  calcShipQuotes,
  prepareShipFromOrder,
  shipWithWaybill,
  type CandidateWarehouse,
  type FulfillmentScanWarehouse,
  type ShipQuote,
  type ShipWithWaybillResponse,
} from "../api";
import { buildQuoteSnapshot, parseOrderRef } from "./utils";

const DEFAULT_PROVINCE = "广东省";
const DEFAULT_CITY = "深圳市";
const DEFAULT_DISTRICT = "南山区";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

export function useShipCockpitController() {
  // ===== 输入 =====
  const [orderRef, setOrderRef] = useState("");
  const [weightKg, setWeightKg] = useState("2.36");
  const [packagingWeightKg, setPackagingWeightKg] = useState("0.10");

  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [district, setDistrict] = useState(DEFAULT_DISTRICT);

  // ===== prepare（新合同：候选仓 + 扫描报告；不预设仓，不兜底）=====
  const [preparing, setPreparing] = useState(false);
  const [preparedRef, setPreparedRef] = useState<string | null>(null);

  const [candidateWarehouses, setCandidateWarehouses] = useState<CandidateWarehouse[]>([]);
  const [scanRows, setScanRows] = useState<FulfillmentScanWarehouse[]>([]);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<"OK" | "FULFILLMENT_BLOCKED" | string | null>(null);
  const [warehouseReason, setWarehouseReason] = useState<string | null>(null);

  // ✅ 人工裁决的结果：只允许选择 status=OK 的仓
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);

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

  const okWarehouseIdSet = useMemo(() => {
    const set = new Set<number>();
    for (const r of scanRows ?? []) {
      if (String(r.status) === "OK") set.add(Number(r.warehouse_id));
    }
    return set;
  }, [scanRows]);

  const canCalc =
    !!selectedWarehouseId &&
    okWarehouseIdSet.has(Number(selectedWarehouseId)) &&
    !loadingCalc &&
    !preparing &&
    !confirming;

  const canConfirm =
    !!selectedWarehouseId &&
    okWarehouseIdSet.has(Number(selectedWarehouseId)) &&
    !!selectedQuote &&
    !confirming;

  // ================= 前端防呆 =================
  // 关键输入变化 → 旧报价全部失效（不清空已选仓，但会提示重新算价）
  useEffect(() => {
    if (quotes.length > 0) {
      setQuotes([]);
      setSelectedSchemeId(null);
      setRecommendedSchemeId(null);
      setError("关键信息已变更，请重新计算运费。");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericWeight, province, city, district, selectedWarehouseId]);

  // 如果扫描结果变化导致“已选仓不再 OK”，自动清空选择
  useEffect(() => {
    if (!selectedWarehouseId) return;
    if (okWarehouseIdSet.has(Number(selectedWarehouseId))) return;
    setSelectedWarehouseId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okWarehouseIdSet]);

  // ================= actions =================

  const handlePrepare = async () => {
    if (!orderRef.trim()) {
      setError("请先填写订单号 / 业务引用");
      return;
    }

    setPreparing(true);
    setError(null);

    // prepare 会改变候选/扫描，先把报价清掉（避免旧报价被误用）
    setQuotes([]);
    setSelectedSchemeId(null);
    setRecommendedSchemeId(null);

    try {
      const { platform, shopId, extOrderNo } = parseOrderRef(orderRef.trim());

      const out = await prepareShipFromOrder({
        platform,
        shop_id: shopId,
        ext_order_no: extOrderNo,
      });

      if (!out.ok) {
        setError("prepare-from-order 返回失败");
        return;
      }

      setPreparedRef(out.ref ?? null);

      // 地址回填（后端有就用；没有就保持当前）
      if (out.province) setProvince(out.province);
      if (out.city) setCity(out.city);
      if (out.district) setDistrict(out.district);

      // 预估重量回填（不含包材）
      if (out.weight_kg != null && Number.isFinite(out.weight_kg) && out.weight_kg > 0) {
        setWeightKg(String(out.weight_kg));
      }

      const cands = Array.isArray(out.candidate_warehouses) ? out.candidate_warehouses : [];
      const scans = Array.isArray(out.fulfillment_scan) ? out.fulfillment_scan : [];

      setCandidateWarehouses(cands);
      setScanRows(scans);

      const fstat = (out.fulfillment_status ?? null) as string | null;
      setFulfillmentStatus(fstat);

      setWarehouseReason(out.warehouse_reason ?? null);

      // 不预设：清空选择，让人选
      setSelectedWarehouseId(null);

      // 提示（不吞掉证据，UI 会展示扫描报告）
      if (!cands.length) {
        setError("未命中任何候选仓（省级路由无规则或引用仓不可用）。");
      } else if (String(fstat) === "FULFILLMENT_BLOCKED") {
        setError("当前订单无法在任何候选仓整单同仓履约，建议退货/取消。");
      } else if (okWarehouseIdSet.size <= 0) {
        setError("候选仓均无法整单同仓履约，建议退货/取消。");
      } else {
        setError("请从可履约（OK）的候选仓中选择一个起运仓。");
      }
    } catch (e: unknown) {
      setError(toHumanError(e, "prepare 失败"));
      setPreparedRef(null);
      setCandidateWarehouses([]);
      setScanRows([]);
      setFulfillmentStatus(null);
      setWarehouseReason(null);
      setSelectedWarehouseId(null);
    } finally {
      setPreparing(false);
    }
  };

  const handleCalc = async () => {
    if (!selectedWarehouseId) {
      setError("请先准备订单并选择起运仓（仅允许选择可履约的仓）。");
      return;
    }
    if (!okWarehouseIdSet.has(Number(selectedWarehouseId))) {
      setError("当前选择的仓不可履约（非 OK），禁止算价。");
      return;
    }
    if (!numericWeight || numericWeight <= 0) {
      setError("请先填写正确的包裹总重量（kg）");
      return;
    }

    setError(null);
    setLoadingCalc(true);
    try {
      const res = await calcShipQuotes({
        warehouse_id: selectedWarehouseId,
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
      setError(toHumanError(e, "计算运费失败"));
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

    if (!selectedWarehouseId) {
      setError("未选择起运仓：禁止发货（仅允许选择可履约的仓）");
      return;
    }

    if (!okWarehouseIdSet.has(Number(selectedWarehouseId))) {
      setError("当前选择的仓不可履约（非 OK），禁止发货。");
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

    if (!selectedQuote.carrier_code) {
      setError("该报价缺少 carrier_code（请检查物流公司主数据）");
      return;
    }

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

      if (!Array.isArray(snapshot.selected_quote.reasons) || snapshot.selected_quote.reasons.length === 0) {
        setError("quote_snapshot.selected_quote.reasons 为空：拒绝发货（避免不可解释账本）。");
        setConfirming(false);
        return;
      }

      const res: ShipWithWaybillResponse = await shipWithWaybill({
        platform,
        shop_id: shopId,
        ext_order_no: extOrderNo,
        warehouse_id: selectedWarehouseId,
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
      setError(toHumanError(e, "发货失败"));
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

    // prepare
    preparing,
    preparedRef,
    candidateWarehouses,
    scanRows,
    fulfillmentStatus,
    warehouseReason,
    selectedWarehouseId,
    setSelectedWarehouseId,
    handlePrepare,

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

    // computed flags
    canCalc,
    canConfirm,

    // actions
    handleCalc,
    handleConfirmShip,
  };
}
