// src/features/tms/shipment/cockpit/controller/mappers.ts
//
// 分拆说明：
// - 本文件负责发运作业页数据映射：
//   1) route state -> skeleton order
//   2) 后端详情/包裹 -> 页面展示模型
//   3) quote confirm / quote candidate -> 页面展示模型
// - 维护约束：
//   - 纯映射函数留在本文件
//   - 不写 React hook，不持有组件状态

import type {
  ShipPrepareOrderDetailItem,
  ShipPreparePackageItem,
  ShipPreparePackageQuoteConfirmItem,
  ShipPrepareQuoteCandidateItem,
} from "../../api/shipmentPrepareApi";
import { normalizeRouteText } from "./context";
import type {
  ConfirmedQuoteState,
  ShipmentDispatchRouteState,
  ShipmentPackagePlan,
  ShipmentQuoteCandidate,
  ShipmentWaybillState,
  ShipmentWorkbenchOrder,
} from "./types";

function mapAddressStatus(
  addressReadyStatus: string | null | undefined,
): ShipmentWorkbenchOrder["addressStatus"] {
  const raw = normalizeRouteText(addressReadyStatus).toLowerCase();

  if (raw === "ready") {
    return "已完成";
  }
  if (raw === "pending") {
    return "待确认";
  }
  return "异常";
}

export function buildSkeletonOrderFromRouteState(
  state: ShipmentDispatchRouteState | null | undefined,
): ShipmentWorkbenchOrder {
  const province = normalizeRouteText(state?.province);
  const city = normalizeRouteText(state?.city);
  const district = normalizeRouteText(state?.district);
  const detail = normalizeRouteText(state?.detail);
  const parsedAddress = [province, city, district, detail]
    .filter(Boolean)
    .join(" ");
  const rawAddress =
    normalizeRouteText(state?.address_summary) || parsedAddress || "—";

  return {
    orderId: Number(state?.order_id || 0),
    platform: normalizeRouteText(state?.platform),
    shopName: normalizeRouteText(state?.shop_id),
    extOrderNo: normalizeRouteText(state?.ext_order_no),
    createdAt: "-",
    receiverName: normalizeRouteText(state?.receiver_name) || "-",
    receiverPhone: normalizeRouteText(state?.receiver_phone) || "-",
    rawAddress,
    parsedProvince: province,
    parsedCity: city,
    parsedDistrict: district,
    parsedAddressDetail: detail,
    addressStatus: "待确认",
    warehouseName: "待分配",
  };
}

export function mapOrderDetailToWorkbenchOrder(
  item: ShipPrepareOrderDetailItem,
  packages: ShipPreparePackageItem[],
): ShipmentWorkbenchOrder {
  const province = normalizeRouteText(item.province);
  const city = normalizeRouteText(item.city);
  const district = normalizeRouteText(item.district);
  const detail = normalizeRouteText(item.detail);

  const warehouseIds = Array.from(
    new Set(
      packages
        .map((pkg) =>
          typeof pkg.warehouse_id === "number" ? pkg.warehouse_id : null,
        )
        .filter((value): value is number => value !== null),
    ),
  );

  let warehouseName = "待分配";
  if (warehouseIds.length === 1) {
    warehouseName = `仓库ID:${warehouseIds[0]}`;
  } else if (warehouseIds.length > 1) {
    warehouseName = "多仓";
  }

  return {
    orderId: item.order_id,
    platform: item.platform,
    shopName: item.shop_id,
    extOrderNo: item.ext_order_no,
    createdAt: "-",
    receiverName: normalizeRouteText(item.receiver_name) || "-",
    receiverPhone: normalizeRouteText(item.receiver_phone) || "-",
    rawAddress: normalizeRouteText(item.address_summary) || "-",
    parsedProvince: province,
    parsedCity: city,
    parsedDistrict: district,
    parsedAddressDetail: detail,
    addressStatus: mapAddressStatus(item.address_ready_status),
    warehouseName,
  };
}

function getSelectedQuoteFromSnapshot(
  snapshot: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const selectedQuote = snapshot["selected_quote"];
  if (!selectedQuote || typeof selectedQuote !== "object") {
    return null;
  }

  return selectedQuote as Record<string, unknown>;
}

