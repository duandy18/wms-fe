import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchActiveWarehouses } from "../../warehouses/api";
import type { WarehouseListItem } from "../../warehouses/types";
import {
  fetchBarcodeProbe,
  fetchOrderOutboundOptions,
  fetchOrderOutboundView,
  fetchOutboundLotCandidates,
  fetchPublicItemAggregate,
  submitOrderOutbound,
  type OrderOutboundOptionOut,
} from "../api/outboundApi";
import type {
  OrderOutboundViewResponse,
  OutboundLotCandidateOut,
} from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

type QtyMap = Record<number, string>;
type BarcodeMap = Record<number, string>;
type LineHintMap = Record<number, string>;
type LotCandidatesMap = Record<number, OutboundLotCandidateOut[]>;
type SelectedLotMap = Record<number, OutboundLotCandidateOut>;

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
  return "上行看订单行参考，下行填实现；下一轮在这里接入命中的 lot / 批次 / 日期信息。";
}

function clearLineMaps(
  setQtyByLineId: React.Dispatch<React.SetStateAction<QtyMap>>,
  setBarcodeByLineId: React.Dispatch<React.SetStateAction<BarcodeMap>>,
  setLineHintByLineId: React.Dispatch<React.SetStateAction<LineHintMap>>,
  setResolvedByLineId: React.Dispatch<
    React.SetStateAction<Record<number, ResolvedOutboundLineInfo>>
  >,
  setLotCandidatesByLineId: React.Dispatch<
    React.SetStateAction<LotCandidatesMap>
  >,
  setSelectedLotByLineId: React.Dispatch<
    React.SetStateAction<SelectedLotMap>
  >,
) {
  setQtyByLineId({});
  setBarcodeByLineId({});
  setLineHintByLineId({});
  setResolvedByLineId({});
  setLotCandidatesByLineId({});
  setSelectedLotByLineId({});
}

