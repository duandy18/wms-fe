// src/features/tms/shipment/cockpit/controller/prepareActions.ts
//
// 分拆说明：
// - 本文件承载发货作业页第 1、2 张卡的准备态动作。
// - 当前只负责：
//   1) 刷新订单与包裹
//   2) 地址确认
//   3) 新增包裹
//   4) 更新包裹重量/仓库
//   5) 包裹级算价
//   6) 包裹级确认承运商
// - 维护约束：
//   - 本文件不持有 React 组件状态，只接收外部 setter
//   - 不承担打印或 waybill 执行逻辑
//   - 不改页面对外导出接口

import type { Dispatch, SetStateAction } from "react";
import {
  confirmShipmentPrepareOrderAddress,
  confirmShipmentPreparePackageQuote,
  createShipmentPreparePackage,
  fetchShipmentPrepareOrderDetail,
  fetchShipmentPreparePackages,
  quoteShipmentPreparePackage,
  updateShipmentPreparePackage,
  type ShipPrepareOrderDetailItem,
  type ShipPreparePackageItem,
} from "../../api/shipmentPrepareApi";
import { buildConfirmedQuoteState, mapQuoteCandidate } from "./mappers";
import type {
  ConfirmedQuoteState,
  LoadingByPackageMap,
  ShipmentOrderContext,
  ShipmentQuoteCandidate,
  ShipmentWaybillState,
} from "./types";

type SetState<T> = Dispatch<SetStateAction<T>>;

type RefreshOrderAndPackagesParams = {
  context: ShipmentOrderContext | null;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
  setOrderDetail: SetState<ShipPrepareOrderDetailItem | null>;
  setPackageItems: SetState<ShipPreparePackageItem[]>;
  setQuoteCandidatesMap: SetState<Record<number, ShipmentQuoteCandidate[]>>;
  setConfirmedQuotesMap: SetState<Record<number, ConfirmedQuoteState>>;
  setWaybillStateMap: SetState<Record<number, ShipmentWaybillState>>;
  setPrintedByPackage: SetState<Record<number, boolean>>;
};

export async function refreshOrderAndPackagesAction(
  params: RefreshOrderAndPackagesParams,
): Promise<void> {
  const {
    context,
    setError,
    setLoading,
    setOrderDetail,
    setPackageItems,
    setQuoteCandidatesMap,
    setConfirmedQuotesMap,
    setWaybillStateMap,
    setPrintedByPackage,
  } = params;

  if (!context) {
    setOrderDetail(null);
    setPackageItems([]);
    setQuoteCandidatesMap({});
    setConfirmedQuotesMap({});
    setWaybillStateMap({});
    setPrintedByPackage({});
    setError("缺少订单上下文：请从发运准备页进入发货作业页。");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const [detailRes, packagesRes] = await Promise.all([
      fetchShipmentPrepareOrderDetail(
        context.platform,
        context.shop_id,
        context.ext_order_no,
      ),
      fetchShipmentPreparePackages(
        context.platform,
        context.shop_id,
        context.ext_order_no,
      ),
    ]);

    setOrderDetail(detailRes.item);
    setPackageItems(Array.isArray(packagesRes.items) ? packagesRes.items : []);
  } catch (err) {
    setError(err instanceof Error ? err.message : "加载发货作业数据失败");
  } finally {
    setLoading(false);
  }
}

type ConfirmAddressParams = {
  context: ShipmentOrderContext | null;
  confirmingAddress: boolean;
  setConfirmingAddress: SetState<boolean>;
  setError: SetState<string | null>;
  setAddressSuccessMessage: SetState<string | null>;
  refreshOrderAndPackages: () => Promise<void>;
};