export function buildConfirmedQuoteState(
  confirmed: ShipPreparePackageQuoteConfirmItem,
): ConfirmedQuoteState {
  const selectedQuote = getSelectedQuoteFromSnapshot(
    confirmed.selected_quote_snapshot,
  );

  const carrierName =
    normalizeRouteText(selectedQuote?.carrier_name) ||
    normalizeRouteText(selectedQuote?.carrier_code) ||
    `承运商ID:${confirmed.selected_provider_id}`;

  const totalAmount = selectedQuote?.total_amount;
  const amount =
    typeof totalAmount === "number"
      ? totalAmount.toFixed(2)
      : typeof totalAmount === "string" && totalAmount.trim()
        ? totalAmount.trim()
        : "";

  return {
    providerId: confirmed.selected_provider_id,
    carrierName,
    amount,
    snapshot: confirmed.selected_quote_snapshot,
  };
}

function mapPackageStatus(
  pkg: ShipPreparePackageItem,
): ShipmentPackagePlan["packageStatus"] {
  const hasWeight =
    typeof pkg.weight_kg === "number" &&
    Number.isFinite(pkg.weight_kg) &&
    pkg.weight_kg > 0;
  const hasWarehouse =
    typeof pkg.warehouse_id === "number" && Number.isFinite(pkg.warehouse_id);
  const isCalculated =
    normalizeRouteText(pkg.pricing_status).toLowerCase() === "calculated";
  const hasProvider =
    typeof pkg.selected_provider_id === "number" &&
    Number.isFinite(pkg.selected_provider_id);

  if (!hasWeight || !hasWarehouse) {
    return "待录重量";
  }
  if (!isCalculated) {
    return "待报价";
  }
  if (!hasProvider) {
    return "待选承运商";
  }
  return "已就绪";
}

function mapQuoteStatus(
  pricingStatus: string | null | undefined,
): ShipmentPackagePlan["quoteStatus"] {
  const raw = normalizeRouteText(pricingStatus).toLowerCase();
  if (raw === "calculated") {
    return "有效";
  }
  return "未报价";
}

export function mapPackageToPlan(
  pkg: ShipPreparePackageItem,
  confirmedQuotesMap: Record<number, ConfirmedQuoteState>,
  waybillStateMap: Record<number, ShipmentWaybillState>,
  printedByPackage: Record<number, boolean>,
): ShipmentPackagePlan {
  const confirmed = confirmedQuotesMap[pkg.package_no];
  const waybill = waybillStateMap[pkg.package_no];

  const carrierName =
    waybill?.carrierName ||
    confirmed?.carrierName ||
    (typeof pkg.selected_provider_id === "number"
      ? `承运商ID:${pkg.selected_provider_id}`
      : "");

  return {
    packageNo: pkg.package_no,
    actualWeightKg:
      typeof pkg.weight_kg === "number" && Number.isFinite(pkg.weight_kg)
        ? String(pkg.weight_kg)
        : "",
    packageStatus: mapPackageStatus(pkg),
    quoteStatus: mapQuoteStatus(pkg.pricing_status),
    quoteAmount: confirmed?.amount || "",
    carrierName,
    trackingNo: waybill?.trackingNo || "",
    printStatus: printedByPackage[pkg.package_no] ? "已打印" : "未打印",
    printData: waybill?.printData || null,
    templateUrl: waybill?.templateUrl || "",
    warehouseId:
      typeof pkg.warehouse_id === "number" ? pkg.warehouse_id : null,
    selectedProviderId:
      typeof pkg.selected_provider_id === "number"
        ? pkg.selected_provider_id
        : confirmed?.providerId || waybill?.shippingProviderId || null,
  };
}

export function mapQuoteCandidate(
  packageNo: number,
  candidate: ShipPrepareQuoteCandidateItem,
): ShipmentQuoteCandidate {
  return {
    packageNo,
    providerId: candidate.provider_id,
    carrierName: normalizeRouteText(candidate.carrier_name) || "-",
    serviceName:
      normalizeRouteText(candidate.template_name) ||
      normalizeRouteText(candidate.carrier_code) ||
      `模板ID:${candidate.template_id}`,
    amount:
      typeof candidate.est_cost === "number"
        ? candidate.est_cost.toFixed(2)
        : "",
    etaText: normalizeRouteText(candidate.eta) || "-",
    quoteStatus: normalizeRouteText(candidate.quote_status),
    templateId: candidate.template_id,
    templateName: normalizeRouteText(candidate.template_name),
    currency: normalizeRouteText(candidate.currency),
    reasons: Array.isArray(candidate.reasons) ? candidate.reasons : [],
  };
}
