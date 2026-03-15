// src/features/shipment/cockpit/useShipmentCockpitController.ts

import { useEffect, useMemo, useState } from "react";

import {
  calcShipQuotes,
  type ShipQuote,
} from "../api/shipmentQuoteApi";
import {
  prepareShipFromOrder,
  type CandidateWarehouse,
  type FulfillmentScanWarehouse,
  type ShipPrepareItem,
} from "../api/shipmentPrepareApi";
import {
  shipWithWaybill,
  type ShipWithWaybillResponse,
} from "../api/shipmentWaybillApi";
import { buildQuoteSnapshot, parseOrderRef } from "./utils";

const DEFAULT_PROVINCE = "广东省";
const DEFAULT_CITY = "深圳市";
const DEFAULT_DISTRICT = "南山区";
const DEFAULT_WEIGHT_KG = "2.36";
const DEFAULT_PACKAGING_WEIGHT_KG = "0.10";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

export function useShipmentCockpitController() {
  const [orderRef, setOrderRef] = useState("");
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT_KG);
  const [packagingWeightKg, setPackagingWeightKg] = useState(
    DEFAULT_PACKAGING_WEIGHT_KG,
  );

  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [district, setDistrict] = useState(DEFAULT_DISTRICT);

  const [preparing, setPreparing] = useState(false);
  const [preparedRef, setPreparedRef] = useState<string | null>(null);
  const [preparedOrderId, setPreparedOrderId] = useState<number | null>(null);
  const [preparedItems, setPreparedItems] = useState<ShipPrepareItem[]>([]);
  const [preparedTotalQty, setPreparedTotalQty] = useState(0);
  const [preparedTraceId, setPreparedTraceId] = useState<string | null>(null);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const [candidateWarehouses, setCandidateWarehouses] = useState<
    CandidateWarehouse[]
  >([]);
  const [scanRows, setScanRows] = useState<FulfillmentScanWarehouse[]>([]);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<
    "OK" | "FULFILLMENT_BLOCKED" | string | null
  >(null);
  const [warehouseReason, setWarehouseReason] = useState<string | null>(null);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null,
  );

  const [quotes, setQuotes] = useState<ShipQuote[]>([]);
  const [recommendedSchemeId, setRecommendedSchemeId] = useState<number | null>(
    null,
  );
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);

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
    !!preparedRef &&
    !!selectedWarehouseId &&
    okWarehouseIdSet.has(Number(selectedWarehouseId)) &&
    !loadingCalc &&
    !preparing &&
    !confirming;

  const canConfirm =
    !!preparedRef &&
    preparedItems.length > 0 &&
    !!selectedWarehouseId &&
    okWarehouseIdSet.has(Number(selectedWarehouseId)) &&
    !!selectedQuote &&
    !!receiverName.trim() &&
    !!receiverPhone.trim() &&
    !!province.trim() &&
    !!city.trim() &&
    !!district.trim() &&
    !confirming;

  function clearPreparedOrderFacts() {
    setPreparedRef(null);
    setPreparedOrderId(null);
    setPreparedItems([]);
    setPreparedTotalQty(0);
    setPreparedTraceId(null);

    setReceiverName("");
    setReceiverPhone("");
    setAddressDetail("");

    setCandidateWarehouses([]);
    setScanRows([]);
    setFulfillmentStatus(null);
    setWarehouseReason(null);
    setSelectedWarehouseId(null);

    setQuotes([]);
    setRecommendedSchemeId(null);
    setSelectedSchemeId(null);
  }

  function resetCockpitAfterShip() {
    setOrderRef("");
    setWeightKg(DEFAULT_WEIGHT_KG);
    setPackagingWeightKg(DEFAULT_PACKAGING_WEIGHT_KG);

    setProvince(DEFAULT_PROVINCE);
    setCity(DEFAULT_CITY);
    setDistrict(DEFAULT_DISTRICT);

    clearPreparedOrderFacts();
    setError(null);
  }

  useEffect(() => {
    if (quotes.length > 0) {
      setQuotes([]);
      setSelectedSchemeId(null);
      setRecommendedSchemeId(null);
      setError("关键信息已变更，请重新计算运费。");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericWeight, province, city, district, selectedWarehouseId]);

  useEffect(() => {
    if (!selectedWarehouseId) return;
    if (okWarehouseIdSet.has(Number(selectedWarehouseId))) return;
    setSelectedWarehouseId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okWarehouseIdSet]);

  const handlePrepare = async () => {
    if (!orderRef.trim()) {
      setError("请先填写订单号 / 业务引用");
      return;
    }

    setPreparing(true);
    setError(null);

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
      setPreparedOrderId(
        typeof out.order_id === "number" && Number.isFinite(out.order_id)
          ? out.order_id
          : null,
      );

      const items = Array.isArray(out.items) ? out.items : [];
      setPreparedItems(items);
      setPreparedTotalQty(
        typeof out.total_qty === "number" && Number.isFinite(out.total_qty)
          ? out.total_qty
          : 0,
      );
      setPreparedTraceId(out.trace_id ?? null);

      setReceiverName((out.receiver_name ?? "").trim());
      setReceiverPhone((out.receiver_phone ?? "").trim());
      setAddressDetail((out.address_detail ?? "").trim());

      if (out.province) setProvince(out.province);
      if (out.city) setCity(out.city);
      if (out.district) setDistrict(out.district);

      if (
        out.weight_kg != null &&
        Number.isFinite(out.weight_kg) &&
        out.weight_kg > 0
      ) {
        setWeightKg(String(out.weight_kg));
      }

      const cands = Array.isArray(out.candidate_warehouses)
        ? out.candidate_warehouses
        : [];
      const scans = Array.isArray(out.fulfillment_scan)
        ? out.fulfillment_scan
        : [];

      setCandidateWarehouses(cands);
      setScanRows(scans);

      const okCount = scans.filter((r) => String(r.status) === "OK").length;

      const fstat = (out.fulfillment_status ?? null) as string | null;
      setFulfillmentStatus(fstat);

      setWarehouseReason(out.warehouse_reason ?? null);

      setSelectedWarehouseId(null);

      if (!cands.length) {
        setError("未命中任何候选仓（省级路由无规则或引用仓不可用）。");
      } else if (String(fstat) === "FULFILLMENT_BLOCKED") {
        setError("当前订单无法在任何候选仓整单同仓履约，建议退货/取消。");
      } else if (okCount <= 0) {
        setError("候选仓均无法整单同仓履约，建议退货/取消。");
      } else {
        setError("请从可履约（OK）的候选仓中选择一个起运仓。");
      }
    } catch (e: unknown) {
      setError(toHumanError(e, "prepare 失败"));
      clearPreparedOrderFacts();
    } finally {
      setPreparing(false);
    }
  };

  const handleCalc = async () => {
    if (!preparedRef) {
      setError("请先完成订单准备。");
      return;
    }
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

    if (!preparedRef) {
      setError("请先完成订单准备。");
      return;
    }

    if (preparedItems.length === 0) {
      setError("prepare 未返回订单明细，禁止发货。");
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

    if (
      !Array.isArray(selectedQuote.reasons) ||
      selectedQuote.reasons.length === 0
    ) {
      setError("报价缺少可解释证据（reasons），禁止发货");
      return;
    }

    if (!receiverName.trim()) {
      setError("缺少收件人信息，禁止发货。");
      return;
    }

    if (!receiverPhone.trim()) {
      setError("缺少收件电话，禁止发货。");
      return;
    }

    if (!province.trim() || !city.trim() || !district.trim()) {
      setError("收货地址不完整，禁止发货。");
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      const { platform, shopId, extOrderNo } = parseOrderRef(orderRef.trim());

      const snapshot = buildQuoteSnapshot(
        {
          dest: { province, city, district },
          real_weight_kg: numericWeight,
          packaging_weight_kg: Number.isFinite(numericPackagingWeight)
            ? numericPackagingWeight
            : null,
          dims_cm: null,
          flags: [],
        },
        selectedQuote,
      );

      if (
        !Array.isArray(snapshot.selected_quote.reasons) ||
        snapshot.selected_quote.reasons.length === 0
      ) {
        setError(
          "quote_snapshot.selected_quote.reasons 为空：拒绝发货（避免不可解释账本）。",
        );
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
        receiver_name: receiverName.trim(),
        receiver_phone: receiverPhone.trim(),
        province,
        city,
        district,
        address_detail: addressDetail.trim(),
        quote_snapshot: snapshot,
      });

      alert(`已生成运单号：${res.tracking_no}`);
      resetCockpitAfterShip();
    } catch (e: unknown) {
      setError(toHumanError(e, "发货失败"));
    } finally {
      setConfirming(false);
    }
  };

  return {
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

    preparing,
    preparedRef,
    preparedOrderId,
    preparedItems,
    preparedTotalQty,
    preparedTraceId,
    receiverName,
    receiverPhone,
    addressDetail,

    candidateWarehouses,
    scanRows,
    fulfillmentStatus,
    warehouseReason,
    selectedWarehouseId,
    setSelectedWarehouseId,
    handlePrepare,

    numericWeight,
    numericPackagingWeight,

    quotes,
    recommendedSchemeId,
    selectedSchemeId,
    setSelectedSchemeId,
    selectedQuote,

    loadingCalc,
    confirming,
    error,

    canCalc,
    canConfirm,

    handleCalc,
    handleConfirmShip,
  };
}
