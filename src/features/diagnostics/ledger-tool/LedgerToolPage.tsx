// src/features/diagnostics/ledger-tool/LedgerToolPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { downloadCSV, toCSV } from "../../../lib/csv";

import { LedgerFilters } from "./LedgerFilters";
import { LedgerSummaryCard } from "./LedgerSummaryCard";
import { LedgerTableCard } from "./LedgerTableCard";
import { LedgerReconcileCard } from "./LedgerReconcileCard";
import {
  fetchLedgerList,
  fetchLedgerSummary,
  fetchLedgerReconcile,
} from "./api";
import type {
  LedgerList,
  LedgerQueryPayload,
  LedgerSummary,
  LedgerReconcileResult,
} from "./types";

const DEFAULT_LIMIT = 200;

// 视图模式：
// - detail = 原来的高级过滤模式
// - book   = 台账总账视图（只按时间 + 仓库过滤）
export type LedgerViewMode = "detail" | "book";

// 小工具：把 Date 转为 YYYY-MM-DD
function toDateInputString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const LedgerToolPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // ===== 视图模式：明细 / 总账 =====
  const [viewMode, setViewMode] = useState<LedgerViewMode>("detail");

  // ===== 过滤条件状态 =====
  const [itemKeyword, setItemKeyword] = useState("");
  const [warehouseId, setWarehouseId] = useState(
    () => searchParams.get("warehouse_id") ?? "",
  );
  const [batchCode, setBatchCode] = useState(
    () => searchParams.get("batch_code") ?? "",
  );
  const [reason, setReason] = useState("");
  const [ref, setRef] = useState(() => searchParams.get("ref") ?? "");
  const [traceId, setTraceId] = useState(
    () => searchParams.get("trace_id") ?? "",
  );

  // 默认时间窗口：最近 7 天
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return toDateInputString(sevenDaysAgo);
  });
  const [dateTo, setDateTo] = useState(() => {
    const now = new Date();
    return toDateInputString(now);
  });

  // ===== 查询结果状态 =====
  const [result, setResult] = useState<LedgerList | null>(null);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [reconcile, setReconcile] =
    useState<LedgerReconcileResult | null>(null);

  const [loadingQuery, setLoadingQuery] = useState(false);
  const [loadingReconcile, setLoadingReconcile] = useState(false);

  // 构建后端 payload
  function buildQueryPayload(mode: LedgerViewMode): LedgerQueryPayload {
    const payload: LedgerQueryPayload = {
      limit: DEFAULT_LIMIT,
      offset: 0,
    };

    // detail 模式：使用全部过滤字段
    // book 模式：只用 warehouse_id + 时间窗口，忽略其它条件
    const isBook = mode === "book";

    if (!isBook && itemKeyword.trim()) {
      payload.item_keyword = itemKeyword.trim();
    }

    if (warehouseId.trim()) {
      const wid = parseInt(warehouseId.trim(), 10);
      if (!Number.isNaN(wid)) payload.warehouse_id = wid;
    }

    if (!isBook && batchCode.trim()) {
      payload.batch_code = batchCode.trim();
    }
    if (!isBook && reason.trim()) {
      payload.reason = reason.trim();
    }
    if (!isBook && ref.trim()) {
      payload.ref = ref.trim();
    }
    if (!isBook && traceId.trim()) {
      payload.trace_id = traceId.trim();
    }

    if (dateFrom) {
      payload.time_from = `${dateFrom}T00:00:00Z`;
    }
    if (dateTo) {
      payload.time_to = `${dateTo}T23:59:59Z`;
    }

    return payload;
  }

  // 查询明细 + 统计
  async function handleQuery() {
    const payload = buildQueryPayload(viewMode);

    setLoadingQuery(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetchLedgerList(payload),
        fetchLedgerSummary(payload),
      ]);
      setResult(listRes);
      setSummary(summaryRes);
      setReconcile(null);
    } catch (err) {
      console.error("query ledger failed", err);
      setResult({ total: 0, items: [] });
      setSummary(null);
    } finally {
      setLoadingQuery(false);
    }
  }

  // 对账
  async function handleReconcile() {
    const payload = buildQueryPayload(viewMode);

    setLoadingReconcile(true);
    try {
      const res = await fetchLedgerReconcile(payload);
      setReconcile(res);
    } catch (err) {
      console.error("reconcile ledger failed", err);
      setReconcile({ rows: [] });
    } finally {
      setLoadingReconcile(false);
    }
  }

  // 页面初次加载：默认查一次“最近 7 天总账/明细”
  useEffect(() => {
    void handleQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 导出 CSV（当前页明细）
  function handleExportCSV() {
    if (!result || !result.items?.length) return;
    const csv = toCSV(result.items || []);
    downloadCSV(csv, "stock_ledger.csv");
  }

  return (
    <div className="w-full px-6 lg:px-10">
      <div className="mx-auto w-full flex flex-col gap-8 min-h-[calc(100vh-140px)]">
        <LedgerFilters
          // 视图模式
          viewMode={viewMode}
          setViewMode={setViewMode}
          // 过滤条件
          itemKeyword={itemKeyword}
          setItemKeyword={setItemKeyword}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          batchCode={batchCode}
          setBatchCode={setBatchCode}
          reason={reason}
          setReason={setReason}
          ref={ref}
          setRef={setRef}
          traceId={traceId}
          setTraceId={setTraceId}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          // 状态 & 动作
          loadingQuery={loadingQuery}
          loadingReconcile={loadingReconcile}
          onQuery={handleQuery}
          onReconcile={handleReconcile}
        />

        <LedgerSummaryCard summary={summary} />

        <LedgerTableCard result={result} onExport={handleExportCSV} />

        <LedgerReconcileCard reconcile={reconcile} />
      </div>
    </div>
  );
};

export default LedgerToolPage;