function formatLotLabel(candidate: OutboundLotCandidateOut): string {
  if (candidate.lot_code && candidate.lot_code.trim()) {
    return candidate.lot_code.trim();
  }
  return `内部 lot #${candidate.lot_id}`;
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
  const [lotCandidatesByLineId, setLotCandidatesByLineId] =
    useState<LotCandidatesMap>({});
  const [selectedLotByLineId, setSelectedLotByLineId] =
    useState<SelectedLotMap>({});
  const [resolvingLineId, setResolvingLineId] = useState<number | null>(null);

  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setLotCandidatesByLineId({});
      setSelectedLotByLineId({});
    } catch (error) {
      setDetail(null);
      clearLineMaps(
        setQtyByLineId,
        setBarcodeByLineId,
        setLineHintByLineId,
        setResolvedByLineId,
        setLotCandidatesByLineId,
        setSelectedLotByLineId,
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
          setLotCandidatesByLineId,
          setSelectedLotByLineId,
        );
        setDetailError("");
        return;
      }

      void loadDetail(id);
    },
    [loadDetail],
  );

  const selectWarehouseId = useCallback(
    (next: string) => {
      setSelectedWarehouseId(next);
      setSubmitMessage("");
      setLotCandidatesByLineId({});
      setSelectedLotByLineId({});

      if (!detail?.lines?.length) return;

      setLineHintByLineId((prev) => {
        const nextHints = { ...prev };
        for (const line of detail.lines) {
          nextHints[line.id] = resolvedByLineId[line.id]
            ? "执行仓已切换，请重新识别条码以读取新的 lot 候选。"
            : buildDefaultLineHint();
        }
        return nextHints;
      });
    },
    [detail?.lines, resolvedByLineId],
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
          [lineId]: "请先在本行输入或扫码条码，再进行识别。",
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
          setLotCandidatesByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setSelectedLotByLineId((prev) => {
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
          setLotCandidatesByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setSelectedLotByLineId((prev) => {
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
          uomName,
          ratioToBase: probe.ratio_to_base ?? null,
          barcode,
        };

        setResolvedByLineId((prev) => ({
          ...prev,
          [lineId]: resolved,
        }));

        if (!selectedWarehouse) {
          setLotCandidatesByLineId((prev) => ({
            ...prev,
            [lineId]: [],
          }));
          setSelectedLotByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: "已识别商品与订单行一致，请先选择执行仓库，再重新识别以读取 lot 候选。",
          }));
          return;
        }

        const lotResp = await fetchOutboundLotCandidates(
          selectedWarehouse.id,
          probe.item_id,
        );
        const candidates = Array.isArray(lotResp.candidates)
          ? lotResp.candidates
          : [];

        setLotCandidatesByLineId((prev) => ({
          ...prev,
          [lineId]: candidates,
        }));
        setSelectedLotByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });

        if (candidates.length <= 0) {
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: "已识别商品与订单行一致，但当前执行仓暂无可用 lot。",
          }));
          return;
        }

        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]: `已识别商品与订单行一致；当前执行仓共有 ${candidates.length} 个可用 lot，请选择。`,
        }));
      } catch (error) {
        setResolvedByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });
        setLotCandidatesByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });
        setSelectedLotByLineId((prev) => {
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
    [barcodeByLineId, detail?.lines, selectedWarehouse],
  );

  const selectLot = useCallback(
    (lineId: number, lotId: number) => {
      const candidates = lotCandidatesByLineId[lineId] ?? [];
      const matched = candidates.find((item) => item.lot_id === lotId) ?? null;
      if (!matched) return;

      setSelectedLotByLineId((prev) => ({
        ...prev,
        [lineId]: matched,
      }));

      setLineHintByLineId((prev) => ({
        ...prev,
        [lineId]: `已选择 ${formatLotLabel(matched)}；可出数量 ${matched.available_qty}。下一步录入本次出库数量并进入真实提交。`,
      }));
    },
    [lotCandidatesByLineId],
  );

  const enteredLinesCount = useMemo(() => {
    return Object.values(qtyByLineId).filter((value) => {
      const qty = Number(value);
      return Number.isFinite(qty) && qty > 0;
    }).length;
  }, [qtyByLineId]);

  const canSubmit = useMemo(() => {
    if (!selectedOrder || !selectedWarehouse || !detail || isSubmitting) return false;

    const qtyLines = detail.lines.filter((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      return Number.isFinite(qty) && qty > 0;
    });
    if (qtyLines.length <= 0) return false;

    return qtyLines.every((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      const selectedLot = selectedLotByLineId[line.id];
      if (!selectedLot) return false;
      return qty <= Number(selectedLot.available_qty ?? 0);
    });
  }, [
    detail,
    isSubmitting,
    qtyByLineId,
    selectedLotByLineId,
    selectedOrder,
    selectedWarehouse,
  ]);

  const handleSubmitPlaceholder = useCallback(async () => {
    if (!selectedOrder) {
      setSubmitMessage("请先选择订单。");
      return;
    }
    if (!selectedWarehouse) {
      setSubmitMessage("请先选择执行仓库。");
      return;
    }
    if (!detail) {
      setSubmitMessage("当前订单详情未加载完成。");
      return;
    }
    if (enteredLinesCount <= 0) {
      setSubmitMessage("请至少录入一条本次出库数量。");
      return;
    }

    const qtyLines = detail.lines.filter((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      return Number.isFinite(qty) && qty > 0;
    });

    if (qtyLines.length <= 0) {
      setSubmitMessage("请至少录入一条本次出库数量。");
      return;
    }

    const missingLotLine = qtyLines.find((line) => !selectedLotByLineId[line.id]);
    if (missingLotLine) {
      setSubmitMessage(`行 ${missingLotLine.id} 已录入本次出库数量，但仍未选择 lot。`);
      return;
    }

    const overAvailableLine = qtyLines.find((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      const selectedLot = selectedLotByLineId[line.id];
      return qty > Number(selectedLot?.available_qty ?? 0);
    });
    if (overAvailableLine) {
      setSubmitMessage(`行 ${overAvailableLine.id} 本次出库数量超过已选 lot 可出数量。`);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        warehouse_id: selectedWarehouse.id,
        remark: null,
        lines: qtyLines.map((line) => {
          const selectedLot = selectedLotByLineId[line.id];
          return {
            order_line_id: line.id,
            item_id: line.item_id,
            qty_outbound: Number(qtyByLineId[line.id] || "0"),
            lot_id: selectedLot.lot_id,
            remark: null,
          };
        }),
      };

      const result = await submitOrderOutbound(selectedOrder.id, payload);
      setSubmitMessage(
        `提交成功：已生成出库事件 ${result.event_id}，共 ${result.lines_count} 行。`,
      );
      await loadDetail(selectedOrder.id);
      await loadOrders();
    } catch (error) {
      setSubmitMessage(getErrorMessage(error, "提交订单出库失败"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    detail,
    enteredLinesCount,
    loadDetail,
    loadOrders,
    qtyByLineId,
    selectedLotByLineId,
    selectedOrder,
    selectedWarehouse,
  ]);

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
    selectWarehouseId,
    selectedWarehouse,

    detail,
    detailLoading,
    detailError,

    qtyByLineId,
    barcodeByLineId,
    lineHintByLineId,
    resolvedByLineId,
    lotCandidatesByLineId,
    selectedLotByLineId,
    resolvingLineId,
    updateQty,
    updateBarcode,
    resolveBarcode,
    selectLot,

    enteredLinesCount,
    canSubmit,
    isSubmitting,
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
