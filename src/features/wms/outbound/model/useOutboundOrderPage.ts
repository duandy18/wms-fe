import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchActiveWarehouses } from "../../warehouses/api";
import type { WarehouseListItem } from "../../warehouses/types";
import {
  fetchBarcodeProbe,
  fetchOrderOutboundOptions,
  fetchOrderOutboundView,
  fetchPublicItemAggregate,
  type OrderOutboundOptionOut,
} from "../api/outboundApi";
import type { OrderOutboundViewResponse } from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

type QtyMap = Record<number, string>;
type BarcodeMap = Record<number, string>;
type LineHintMap = Record<number, string>;

export interface ResolvedOutboundLineInfo {
  itemId: number;
  itemSku: string | null;
  itemName: string | null;
  itemSpec: string | null;
  uomId: number | null;
  uomName: string | null;
  ratioToBase: number | null;
  barcode: string;
}

function buildDefaultLineHint(): string {
  return "等待扫码识别；下一轮在这里接入命中的 lot / 批次 / 日期信息。";
}

function clearLineMaps(
  setQtyByLineId: React.Dispatch<React.SetStateAction<QtyMap>>,
  setBarcodeByLineId: React.Dispatch<React.SetStateAction<BarcodeMap>>,
  setLineHintByLineId: React.Dispatch<React.SetStateAction<LineHintMap>>,
  setResolvedByLineId: React.Dispatch<
    React.SetStateAction<Record<number, ResolvedOutboundLineInfo>>
  >,
) {
  setQtyByLineId({});
  setBarcodeByLineId({});
  setLineHintByLineId({});
  setResolvedByLineId({});
}

