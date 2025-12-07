// src/features/operations/outbound-pick/PickTasksCockpitPage.tsx
//
// 拣货任务 Cockpit（条码驱动版）
// - 左：任务列表（只看 source=ORDER，可切换查看全部）
// - 右：任务总览（详情+差异）/ 批次与拣货（FEFO+扫码+数量输入）/ 提交出库（commit）/ 提交后链路（Trace/Ledger/Snapshot）
// - 条码 → /scan pick（probe=true）→ item_id 完全由后端根据条码主数据解析；
//   前端不再猜测 item_id，只负责数量与批次输入和可视化。

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listPickTasks,
  getPickTask,
  getPickTaskDiff,
  scanPickTask,
  commitPickTask,
  type PickTask,
  type PickTaskDiffSummary,
} from "./pickTasksApi";

import {
  scanPickV2,
  type ScanRequest,
  type ScanResponse,
} from "../scan/api";

import { parseScanBarcode } from "../scan/barcodeParser";

import { PickTaskListPanel } from "./PickTaskListPanel";
import { PickTaskDetailPanel } from "./PickTaskDetailPanel";
import { PickTaskDiffPanel } from "./PickTaskDiffPanel";
import { PickTaskScanPanel } from "./PickTaskScanPanel";
import { PickTaskCommitPanel } from "./PickTaskCommitPanel";
import { PickTaskFefoPanel } from "./PickTaskFefoPanel";
import { PickTaskPostCommitPanel } from "./PickTaskPostCommitPanel";

import {
  fetchItemDetail,
  type ItemDetailResponse,
} from "../../inventory/snapshot/api";

import {
  fetchItemsBasic,
  type ItemBasic,
} from "../../../master-data/itemsApi";

import { fetchLedgerList } from "../../diagnostics/ledger-tool/api";
import type {
  LedgerList,
  LedgerRow,
} from "../../diagnostics/ledger-tool/types";
import { apiGet } from "../../../lib/api";
import type { TraceEvent } from "../../diagnostics/trace/types";

// 订单视图（复用 /orders）
import { fetchOrderView, type OrderView } from "../../orders/api";

type StatusFilter = "ALL" | "READY" | "PICKING" | "DONE";

function derivePlatformShop(ref: string | null): {
  platform: string;
  shop_id: string;
} {
  if (!ref) return { platform: "PDD", shop_id: "1" };
  const parts = ref.split(":");
  if (parts.length >= 4 && parts[0] === "ORD") {
    return {
      platform: (parts[1] || "PDD").toUpperCase(),
      shop_id: parts[2] || "1",
    };
  }
  return { platform: "PDD", shop_id: "1" };
}

// 从任务 ref 中解析订单键：ORD:{platform}:{shop_id}:{ext_order_no}
type OrderRefKey = {
  platform: string;
  shopId: string;
  extOrderNo: string;
};

function parseOrderKeyFromRef(ref: string | null): OrderRefKey | null {
  if (!ref) return null;
  const parts = ref.split(":");
  if (parts.length < 4 || parts[0] !== "ORD") return null;
  const platform = (parts[1] || "PDD").toUpperCase();
  const shopId = parts[2] || "1";
  const extOrderNo = parts.slice(3).join(":") || "";
  if (!extOrderNo) return null;
  return { platform, shopId, extOrderNo };
}

type PickPostCommitInfo = {
  traceEvents: TraceEvent[];
  ledgerRows: LedgerRow[];
  snapshot: ItemDetailResponse | null;
};

type ApiErrorShape = {
  message?: string;
};

type ScanResponseExtended = ScanResponse & {
  ok?: boolean;
  scan_ref?: string | null;
};

