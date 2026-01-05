// src/features/operations/inbound/ReceiveSupplementPanel.tsx
// 收货补录（可嵌入面板）
// 目标：集中补齐 批次 / 生产日期 / 到期日期
// 原则：不做收货数量入账；不做业务解释系统；只呈现 状态 / 结果 / 错误

import React, { useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";

export type SupplementSourceType = "PURCHASE" | "RETURN" | "MISC";

const SOURCE_LABEL: Record<SupplementSourceType, string> = {
  PURCHASE: "采购收货",
  RETURN: "退货收货",
  MISC: "样品 / 零星",
};

type ViewStatus = "MISSING" | "DONE" | "ALL";

const STATUS_LABEL: Record<ViewStatus, string> = {
  MISSING: "仅缺失待补录",
  DONE: "仅已补录",
  ALL: "全部",
};

export const ReceiveSupplementPanel: React.FC<{
  initialSourceType?: SupplementSourceType;
  showTitle?: boolean;
  compact?: boolean;
}> = ({ initialSourceType = "PURCHASE", showTitle = true, compact = false }) => {
  const [sourceType, setSourceType] = useState<SupplementSourceType>(initialSourceType);
  const [status, setStatus] = useState<ViewStatus>("MISSING");
  const [keyword, setKeyword] = useState<string>("");

  // 纯占位：后续接后端时替换为真实列表
  const items = useMemo(() => {
    const demo = [
      {
        id: 1,
        sourceType: "PURCHASE" as const,
        sourceRef: "收货任务 #123",
        itemName: "示例商品 A",
        receivedQty: 12,
        missing: ["批次", "到期日期"],
        batch: "-",
        prod: "-",
        exp: "-",
      },
      {
        id: 2,
        sourceType: "RETURN" as const,
        sourceRef: "退货任务 #45",
        itemName: "示例商品 B",
        receivedQty: 2,
        missing: ["批次"],
        batch: "-",
        prod: "2026-01-01",
        exp: "-",
      },
      {
        id: 3,
        sourceType: "PURCHASE" as const,
        sourceRef: "收货任务 #126",
        itemName: "示例商品 C",
        receivedQty: 6,
        missing: [],
        batch: "BATCH-001",
        prod: "2025-12-01",
        exp: "2026-12-01",
      },
      {
        id: 4,
        sourceType: "MISC" as const,
        sourceRef: "零星收货 #9",
        itemName: "示例商品 D",
        receivedQty: 1,
        missing: ["批次"],
        batch: "-",
        prod: "-",
        exp: "-",
      },
    ];

    return demo
      .filter((x) => x.sourceType === sourceType)
      .filter((x) => {
        if (status === "ALL") return true;
        if (status === "MISSING") return x.missing.length > 0;
        return x.missing.length === 0;
      })
      .filter((x) => {
        const k = keyword.trim();
        if (!k) return true;
        return (
          x.itemName.includes(k) ||
          x.sourceRef.includes(k) ||
          (x.batch ?? "").includes(k)
        );
      });
  }, [sourceType, status, keyword]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = useMemo(() => {
    if (selectedId == null) return null;
    return items.find((x) => x.id === selectedId) ?? null;
  }, [items, selectedId]);

  const [editBatch, setEditBatch] = useState<string>("");
  const [editProd, setEditProd] = useState<string>("");
  const [editExp, setEditExp] = useState<string>("");

  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  function loadSelectedToForm() {
    if (!selected) return;
    setEditBatch(selected.batch === "-" ? "" : selected.batch);
    setEditProd(selected.prod === "-" ? "" : selected.prod);
    setEditExp(selected.exp === "-" ? "" : selected.exp);
    setSaveMsg(null);
    setSaveErr(null);
  }

  // 纯占位：后续接 API 时替换为真实保存
  function handleSave() {
    setSaveMsg(null);
    setSaveErr(null);

    if (!selected) {
      setSaveErr("未选择任何待补录行。");
      return;
    }

    const b = editBatch.trim();
    const p = editProd.trim();
    const e = editExp.trim();

    if (!b && !p && !e) {
      setSaveErr("请至少填写一项（批次/生产日期/到期日期）。");
      return;
    }

    setSaveMsg("已保存（演示占位：实际保存需接后端）。");
  }

  function handleSaveAndNext() {
    handleSave();
    // 占位：真实实现会在保存成功后自动选中下一条
  }

  const wrapCls = compact ? "space-y-4" : "p-6 space-y-6";

  return (
    <div className={wrapCls}>
      {showTitle ? (
        <PageTitle title="收货补录" description="集中补齐批次 / 生产日期 / 到期日期（独立工作站）。" />
      ) : null}

      {/* 筛选区 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">来源类型</label>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value as SupplementSourceType);
                setSelectedId(null);
                setSaveMsg(null);
                setSaveErr(null);
              }}
            >
              {Object.entries(SOURCE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">显示范围</label>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ViewStatus);
                setSelectedId(null);
                setSaveMsg(null);
                setSaveErr(null);
              }}
            >
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[240px]">
            <label className="text-xs text-slate-600">搜索</label>
            <input
              className="border rounded-md px-3 py-2 text-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="商品名 / 任务号 / 批次"
            />
          </div>

          <div className="text-xs text-slate-500 ml-auto">
            当前：{SOURCE_LABEL[sourceType]} · {STATUS_LABEL[status]} · {items.length} 行
          </div>
        </div>
      </section>

      {/* 主体：列表 + 编辑 */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        {/* 列表 */}
        <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">待补录列表</h2>
            <span className="text-[11px] text-slate-500">点击一行进入补录</span>
          </div>

          {items.length === 0 ? (
            <div className="text-sm text-slate-600">暂无符合条件的记录。</div>
          ) : (
            <div className="space-y-2">
              {items.map((x) => {
                const active = x.id === selectedId;
                const missingText =
                  x.missing.length > 0 ? `缺失：${x.missing.join(" / ")}` : "已补录";
                return (
                  <button
                    key={x.id}
                    type="button"
                    className={
                      "w-full text-left rounded-lg border p-3 " +
                      (active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800")
                    }
                    onClick={() => {
                      setSelectedId(x.id);
                      setSaveMsg(null);
                      setSaveErr(null);
                      setTimeout(loadSelectedToForm, 0);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{x.itemName}</div>
                      <div className={active ? "text-[11px] text-slate-200" : "text-[11px] text-slate-500"}>
                        {x.sourceRef}
                      </div>
                    </div>

                    <div className={active ? "mt-1 text-xs text-slate-200" : "mt-1 text-xs text-slate-600"}>
                      已收：<span className="font-mono">{x.receivedQty}</span> · {missingText}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 编辑区 */}
        <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">补录编辑</h2>
            <span className="text-[11px] text-slate-500">仅在本面板允许编辑批次/日期</span>
          </div>

          {!selected ? (
            <div className="text-sm text-slate-600">请先从左侧选择一行。</div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <div className="font-medium text-slate-800">{selected.itemName}</div>
                <div>来源：{selected.sourceRef}</div>
                <div>
                  已收：<span className="font-mono">{selected.receivedQty}</span>
                  {selected.missing.length > 0 ? (
                    <span className="ml-2 text-amber-700">缺失：{selected.missing.join(" / ")}</span>
                  ) : (
                    <span className="ml-2 text-emerald-700">已补录</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">批次</label>
                  <input
                    className="border rounded-md px-3 py-2 text-sm font-mono"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    placeholder="例如：BATCH-202601"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600">生产日期</label>
                    <input
                      type="date"
                      className="border rounded-md px-3 py-2 text-sm"
                      value={editProd}
                      onChange={(e) => setEditProd(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600">到期日期</label>
                    <input
                      type="date"
                      className="border rounded-md px-3 py-2 text-sm"
                      value={editExp}
                      onChange={(e) => setEditExp(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {saveErr ? <div className="text-sm text-red-600">{saveErr}</div> : null}
              {saveMsg ? <div className="text-sm text-emerald-700">{saveMsg}</div> : null}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  onClick={handleSave}
                >
                  保存
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={handleSaveAndNext}
                >
                  保存并下一条
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={loadSelectedToForm}
                >
                  重置为当前值
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                备注：当前为演示壳结构，后续接后端接口后，保存结果会真实更新列表状态。
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