export async function confirmAddressAction(
  params: ConfirmAddressParams,
): Promise<void> {
  const {
    context,
    confirmingAddress,
    setConfirmingAddress,
    setError,
    setAddressSuccessMessage,
    refreshOrderAndPackages,
  } = params;

  if (!context || confirmingAddress) {
    return;
  }

  setConfirmingAddress(true);
  setError(null);

  try {
    await confirmShipmentPrepareOrderAddress(
      context.platform,
      context.shop_id,
      context.ext_order_no,
    );
    await refreshOrderAndPackages();
    setAddressSuccessMessage("地址核实正确\n已写入发运准备状态");
  } catch (err) {
    setError(err instanceof Error ? err.message : "地址确认失败");
  } finally {
    setConfirmingAddress(false);
  }
}

type CreatePackageParams = {
  context: ShipmentOrderContext | null;
  creatingPackage: boolean;
  setCreatingPackage: SetState<boolean>;
  setError: SetState<string | null>;
  setPackageItems: SetState<ShipPreparePackageItem[]>;
};

export async function createPackageAction(
  params: CreatePackageParams,
): Promise<void> {
  const {
    context,
    creatingPackage,
    setCreatingPackage,
    setError,
    setPackageItems,
  } = params;

  if (!context || creatingPackage) {
    return;
  }

  setCreatingPackage(true);
  setError(null);

  try {
    const res = await createShipmentPreparePackage(
      context.platform,
      context.shop_id,
      context.ext_order_no,
    );
    const next = res.item;

    setPackageItems((prev) => {
      const merged = [...prev, next];
      merged.sort((a, b) => a.package_no - b.package_no);
      return merged;
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "新增包裹失败");
  } finally {
    setCreatingPackage(false);
  }
}

type UpdatePackageParams = {
  context: ShipmentOrderContext | null;
  packageNo: number;
  payload: {
    weight_kg?: number;
    warehouse_id?: number;
  };
  setSavingByPackage: SetState<LoadingByPackageMap>;
  setError: SetState<string | null>;
  setPackageItems: SetState<ShipPreparePackageItem[]>;
  setQuoteCandidatesMap: SetState<Record<number, ShipmentQuoteCandidate[]>>;
  setConfirmedQuotesMap: SetState<Record<number, ConfirmedQuoteState>>;
  setWaybillStateMap: SetState<Record<number, ShipmentWaybillState>>;
  setPrintedByPackage: SetState<Record<number, boolean>>;
  setPackageActionMessageByPackage: SetState<Record<number, string>>;
};

export async function updatePackageAction(
  params: UpdatePackageParams,
): Promise<void> {
  const {
    context,
    packageNo,
    payload,
    setSavingByPackage,
    setError,
    setPackageItems,
    setQuoteCandidatesMap,
    setConfirmedQuotesMap,
    setWaybillStateMap,
    setPrintedByPackage,
    setPackageActionMessageByPackage,
  } = params;

  if (!context) {
    setError("缺少订单上下文：请从发运准备页进入发货作业页。");
    return;
  }

  setSavingByPackage((prev) => ({ ...prev, [packageNo]: true }));
  setError(null);

  try {
    const res = await updateShipmentPreparePackage(
      context.platform,
      context.shop_id,
      context.ext_order_no,
      packageNo,
      payload,
    );

    setPackageActionMessageByPackage((prev) => ({
      ...prev,
      [packageNo]: "重量和发货仓已保存",
    }));

    setPackageItems((prev) =>
      prev.map((pkg) => (pkg.package_no === packageNo ? res.item : pkg)),
    );

    setQuoteCandidatesMap((prev) => {
      const next = { ...prev };
      delete next[packageNo];
      return next;
    });

    setConfirmedQuotesMap((prev) => {
      const next = { ...prev };
      delete next[packageNo];
      return next;
    });

    setWaybillStateMap((prev) => {
      const next = { ...prev };
      delete next[packageNo];
      return next;
    });

    setPrintedByPackage((prev) => {
      const next = { ...prev };
      delete next[packageNo];
      return next;
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "更新包裹失败");
  } finally {
    setSavingByPackage((prev) => ({ ...prev, [packageNo]: false }));
  }
}

type QuotePackageParams = {
  context: ShipmentOrderContext | null;
  packageNo: number;
  setQuotingByPackage: SetState<LoadingByPackageMap>;
  setError: SetState<string | null>;
  setQuoteCandidatesMap: SetState<Record<number, ShipmentQuoteCandidate[]>>;
};

export async function quotePackageAction(
  params: QuotePackageParams,
): Promise<void> {
  const {
    context,
    packageNo,
    setQuotingByPackage,
    setError,
    setQuoteCandidatesMap,
  } = params;

  if (!context) {
    setError("缺少订单上下文：请从发运准备页进入发货作业页。");
    return;
  }

  setQuotingByPackage((prev) => ({ ...prev, [packageNo]: true }));
  setError(null);

  try {
    const res = await quoteShipmentPreparePackage(
      context.platform,
      context.shop_id,
      context.ext_order_no,
      packageNo,
    );

    setQuoteCandidatesMap((prev) => ({
      ...prev,
      [packageNo]: Array.isArray(res.item.quotes)
        ? res.item.quotes.map((candidate) =>
            mapQuoteCandidate(packageNo, candidate),
          )
        : [],
    }));
  } catch (err) {
    setError(err instanceof Error ? err.message : "获取候选报价失败");
  } finally {
    setQuotingByPackage((prev) => ({ ...prev, [packageNo]: false }));
  }
}

type ConfirmPackageQuoteParams = {
  context: ShipmentOrderContext | null;
  packageNo: number;
  providerId: number;
  setConfirmingByPackage: SetState<LoadingByPackageMap>;
  setError: SetState<string | null>;
  setPackageItems: SetState<ShipPreparePackageItem[]>;
  setConfirmedQuotesMap: SetState<Record<number, ConfirmedQuoteState>>;
  setWaybillStateMap: SetState<Record<number, ShipmentWaybillState>>;
  setPrintedByPackage: SetState<Record<number, boolean>>;
  setPackageActionMessageByPackage: SetState<Record<number, string>>;
};

export async function confirmPackageQuoteAction(
  params: ConfirmPackageQuoteParams,
): Promise<void> {
  const {
    context,
    packageNo,
    providerId,
    setConfirmingByPackage,
    setError,
    setPackageItems,
    setConfirmedQuotesMap,
    setWaybillStateMap,
    setPrintedByPackage,
    setPackageActionMessageByPackage,
  } = params;

  if (!context) {
    setError("缺少订单上下文：请从发运准备页进入发货作业页。");
    return;
  }

  setConfirmingByPackage((prev) => ({ ...prev, [packageNo]: true }));
  setError(null);

  try {
    const res = await confirmShipmentPreparePackageQuote(
      context.platform,
      context.shop_id,
      context.ext_order_no,
      packageNo,
      { provider_id: providerId },
    );

    const confirmedState = buildConfirmedQuoteState(res.item);

    setPackageActionMessageByPackage((prev) => ({
      ...prev,
      [packageNo]: confirmedState.amount
        ? `已选择承运商：${confirmedState.carrierName}（￥${confirmedState.amount}）`
        : `已选择承运商：${confirmedState.carrierName}`,
    }));

    setPackageItems((prev) =>
      prev.map((pkg) =>
        pkg.package_no === packageNo
          ? {
              ...pkg,
              pricing_status: res.item.pricing_status,
              selected_provider_id: res.item.selected_provider_id,
            }
          : pkg,
      ),
    );

    setConfirmedQuotesMap((prev) => ({
      ...prev,
      [packageNo]: confirmedState,
    }));

    setWaybillStateMap((prev) => {
      const next = { ...prev };
      delete next[packageNo];
      return next;
    });

    setPrintedByPackage((prev) => {
      const next = { ...prev };
      delete next[packageNo];
      return next;
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "确认报价失败");
  } finally {
    setConfirmingByPackage((prev) => ({ ...prev, [packageNo]: false }));
  }
}