const PickTasksCockpitPage: React.FC = () => {
  const navigate = useNavigate();

  // 列表过滤：仓库 + 状态 + 来源（默认只看 ORDER）
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("READY");
  const [sourceFilter, setSourceFilter] = useState<"ORDER" | "ALL">("ORDER");

  // 列表数据
  const [tasks, setTasks] = useState<PickTask[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // 当前选中任务
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<PickTask | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 当前选中 item（用于 FEFO + 扫码）
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  // diff
  const [diff, setDiff] = useState<PickTaskDiffSummary | null>(null);

  // 扫码状态
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanBatchOverride, setScanBatchOverride] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);

  // 扫码数量输入（本次扫描要拣多少件）
  const [scanQty, setScanQty] = useState<number>(1);

  // 扫码预览：本次写入的 item + 批次 + qty
  const [scanPreview, setScanPreview] = useState<{
    item_id: number;
    batch_code: string;
    qty: number;
  } | null>(null);

  // commit 状态
  const [allowDiff, setAllowDiff] = useState(false);
  const [commitBusy, setCommitBusy] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  // FEFO 批次视图状态（当前 active item）
  const [fefoDetail, setFefoDetail] = useState<ItemDetailResponse | null>(
    null,
  );
  const [fefoLoading, setFefoLoading] = useState(false);
  const [fefoError, setFefoError] = useState<string | null>(null);

  // item 主数据缓存：item_id -> ItemBasic
  const [itemMetaMap, setItemMetaMap] = useState<Record<number, ItemBasic>>(
    {},
  );

  // 当前任务的平台 / 店铺
  const currentPlatformShop = useMemo(
    () =>
      selectedTask
        ? derivePlatformShop(selectedTask.ref)
        : { platform: "PDD", shop_id: "1" },
    [selectedTask],
  );

  // 当前任务的订单信息（从 ref 解析，再调 /orders 获取）
  const [orderInfo, setOrderInfo] = useState<OrderView | null>(null);

  // active item 的元数据
  const activeItemMeta: ItemBasic | null =
    activeItemId != null ? itemMetaMap[activeItemId] ?? null : null;

  // commit 后链路信息
  const [traceId, setTraceId] = useState<string | null>(null);
  const [postCommitInfo, setPostCommitInfo] =
    useState<PickPostCommitInfo | null>(null);
  const [postCommitLoading, setPostCommitLoading] = useState(false);
  const [postCommitError, setPostCommitError] = useState<string | null>(null);

  // 根据 sourceFilter 做前端过滤（默认只看 ORDER）
  const visibleTasks = useMemo(
    () =>
      tasks.filter((t) =>
        sourceFilter === "ORDER" ? t.source === "ORDER" : true,
      ),
    [tasks, sourceFilter],
  );

  // ---------------- 一次性加载 items 主数据 ----------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchItemsBasic();
        if (cancelled) return;
        const map: Record<number, ItemBasic> = {};
        for (const it of items) {
          map[it.id] = it;
        }
        setItemMetaMap(map);
      } catch (err) {
        console.error("fetchItemsBasic failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------- 自动清除扫码成功提示 ----------------
  useEffect(() => {
    if (!scanSuccess) return;
    const timer = setTimeout(() => setScanSuccess(false), 1500);
    return () => clearTimeout(timer);
  }, [scanSuccess]);

  // ---------------- 加载列表 ----------------
  async function loadTasks() {
    setLoadingList(true);
    setListError(null);
    try {
      const statusParam =
        statusFilter === "ALL" || statusFilter === "DONE"
          ? undefined
          : statusFilter;
      const data = await listPickTasks({
        warehouse_id: warehouseId || undefined,
        status: statusParam,
        limit: 100,
      });
      setTasks(data);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadTasks failed:", e);
      setListError(e?.message ?? "加载拣货任务列表失败");
      setTasks([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId, statusFilter]);

  // 当 visibleTasks 变化时，同步选中任务
  useEffect(() => {
    if (visibleTasks.length === 0) {
      setSelectedTaskId(null);
      setSelectedTask(null);
      setDiff(null);
      setFefoDetail(null);
      setFefoError(null);
      setScanPreview(null);
      setActiveItemId(null);
      setOrderInfo(null);
      setScanSuccess(false);
      setTraceId(null);
      setPostCommitInfo(null);
      setPostCommitError(null);
      setScanQty(1);
      return;
    }

    if (
      selectedTaskId == null ||
      !visibleTasks.some((t) => t.id === selectedTaskId)
    ) {
      setSelectedTaskId(visibleTasks[0].id);
    }
  }, [visibleTasks, selectedTaskId]);

  // ---------------- 加载详情 + diff + 订单信息 ----------------
  async function loadTaskDetail(taskId: number) {
    setLoadingDetail(true);
    setDetailError(null);
    try {
      // 1) 拿任务本身
      const task = await getPickTask(taskId);
      setSelectedTask(task);
      setActiveItemId(task.lines[0]?.item_id ?? null);

      // 2) 根据 ref 解析订单键，拉订单头
      let order: OrderView | null = null;
      const key = parseOrderKeyFromRef(task.ref ?? null);
      if (key) {
        try {
          order = await fetchOrderView({
            platform: key.platform,
            shopId: key.shopId,
            extOrderNo: key.extOrderNo,
          });
        } catch (e) {
          console.warn("fetchOrderView failed:", e);
        }
      }
      setOrderInfo(order);

      // 3) diff
      const diffSummary = await getPickTaskDiff(taskId);
      setDiff(diffSummary);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadTaskDetail failed:", e);
      setDetailError(e?.message ?? "加载任务详情失败");
      setSelectedTask(null);
      setDiff(null);
      setActiveItemId(null);
      setOrderInfo(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (selectedTaskId != null) {
      void loadTaskDetail(selectedTaskId);
    } else {
      setSelectedTask(null);
      setDiff(null);
      setActiveItemId(null);
      setOrderInfo(null);
    }
  }, [selectedTaskId]);

  // ---------------- activeItemId 变化时加载 FEFO 批次视图 ----------------
  useEffect(() => {
    const itemId =
      activeItemId ?? selectedTask?.lines[0]?.item_id ?? null;
    if (!itemId) {
      setFefoDetail(null);
      setFefoError(null);
      setFefoLoading(false);
      return;
    }

    setFefoLoading(true);
    setFefoError(null);

    fetchItemDetail(itemId)
      .then((detail) => setFefoDetail(detail))
      .catch((err: unknown) => {
        const e = err as ApiErrorShape;
        console.error("load FEFO snapshot failed:", e);
        setFefoDetail(null);
        setFefoError(e?.message ?? "加载批次库存失败");
      })
      .finally(() => setFefoLoading(false));
  }, [activeItemId, selectedTask?.id, selectedTask?.lines]);

  // ---------------- FEFO 卡片“一键使用推荐批次” ----------------
  const handleUseFefoBatch = (batchCode: string) => {
    setScanBatchOverride(batchCode);
  };

  // ---------------- commit 后情报加载 ----------------
  async function loadPostCommit(trace_id: string, task: PickTask) {
    setPostCommitLoading(true);
    setPostCommitError(null);
    try {
      // 1) Trace 事件
      const traceResp = await apiGet<{ events: TraceEvent[] }>(
        `/debug/trace/${encodeURIComponent(trace_id)}`,
      );
      const traceEvents = traceResp?.events ?? [];

      // 2) Ledger 明细
      let ledgerRows: LedgerRow[] = [];
      try {
        const ledgerList: LedgerList = await fetchLedgerList({
          trace_id,
          limit: 100,
          offset: 0,
        });
        ledgerRows = ledgerList.items ?? [];
      } catch (e) {
        console.error("loadPostCommit: fetchLedgerList failed", e);
      }

      // 3) Snapshot：取任务第一行的 item_id
      let snapshot: ItemDetailResponse | null = null;
      try {
        const firstLine = task.lines && task.lines[0];
        if (firstLine) {
          snapshot = await fetchItemDetail(firstLine.item_id);
        }
      } catch (e) {
        console.error("loadPostCommit: fetchItemDetail failed", e);
      }

      setPostCommitInfo({
        traceEvents,
        ledgerRows,
        snapshot,
      });
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadPostCommit(trace) error", e);
      setPostCommitError(e?.message ?? "加载提交后链路信息失败");
    } finally {
      setPostCommitLoading(false);
    }
  }

  // ---------------- 扫码拣货（条码驱动版） ----------------
  const handleScan = async (barcode: string) => {
    if (!selectedTask) {
      setScanError("请先在左侧选择一个拣货任务");
      return;
    }

    const raw = barcode.trim();
    if (!raw) return;

    setScanError(null);
    setScanSuccess(false);
    setScanBusy(true);

    let currentItemId: number | null = null;

    try {
      // 1）本地 parse 只用来拿候选 qty + 批次，不再负责 item_id
      const parsedLocal = parseScanBarcode(raw);

      const qtyCandidateFromBarcode = parsedLocal.qty;
      const effectiveQty =
        scanQty && scanQty > 0
          ? scanQty
          : qtyCandidateFromBarcode && qtyCandidateFromBarcode > 0
          ? qtyCandidateFromBarcode
          : 1;

      const parsedBatch = parsedLocal.batch_code ?? "";
      const overrideBatch = scanBatchOverride.trim();
      const finalBatch = parsedBatch || overrideBatch;

      // 2）调用 /scan(mode=pick, probe=true)，让后端根据条码主数据解析 item_id
      const probeReq: ScanRequest = {
        mode: "pick",
        warehouse_id: selectedTask.warehouse_id,
        barcode: raw,
        qty: effectiveQty,
        probe: true,
        ctx: { device_id: "pick-task-cockpit" },
      };

      let resp: ScanResponse;
      try {
        resp = await scanPickV2(probeReq);
      } catch (e) {
        const ee = e as ApiErrorShape;
        console.error("scanPickV2(probe) failed:", ee);
        throw new Error(
          ee?.message ?? "扫描失败：/scan pick 解析条码出错（probe）",
        );
      }

      const extended = resp as ScanResponseExtended;
      const itemId = extended.item_id ?? 0;
      currentItemId = itemId;

      // 预览信息（在 UI 显示）
      setScanPreview({
        item_id: itemId || 0,
        batch_code: finalBatch,
        qty: effectiveQty,
      });

      // 3）根据后端解析结果判断是否可继续
      if (!itemId || itemId <= 0) {
        const msg = `条码 ${raw} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
        setScanError(msg);

        const go = window.confirm(
          `${msg}\n\n是否现在前往「条码管理」进行绑定？`,
        );
        if (go) {
          navigate(`/admin/items?barcode=${encodeURIComponent(raw)}`);
        }
        return;
      }

      if (!finalBatch) {
        throw new Error(
          "批次不能为空：条码本身不带批次时，必须在下方输入框或通过 FEFO 卡片选择批次。",
        );
      }

      // 多 item 联动：扫码哪个 item，就把 activeItemId 切换到哪个
      setActiveItemId(itemId);

      // 4）写入任务（不扣库存）
      await scanPickTask(selectedTask.id, {
        item_id: itemId,
        qty: effectiveQty,
        batch_code: finalBatch,
      });

      // 刷新详情 / diff / FEFO
      await loadTaskDetail(selectedTask.id);

      // 成功反馈
      setScanSuccess(true);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("scanPickTask with barcode failed:", e);
      setScanError(e?.message ?? "扫码拣货失败");
      setScanSuccess(false);

      if (currentItemId) {
        setActiveItemId(currentItemId);
      }

      // 让 ScanConsole 也能记录错误
      throw err;
    } finally {
      setScanBusy(false);
    }
  };

  // ---------------- commit 出库 ----------------
  const handleCommit = async () => {
    if (!selectedTask) return;
    setCommitError(null);
    setCommitBusy(true);
    setPostCommitInfo(null);
    setPostCommitError(null);

    try {
      const { platform, shop_id } = currentPlatformShop;

      // 生成 trace_id，用于后续 Trace / Ledger / Snapshot 聚合
      const finalTraceId = `picktask:${selectedTask.id}:${Date.now()}`;
      setTraceId(finalTraceId);

      // 提交出库（后端 commit 会写 ledger + stocks，并挂 trace_id）
      await commitPickTask(selectedTask.id, {
        platform,
        shop_id,
        trace_id: finalTraceId,
        allow_diff: allowDiff,
      });

      // 刷新列表 & 详情
      await loadTasks();
      await loadTaskDetail(selectedTask.id);

      // 加载提交后链路信息
      const freshTask = await getPickTask(selectedTask.id);
      await loadPostCommit(finalTraceId, freshTask);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("commitPickTask failed:", e);
      setCommitError(e?.message ?? "commit 出库失败");
    } finally {
      setCommitBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部 */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          拣货任务 Cockpit（条码驱动版）
        </h1>
        <p className="text-sm text-slate-600">
          左侧选择任务，右侧按「任务总览 → 批次与拣货 → 提交出库 → 提交后链路」的顺序完成整条拣货流程。
          条码只负责识别商品与批次，数量由数量输入框决定（例如需要 5 件时只需扫一次并填入 5）。
        </p>
      </header>

      {/* 两列布局：左 = 列表，右 = 三张大卡 + 提交后链路 */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.0fr)_minmax(0,2.0fr)]">
        {/* 左：任务列表 */}
        <PickTaskListPanel
          tasks={visibleTasks}
          loading={loadingList}
          error={listError}
          warehouseId={warehouseId}
          statusFilter={statusFilter}
          sourceFilter={sourceFilter}
          onChangeWarehouse={setWarehouseId}
          onChangeStatus={(v) => setStatusFilter(v as StatusFilter)}
          onChangeSourceFilter={setSourceFilter}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onRefresh={loadTasks}
        />

        {/* 右：三张大卡 + 提交后链路 */}
        <div className="space-y-6">
          {/* 卡1：任务总览 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                任务总览
              </h2>
              {loadingDetail && (
                <span className="text-[11px] text-slate-500">
                  详情加载中…
                </span>
              )}
            </div>
            <PickTaskDetailPanel
              task={selectedTask}
              loading={loadingDetail}
              error={detailError}
              itemMetaMap={itemMetaMap}
              activeItemId={activeItemId}
              onSelectItemId={setActiveItemId}
              orderInfo={orderInfo}
            />
            <PickTaskDiffPanel diff={diff} />
          </section>

          {/* 卡2：批次与拣货 */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg白 p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              批次与拣货
            </h2>
            <PickTaskFefoPanel
              detail={fefoDetail}
              loading={fefoLoading}
              error={fefoError}
              activeItemMeta={activeItemMeta}
              onUseBatch={handleUseFefoBatch}
            />
            <PickTaskScanPanel
              task={selectedTask}
              scanBusy={scanBusy}
              scanError={scanError}
              scanSuccess={scanSuccess}
              batchCodeOverride={scanBatchOverride}
              onChangeBatchCode={setScanBatchOverride}
              scanQty={scanQty}
              onChangeScanQty={setScanQty}
              onScan={handleScan}
              previewItemId={scanPreview?.item_id ?? null}
              previewBatchCode={scanPreview?.batch_code ?? null}
              previewQty={scanPreview?.qty ?? null}
              activeItemMeta={activeItemMeta}
            />
          </section>

          {/* 卡3：提交出库 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              提交出库（commit）
            </h2>
            <PickTaskCommitPanel
              task={selectedTask}
              allowDiff={allowDiff}
              onChangeAllowDiff={setAllowDiff}
              committing={commitBusy}
              commitError={commitError}
              platform={currentPlatformShop.platform}
              shopId={currentPlatformShop.shop_id}
              onCommit={handleCommit}
            />
          </section>

          {/* 卡4：提交后链路 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              提交后链路（Trace / Ledger / Snapshot）
            </h2>
            <PickTaskPostCommitPanel
              traceId={traceId}
              info={postCommitInfo}
              loading={postCommitLoading}
              error={postCommitError}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default PickTasksCockpitPage;
