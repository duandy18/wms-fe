// src/features/diagnostics/stock-tool/InventoryStudioPage.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import InventoryStudioPage from "./InventoryStudioPage";

// 避免实际发网络请求：mock 掉 lib/api 的方法
vi.mock("../../../lib/api", () => ({
  apiGet: vi.fn().mockResolvedValue({ ok: true }),
  apiPost: vi.fn().mockResolvedValue({ ok: true, items: [], total: 0 }),
}));

// Dashboard 用到的 intelligence api 也可以简单 mock 掉
vi.mock("../intelligence-dashboard/api", () => ({
  fetchInsights: vi.fn().mockResolvedValue({
    inventory_health_score: 0.5,
    inventory_accuracy_score: 0.8,
    snapshot_accuracy_score: 0.7,
    batch_activity_30days: 10,
    batch_risk_score: 0.3,
    warehouse_efficiency: 0.6,
  }),
  fetchAnomaly: vi.fn().mockResolvedValue({
    ledger_vs_stocks: [],
    ledger_vs_snapshot: [],
    stocks_vs_snapshot: [],
  }),
  fetchAgeing: vi.fn().mockResolvedValue([]),
  fetchAutohealSuggestions: vi.fn().mockResolvedValue({
    count: 0,
    suggestions: [],
  }),
  fetchPrediction: vi.fn().mockResolvedValue({
    warehouse_id: 1,
    item_id: 1,
    current_qty: 0,
    avg_daily_outbound: 0,
    predicted_qty: 0,
    days: 7,
    risk: "OK",
  }),
  fetchHotItems: vi.fn().mockResolvedValue([]),
}));

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/tools/stocks" element={<InventoryStudioPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("InventoryStudioPage tab routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to Dashboard tab when no item/warehouse in URL", async () => {
    renderWithRoute("/tools/stocks");
    // Dashboard 有一个明显的标题
    expect(
      await screen.findByText("智能库存仪表盘（Inventory Intelligence Dashboard）"),
    ).toBeInTheDocument();
  });

  it("auto-selects Stock tab when item_id & warehouse_id are present", async () => {
    renderWithRoute("/tools/stocks?warehouse_id=1&item_id=1001");
    // StockTool 有一个明显的标题
    expect(
      await screen.findByText("库存工具（StockTool）", { exact: false }),
    ).toBeInTheDocument();
  });

  it("auto-selects Batch Lifeline tab when hash=lifeline and params exist", async () => {
    renderWithRoute(
      "/tools/stocks?warehouse_id=1&item_id=1001&batch_code=NEAR-001#lifeline",
    );
    expect(
      await screen.findByText("批次生命周期（Batch Lifeline）", { exact: false }),
    ).toBeInTheDocument();
  });
});
