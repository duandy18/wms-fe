// src/features/tms/shipment/cockpit/controller/waybill.ts

import type {
  ShipWithWaybillPayload,
  ShipWithWaybillResponse,
} from "../../api/shipmentWaybillApi";
import type {
  ShipmentOrderContext,
  ShipmentWaybillState,
  ShipmentWorkbenchOrder,
} from "./types";

function toOptionalText(value: string): string | undefined {
  const clean = String(value || "").trim();
  if (!clean || clean === "-") {
    return undefined;
  }
  return clean;
}

export function buildWaybillState(
  result: ShipWithWaybillResponse,
): ShipmentWaybillState {
  return {
    packageNo: result.package_no,
    trackingNo: result.tracking_no,
    shippingProviderId:
      typeof result.shipping_provider_id === "number"
        ? result.shipping_provider_id
        : null,
    carrierCode: String(result.carrier_code || "").trim(),
    carrierName: String(result.carrier_name || "").trim(),
    status: String(result.status || "").trim(),
    printData:
      result.print_data && typeof result.print_data === "object"
        ? result.print_data
        : null,
    templateUrl: String(result.template_url || "").trim(),
  };
}

export function buildShipWithWaybillPayload(
  context: ShipmentOrderContext,
  order: ShipmentWorkbenchOrder,
  packageNo: number,
): ShipWithWaybillPayload {
  return {
    platform: context.platform,
    shop_id: context.shop_id,
    ext_order_no: context.ext_order_no,
    package_no: packageNo,
    receiver_name: toOptionalText(order.receiverName),
    receiver_phone: toOptionalText(order.receiverPhone),
    province: toOptionalText(order.parsedProvince),
    city: toOptionalText(order.parsedCity),
    district: toOptionalText(order.parsedDistrict),
    address_detail: toOptionalText(order.parsedAddressDetail),
  };
}
