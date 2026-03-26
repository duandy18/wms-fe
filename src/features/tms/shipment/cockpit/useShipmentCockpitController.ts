// src/features/tms/shipment/cockpit/useShipmentCockpitController.ts
//
// 分拆说明：
// - 本文件已从“发运作业页真实数据链控制器”继续收口为薄控制器入口。
// - 当前只负责：
//   1) 组织页面级 state
//   2) 编排真实接口调用
//   3) 输出给页面消费的最终数据与动作
// - 具体类型、上下文解析、数据映射已拆到：
//   - ./controller/types
//   - ./controller/context
//   - ./controller/mappers
//   - ./controller/waybill
//   - ./controller/printWaybillHtml
//   - ./controller/prepareActions
// - 维护约束：
//   - 不要再把大量纯函数映射逻辑塞回本文件
//   - 页面外部继续从本文件 import hook / type，避免扩散改动
//   - 本文件保持“页面控制器”角色，不承担工具库职责

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type {
  ShipPrepareOrderDetailItem,
  ShipPreparePackageItem,
} from "../api/shipmentPrepareApi";
import { shipWithWaybill } from "../api/shipmentWaybillApi";
import { buildOrderContext } from "./controller/context";
import {
  buildSkeletonOrderFromRouteState,
  mapOrderDetailToWorkbenchOrder,
  mapPackageToPlan,
} from "./controller/mappers";
import { buildPrintWaybillHtml } from "./controller/printWaybillHtml";
import {
  confirmAddressAction,
  confirmPackageQuoteAction,
  createPackageAction,
  quotePackageAction,
  refreshOrderAndPackagesAction,
  updatePackageAction,
} from "./controller/prepareActions";
import type {
  ConfirmedQuoteState,
  LoadingByPackageMap,
  ShipmentDispatchRouteState,
  ShipmentExecutionSummary,
  ShipmentOrderContext,
  ShipmentPackagePlan,
  ShipmentQueueRow,
  ShipmentQuoteCandidate,
  ShipmentWaybillState,
  ShipmentWorkbenchOrder,
} from "./controller/types";
import {
  buildShipWithWaybillPayload,
  buildWaybillState,
} from "./controller/waybill";

export type {
  ShipmentDispatchRouteState,
  ShipmentExecutionSummary,
  ShipmentPackagePlan,
  ShipmentQueueRow,
  ShipmentQuoteCandidate,
  ShipmentWorkbenchOrder,
} from "./controller/types";

const EMPTY_ORDER: ShipmentWorkbenchOrder = {
  orderId: 0,
  platform: "",
  shopName: "",
  extOrderNo: "",
  createdAt: "-",
  receiverName: "-",
  receiverPhone: "-",
  rawAddress: "-",
  parsedProvince: "",
  parsedCity: "",
  parsedDistrict: "",
  parsedAddressDetail: "",
  addressStatus: "待确认",
  warehouseName: "待分配",
};

