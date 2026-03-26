// src/features/tms/shipment/cockpit/controller/types.ts
//
// 分拆说明：
// - 本文件承载发运作业控制器领域类型。
// - 维护约束：
//   - 页面展示类型、路由上下文类型、内部状态类型统一收口在此
//   - 纯类型定义留在本文件，不混入副作用逻辑

export type ShipmentQueueRow = {
  orderId: number;
  platform: string;
  shopName: string;
  extOrderNo: string;
  receiverName: string;
  addressStatus: "待解析" | "待确认" | "已完成" | "异常";
  packageCount: number;
  planStatus: "待处理" | "规划中" | "已计划" | "异常";
  executionStatus: "未执行" | "已拉单" | "已打印" | "已完成";
  nextStep: string;
};

export type ShipmentWorkbenchOrder = {
  orderId: number;
  platform: string;
  shopName: string;
  extOrderNo: string;
  createdAt: string;
  receiverName: string;
  receiverPhone: string;
  rawAddress: string;
  parsedProvince: string;
  parsedCity: string;
  parsedDistrict: string;
  parsedAddressDetail: string;
  addressStatus: "待解析" | "待确认" | "已完成" | "异常";
  warehouseName: string;
};

export type ShipmentPackagePlan = {
  packageNo: number;
  actualWeightKg: string;
  packageStatus: "待录重量" | "待报价" | "待选承运商" | "已就绪";
  quoteStatus: "未报价" | "待重新报价" | "有效";
  quoteAmount: string;
  carrierName: string;
  trackingNo: string;
  printStatus: "未打印" | "已打印";
  printData: Record<string, unknown> | null;
  templateUrl: string;
  warehouseId: number | null;
  selectedProviderId: number | null;
};

export type ShipmentQuoteCandidate = {
  packageNo: number;
  providerId: number;
  carrierName: string;
  serviceName: string;
  amount: string;
  etaText: string;
  quoteStatus: string;
  templateId: number;
  templateName: string;
  currency: string;
  reasons: string[];
};

export type ShipmentExecutionSummary = {
  packageCount: number;
  waybillCreatedCount: number;
  printedCount: number;
};

export type ShipmentDispatchRouteState = {
  order_id?: number;
  platform?: string;
  shop_id?: string;
  ext_order_no?: string;
  receiver_name?: string;
  receiver_phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  address_summary?: string;
};

export type ShipmentOrderContext = {
  platform: string;
  shop_id: string;
  ext_order_no: string;
};

export type ConfirmedQuoteState = {
  providerId: number;
  carrierName: string;
  amount: string;
  snapshot: Record<string, unknown>;
};

export type ShipmentWaybillState = {
  packageNo: number;
  trackingNo: string;
  shippingProviderId: number | null;
  carrierCode: string;
  carrierName: string;
  status: string;
  printData: Record<string, unknown> | null;
  templateUrl: string;
};

export type LoadingByPackageMap = Record<number, boolean>;
