// src/features/operations/inbound/InboundTaskContextCard.tsx
// Cockpit 上下文：采购单 / 订单退货 + 收货任务
// - 支持两种模式：
//   * 供应商收货（PO）：从采购单创建收货任务
//   * 订单退货（ORDER）：绑定已有的订单退货收货任务（source_type=ORDER）

import React, { useEffect, useState } from "react";
import type { InboundCockpitController } from "./types";
import {
  fetchPurchaseOrders,
  type PurchaseOrderWithLines,
} from "../../purchase-orders/api";

interface Props {
  c: InboundCockpitController;
}

type InboundMode = "PO" | "ORDER";

type ApiErrorShape = {
  message?: string;
};

export const InboundTaskContextCard: React.FC<Props> = ({ c }) => {
  const po = c.currentPo;
  const task = c.currentTask;

  // 模式：供应商收货 / 订单退货
  const [mode, setMode] = useState<InboundMode>("PO");

  // 最近采购单下拉选项（仅 PO 模式使用）
  const [poOptions, setPoOptions] = useState<PurchaseOrderWithLines[]>([]);
  const [loadingPoOptions, setLoadingPoOptions] = useState(false);
  const [poOptionsError, setPoOptionsError] = useState<string | null>(null);
  const [selectedPoId, setSelectedPoId] = useState<string>("");

  // 初始化加载“最近采购单”（只加载一次，模式切换不影响）
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingPoOptions(true);
      setPoOptionsError(null);
      try {
        const list = await fetchPurchaseOrders({
          skip: 0,
          limit: 50,
        });
        setPoOptions(list);
      } catch (err: unknown) {
        const e = err as ApiErrorShape;
        console.error("load purchase orders for inbound cockpit failed", e);
        setPoOptionsError(e?.message ?? "加载采购单列表失败");
      } finally {
        setLoadingPoOptions(false);
      }
    };
    void loadOptions();
  }, []);

  // 下拉选中时：更新本地选中值 + 同步到 c.poIdInput，并自动加载采购单
  async function handleSelectPo(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setSelectedPoId(v);
    if (!v) {
      return;
    }
    c.setPoIdInput(v);
    await c.loadPoById(); // 直接加载，无需再点按钮
  }

  async function handleManualLoadPo() {
    await c.loadPoById();
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-slate-800">
            任务上下文（采购单 / 订单退货）
          </h2>
          <div className="inline-flex items-center gap-1 text-[11px]">
            <span className="text-slate-500">模式：</span>
            <button
              type="button"
              className={
                "px-2 py-0.5 rounded border " +
                (mode === "PO"
                  ? "border-slate-900 text-slate-900 bg-slate-50"
                  : "border-slate-300 text-slate-500")
              }
              onClick={() => setMode("PO")}
            >
              供应商收货（PO）
            </button>
            <button
              type="button"
              className={
                "px-2 py-0.5 rounded border " +
                (mode === "ORDER"
                  ? "border-slate-900 text-slate-900 bg-slate-50"
                  : "border-slate-300 text-slate-500")
              }
              onClick={() => setMode("ORDER")}
            >
              订单退货（ORDER）
            </button>
          </div>
        </div>

        <div className="text-right space-y-1">
          {c.poError && mode === "PO" && (
            <div className="text-xs text-red-600">{c.poError}</div>
          )}
          {c.taskError && (
            <div className="text-xs text-red-600">{c.taskError}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4 text-sm">
        {/* 左：根据模式切换上下文 */}
        <div className="space-y-2">
          {mode === "PO" ? (
            <>
              {/* 供应商收货：采购单上下文 */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  采购单（PurchaseOrder）
                </span>
                <button
                  type="button"
                  onClick={handleManualLoadPo}
                  disabled={c.loadingPo}
                  className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {c.loadingPo ? "按 ID 加载中…" : "按 ID 加载采购单"}
                </button>
              </div>

              {/* 最近采购单下拉（自动加载） */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-500">
                  最近采购单（选择后自动加载）
                </span>
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                    value={selectedPoId}
                    onChange={handleSelectPo}
                    disabled={loadingPoOptions || !!poOptionsError}
                  >
                    <option value="">
                      {loadingPoOptions
                        ? "加载中…"
                        : poOptionsError
                        ? "加载失败，请刷新重试"
                        : "请选择采购单（最近 50 条）"}
                    </option>
                    {poOptions.map((p) => {
                      const supplier =
                        p.supplier_name ?? p.supplier ?? "未知供应商";
                      const label = `#${p.id} · ${supplier} · ${p.status}`;
                      return (
                        <option key={p.id} value={p.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {poOptionsError && (
                  <span className="text-[11px] text-red-600">
                    {poOptionsError}
                  </span>
                )}
              </div>

              {/* 手工输入 PO ID（用于特殊场景） */}
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-slate-500">PO ID（手工输入）：</span>
                <input
                  className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="例如 1"
                  value={c.poIdInput}
                  onChange={(e) => c.setPoIdInput(e.target.value)}
                />
              </div>

              {po ? (
                <div className="mt-2 space-y-1 text-xs text-slate-700">
                  <div>
                    <span className="font-mono">#{po.id}</span> ·{" "}
                    <span>{po.supplier_name ?? po.supplier}</span>
                  </div>
                  <div className="text-slate-500">
                    仓库：{po.warehouse_id} · 状态：{po.status} · 行数：
                    {po.lines.length}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-xs text-slate-500">
                  尚未加载采购单。推荐使用上方下拉直接选择采购单，系统会自动加载；如需录入手工单号，可在下方输入
                  PO ID 后点击“按 ID 加载采购单”。
                </div>
              )}
            </>
          ) : (
            <>
              {/* 订单退货模式：订单上下文（简化版） */}
              <div className="space-y-1 text-xs">
                <span className="text-xs font-semibold text-slate-600">
                  订单退货模式说明
                </span>
                <p className="text-slate-500">
                  本模式用于接收客户退货（RMA）回仓。当前版本在 Cockpit
                  中仅支持“绑定已有订单退货收货任务”（source_type=
                  <span className="font-mono">ORDER</span>）。退货收货任务可通过后端调试台或专门的退货入口创建。
                </p>
              </div>
              <div className="space-y-1 text-xs">
                <span className="text-slate-500">
                  若已有订单退货收货任务，请在右侧输入任务 ID 并点击“按任务
                  ID 绑定”。
                </span>
              </div>
            </>
          )}
        </div>

        {/* 右：收货任务信息（两种模式共用） */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">
              收货任务（ReceiveTask）
            </span>
            <div className="flex items-center gap-2">
              {mode === "PO" && (
                <button
                  type="button"
                  onClick={c.createTaskFromPo}
                  disabled={c.creatingTask || !po}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white shadow-sm disabled:opacity-60"
                >
                  {c.creatingTask ? "创建中…" : "从当前 PO 创建任务"}
                </button>
              )}
              <button
                type="button"
                onClick={c.bindTaskById}
                disabled={c.loadingTask}
                className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {c.loadingTask ? "按任务 ID 绑定中…" : "按任务 ID 绑定"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">任务 ID：</span>
            <input
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
              placeholder="例如 101"
              value={c.taskIdInput}
              onChange={(e) => c.setTaskIdInput(e.target.value)}
            />
          </div>

          {task ? (
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <div>
                <span className="font-mono">#{task.id}</span>
                {task.po_id != null && (
                  <span className="ml-1 text-slate-500">
                    (PO-{task.po_id})
                  </span>
                )}
              </div>
              <div className="text-slate-500">
                仓库：{task.warehouse_id} · 状态：
                <span className="font-medium">{task.status}</span> · 行数：
                {task.lines.length}
              </div>
              <div className="text-slate-500">
                源类型：
                <span className="font-mono">
                  {task.source_type ?? "UNKNOWN"}
                </span>
                {task.source_type === "ORDER" && task.source_id && (
                  <span className="ml-1">
                    （订单退货 · order_id=
                    <span className="font-mono">{task.source_id}</span>）
                  </span>
                )}
              </div>
              <div className="text-slate-500">
                应收合计：{c.varianceSummary.totalExpected}，实收合计：
                {c.varianceSummary.totalScanned}，差异：
                <span
                  className={
                    c.varianceSummary.totalVariance === 0
                      ? "text-emerald-700"
                      : c.varianceSummary.totalVariance > 0
                      ? "text-amber-700"
                      : "text-rose-700"
                  }
                >
                  {c.varianceSummary.totalVariance}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-500">
              尚未绑定收货任务。你可以：
              <br />
              ① 在“供应商收货（PO）”模式下加载采购单并点击“从当前 PO 创建任务”；<br />
              ② 或在任一模式下，输入已有收货任务 ID（含订单退货任务），点击“按任务 ID 绑定”。
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