export function useShipmentCockpitController() {
  const location = useLocation();
  const routeState = (location.state || null) as ShipmentDispatchRouteState | null;

  const context = useMemo<ShipmentOrderContext | null>(
    () => buildOrderContext(routeState),
    [routeState],
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingPackage, setCreatingPackage] = useState(false);
  const [confirmingAddress, setConfirmingAddress] = useState(false);
  const [addressSuccessMessage, setAddressSuccessMessage] = useState<string | null>(
    null,
  );
  const [packageActionMessageByPackage, setPackageActionMessageByPackage] =
    useState<Record<number, string>>({});

  const [orderDetail, setOrderDetail] = useState<ShipPrepareOrderDetailItem | null>(
    null,
  );
  const [packageItems, setPackageItems] = useState<ShipPreparePackageItem[]>([]);

  const [quoteCandidatesMap, setQuoteCandidatesMap] = useState<
    Record<number, ShipmentQuoteCandidate[]>
  >({});
  const [confirmedQuotesMap, setConfirmedQuotesMap] = useState<
    Record<number, ConfirmedQuoteState>
  >({});
  const [waybillStateMap, setWaybillStateMap] = useState<
    Record<number, ShipmentWaybillState>
  >({});
  const [printedByPackage, setPrintedByPackage] = useState<Record<number, boolean>>(
    {},
  );

  const [quotingByPackage, setQuotingByPackage] = useState<LoadingByPackageMap>(
    {},
  );
  const [confirmingByPackage, setConfirmingByPackage] =
    useState<LoadingByPackageMap>({});
  const [savingByPackage, setSavingByPackage] = useState<LoadingByPackageMap>({});
  const [requestingWaybillByPackage, setRequestingWaybillByPackage] =
    useState<LoadingByPackageMap>({});

  const currentOrder = useMemo<ShipmentWorkbenchOrder>(() => {
    if (orderDetail) {
      return mapOrderDetailToWorkbenchOrder(orderDetail, packageItems);
    }
    if (routeState) {
      return buildSkeletonOrderFromRouteState(routeState);
    }
    return EMPTY_ORDER;
  }, [orderDetail, packageItems, routeState]);

  const packages = useMemo<ShipmentPackagePlan[]>(() => {
    return packageItems.map((pkg) =>
      mapPackageToPlan(
        pkg,
        confirmedQuotesMap,
        waybillStateMap,
        printedByPackage,
      ),
    );
  }, [packageItems, confirmedQuotesMap, waybillStateMap, printedByPackage]);

  const quoteCandidates = useMemo<ShipmentQuoteCandidate[]>(() => {
    return Object.values(quoteCandidatesMap).flat();
  }, [quoteCandidatesMap]);

  const executionSummary = useMemo<ShipmentExecutionSummary>(() => {
    return {
      packageCount: packages.length,
      waybillCreatedCount: packages.filter((pkg) => Boolean(pkg.trackingNo)).length,
      printedCount: packages.filter((pkg) => pkg.printStatus === "已打印").length,
    };
  }, [packages]);

  const refreshOrderAndPackages = useCallback(async () => {
    await refreshOrderAndPackagesAction({
      context,
      setError,
      setLoading,
      setOrderDetail,
      setPackageItems,
      setQuoteCandidatesMap,
      setConfirmedQuotesMap,
      setWaybillStateMap,
      setPrintedByPackage,
    });
  }, [context]);

  useEffect(() => {
    void refreshOrderAndPackages();
  }, [refreshOrderAndPackages]);

  const confirmAddress = useCallback(async () => {
    await confirmAddressAction({
      context,
      confirmingAddress,
      setConfirmingAddress,
      setError,
      setAddressSuccessMessage,
      refreshOrderAndPackages,
    });
  }, [context, confirmingAddress, refreshOrderAndPackages]);

  const createPackage = useCallback(async () => {
    await createPackageAction({
      context,
      creatingPackage,
      setCreatingPackage,
      setError,
      setPackageItems,
    });
  }, [context, creatingPackage]);

  const updatePackage = useCallback(
    async (
      packageNo: number,
      payload: {
        weight_kg?: number;
        warehouse_id?: number;
      },
    ) => {
      await updatePackageAction({
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
      });
    },
    [context],
  );

  const quotePackage = useCallback(
    async (packageNo: number) => {
      await quotePackageAction({
        context,
        packageNo,
        setQuotingByPackage,
        setError,
        setQuoteCandidatesMap,
      });
    },
    [context],
  );

  const confirmPackageQuote = useCallback(
    async (packageNo: number, providerId: number) => {
      await confirmPackageQuoteAction({
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
      });
    },
    [context],
  );

  const requestWaybill = useCallback(
    async (packageNo: number) => {
      if (!context) {
        setError("缺少订单上下文：请从发运准备页进入发货作业页。");
        return;
      }

      setRequestingWaybillByPackage((prev) => ({ ...prev, [packageNo]: true }));
      setError(null);

      try {
        const payload = buildShipWithWaybillPayload(
          context,
          currentOrder,
          packageNo,
        );

        const res = await shipWithWaybill(payload);

        setWaybillStateMap((prev) => ({
          ...prev,
          [packageNo]: buildWaybillState(res),
        }));

        setPrintedByPackage((prev) => ({
          ...prev,
          [packageNo]: false,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "拉取运单号失败");
      } finally {
        setRequestingWaybillByPackage((prev) => ({
          ...prev,
          [packageNo]: false,
        }));
      }
    },
    [context, currentOrder],
  );

  const printWaybill = useCallback(
    (packageNo: number) => {
      localStorage.setItem(
        "wms_debug_print_click",
        JSON.stringify({
          ts: new Date().toISOString(),
          packageNo,
        }),
      );

      const waybill = waybillStateMap[packageNo];
      if (!waybill || !waybill.templateUrl || !waybill.printData) {
        setError("当前后端未返回可打印面单数据，暂时无法打印。");
        return;
      }

      const popup = window.open("about:blank", "_blank");
      if (!popup) {
        setError("浏览器拦截了打印窗口，请允许弹窗后重试。");
        return;
      }

      const html = buildPrintWaybillHtml({
        packageNo,
        trackingNo: waybill.trackingNo,
        templateUrl: waybill.templateUrl,
        printData: waybill.printData,
      });

      console.log("PRINT_HTML_START");
      console.log(html);
      console.log("PRINT_HTML_END");

      popup.document.open("text/html", "replace");
      popup.document.write(html);
      popup.document.close();
      popup.focus();

      setPrintedByPackage((prev) => ({
        ...prev,
        [packageNo]: true,
      }));
    },
    [waybillStateMap],
  );

  const queueRows = useMemo<ShipmentQueueRow[]>(() => {
    const addressStatus = currentOrder.addressStatus;
    const allReady =
      packages.length > 0 &&
      packages.every((pkg) => pkg.packageStatus === "已就绪");
    const allWaybillCreated =
      packages.length > 0 && packages.every((pkg) => Boolean(pkg.trackingNo));
    const allPrinted =
      packages.length > 0 && packages.every((pkg) => pkg.printStatus === "已打印");

    return [
      {
        orderId: currentOrder.orderId,
        platform: currentOrder.platform,
        shopName: currentOrder.shopName,
        extOrderNo: currentOrder.extOrderNo,
        receiverName: currentOrder.receiverName,
        addressStatus,
        packageCount: packages.length,
        planStatus: allReady ? "已计划" : packages.length > 0 ? "规划中" : "待处理",
        executionStatus: allPrinted
          ? "已完成"
          : allWaybillCreated
            ? "已拉单"
            : "未执行",
        nextStep: allPrinted
          ? "已完成"
          : allWaybillCreated
            ? "继续打印面单"
            : allReady
              ? "进入执行"
              : "完善包裹与报价",
      },
    ];
  }, [currentOrder, packages]);

  return {
    error,
    loading,
    creatingPackage,
    confirmingAddress,
    addressSuccessMessage,
    packageActionMessageByPackage,

    currentOrder,
    packageCount: packages.length,
    packages,
    quoteCandidates,
    queueRows,
    executionSummary,

    quotingByPackage,
    confirmingByPackage,
    savingByPackage,
    requestingWaybillByPackage,

    refreshOrderAndPackages,
    confirmAddress,
    createPackage,
    updatePackage,
    quotePackage,
    confirmPackageQuote,
    requestWaybill,
    printWaybill,
  };
}