export function useOutboundOrderPage() {
  const [orders, setOrders] = useState<OrderOutboundOptionOut[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  const [detail, setDetail] = useState<OrderOutboundViewResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [qtyByLineId, setQtyByLineId] = useState<QtyMap>({});
  const [barcodeByLineId, setBarcodeByLineId] = useState<BarcodeMap>({});
  const [lineHintByLineId, setLineHintByLineId] = useState<LineHintMap>({});
  const [resolvedByLineId, setResolvedByLineId] = useState<
    Record<number, ResolvedOutboundLineInfo>
  >({});
  const [resolvingLineId, setResolvingLineId] = useState<number | null>(null);

  const [submitMessage, setSubmitMessage] = useState("");

  const selectedOrder = useMemo(() => {
    const id = Number(selectedOrderId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return orders.find((item) => item.id === id) ?? null;
  }, [orders, selectedOrderId]);

  const selectedWarehouse = useMemo(() => {
    const id = Number(selectedWarehouseId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return warehouses.find((item) => item.id === id) ?? null;
  }, [selectedWarehouseId, warehouses]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await fetchOrderOutboundOptions({
        limit: 200,
        offset: 0,
      });
      setOrders(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setOrders([]);
      setOrdersError(getErrorMessage(error, "加载订单列表失败"));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    setWarehousesError("");
    try {
      const data = await fetchActiveWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      setWarehouses([]);
      setWarehousesError(getErrorMessage(error, "加载仓库列表失败"));
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    void loadWarehouses();
  }, [loadOrders, loadWarehouses]);

  const loadDetail = useCallback(async (orderId: number) => {
    setDetailLoading(true);
    setDetailError("");
    setSubmitMessage("");
    setResolvingLineId(null);

    try {
      const data = await fetchOrderOutboundView(orderId);
      setDetail(data);

      const nextQtyByLineId: QtyMap = {};
      const nextBarcodeByLineId: BarcodeMap = {};
      const nextLineHintByLineId: LineHintMap = {};

      for (const line of data.lines) {
        nextQtyByLineId[line.id] = "";
        nextBarcodeByLineId[line.id] = "";
        nextLineHintByLineId[line.id] = buildDefaultLineHint();
      }

      setQtyByLineId(nextQtyByLineId);
      setBarcodeByLineId(nextBarcodeByLineId);
      setLineHintByLineId(nextLineHintByLineId);
      setResolvedByLineId({});
    } catch (error) {
      setDetail(null);
      clearLineMaps(
        setQtyByLineId,
        setBarcodeByLineId,
        setLineHintByLineId,
        setResolvedByLineId,
      );
      setDetailError(getErrorMessage(error, "加载订单出库视图失败"));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const selectOrderId = useCallback(
    (next: string) => {
      setSelectedOrderId(next);

      const id = Number(next);
      if (!Number.isFinite(id) || id <= 0) {
        setDetail(null);
        clearLineMaps(
          setQtyByLineId,
          setBarcodeByLineId,
          setLineHintByLineId,
          setResolvedByLineId,
        );
        setDetailError("");
        return;
      }

      void loadDetail(id);
    },
    [loadDetail],
  );

  const updateQty = useCallback((lineId: number, value: string) => {
    setQtyByLineId((prev) => ({ ...prev, [lineId]: value }));
  }, []);

  const updateBarcode = useCallback((lineId: number, value: string) => {
    setBarcodeByLineId((prev) => ({ ...prev, [lineId]: value }));
  }, []);

  const resolveBarcode = useCallback(
    async (lineId: number) => {
      const line = detail?.lines.find((item) => item.id === lineId);
      if (!line) return;

      const barcode = (barcodeByLineId[lineId] || "").trim();
      if (!barcode) {
        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]: "请先输入或扫码条码，再进行识别。",
        }));
        return;
      }

      setResolvingLineId(lineId);

      try {
        const probe = await fetchBarcodeProbe(barcode);

        if (probe.ok !== true || probe.status !== "BOUND" || !probe.item_id) {
          setResolvedByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: "未识别到有效商品条码，请检查条码绑定。",
          }));
          return;
        }

        if (probe.item_id !== line.item_id) {
          setResolvedByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: `条码已识别为商品 ${probe.item_basic?.name || probe.item_id}，与订单行商品不一致。`,
          }));
          return;
        }

        let uomName: string | null = null;
        if (probe.item_uom_id != null) {
          try {
            const aggregate = await fetchPublicItemAggregate(probe.item_id);
            const matchedUom =
              aggregate.uoms.find((uom) => uom.id === probe.item_uom_id) ?? null;
            if (matchedUom) {
              uomName = matchedUom.display_name || matchedUom.uom || null;
            }
          } catch {
            uomName = null;
          }
        }

        const resolved: ResolvedOutboundLineInfo = {
          itemId: probe.item_id,
          itemSku: probe.item_basic?.sku || line.item_sku || null,
          itemName: probe.item_basic?.name || line.item_name || null,
          itemSpec: probe.item_basic?.spec || line.item_spec || null,
          uomId: probe.item_uom_id ?? null,
          uomName: uomName,
          ratioToBase: probe.ratio_to_base ?? null,
          barcode,
        };

        setResolvedByLineId((prev) => ({
          ...prev,
          [lineId]: resolved,
        }));

        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]:
            resolved.ratioToBase != null
              ? `已识别商品与订单行一致，包装倍率 × ${resolved.ratioToBase}。下一步录入本次出库数量。`
              : "已识别商品与订单行一致。下一步录入本次出库数量。",
        }));
      } catch (error) {
        setResolvedByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });
        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]: getErrorMessage(error, "条码识别失败"),
        }));
      } finally {
        setResolvingLineId(null);
      }
    },
    [barcodeByLineId, detail?.lines],
  );

  const enteredLinesCount = useMemo(() => {
    return Object.values(qtyByLineId).filter((value) => {
      const qty = Number(value);
      return Number.isFinite(qty) && qty > 0;
    }).length;
  }, [qtyByLineId]);

  const handleSubmitPlaceholder = useCallback(() => {
    if (!selectedOrder) {
      setSubmitMessage("请先选择订单。");
      return;
    }
    if (!selectedWarehouse) {
      setSubmitMessage("请先选择执行仓库。");
      return;
    }
    if (enteredLinesCount <= 0) {
      setSubmitMessage("请至少录入一条本次出库数量。");
      return;
    }

    setSubmitMessage(
      "当前页已完成真实扫码识别与作业展示增强；lot 命中与提交合同这一步下一轮继续接。",
    );
  }, [enteredLinesCount, selectedOrder, selectedWarehouse]);

  return {
    orders,
    ordersLoading,
    ordersError,

    warehouses,
    warehousesLoading,
    warehousesError,

    selectedOrderId,
    selectedOrder,
    selectOrderId,
    selectedWarehouseId,
    setSelectedWarehouseId,
    selectedWarehouse,

    detail,
    detailLoading,
    detailError,

    qtyByLineId,
    barcodeByLineId,
    lineHintByLineId,
    resolvedByLineId,
    resolvingLineId,
    updateQty,
    updateBarcode,
    resolveBarcode,

    enteredLinesCount,
    submitMessage,
    handleSubmitPlaceholder,

    reloadOrders: () => {
      void loadOrders();
    },
    reloadDetail: () => {
      if (selectedOrder) {
        void loadDetail(selectedOrder.id);
      }
    },
  };
}
