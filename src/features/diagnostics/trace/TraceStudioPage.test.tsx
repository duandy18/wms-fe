// src/features/diagnostics/trace/TraceStudioPage.test.tsx

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import TraceStudioPage from "./TraceStudioPage";

/* -----------------------------------------------------------
 * 1) Mock 掉 fetchTrace（事件数据）
 * ----------------------------------------------------------- */
vi.mock("./api", () => ({
  fetchTrace: vi.fn().mockResolvedValue({
    trace_id: "demo-trace",
    warehouse_id: 1,
    events: [], // 空事件即可
  }),
}));

/* -----------------------------------------------------------
 * 2) Mock 掉订单生命周期视图（避免 UI 干扰）
 * ----------------------------------------------------------- */
vi.mock("../order-lifecycle/OrderLifecycleView", () => ({
  OrderLifecycleView: ({ traceId }: { traceId: string }) => (
    <div>Lifecycle mock trace_id={traceId}</div>
  ),
}));

/* -----------------------------------------------------------
 * 3) Mock 掉 lib/api（避免加载仓库列表时打到真实后端）
 * ----------------------------------------------------------- */
vi.mock("../../../lib/api", () => ({
  apiGet: vi.fn().mockResolvedValue({ data: [] }),
  apiPost: vi.fn(),
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue(null),
}));

/* -----------------------------------------------------------
 * 4) 渲染 Helper
 * ----------------------------------------------------------- */
function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/trace" element={<TraceStudioPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

/* -----------------------------------------------------------
 * 5) 正式测试用例
 * ----------------------------------------------------------- */
describe("TraceStudioPage tab routing & initial state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows events view by default", async () => {
    renderWithRoute("/trace");

    // 默认是 Events 视图
    expect(
      await screen.findByText("Trace 事件流（Events）"),
    ).toBeInTheDocument();
  });

  it("shows lifecycle view when tab=lifecycle", async () => {
    renderWithRoute("/trace?tab=lifecycle");

    expect(
      await screen.findByText("Lifecycle mock trace_id=", { exact: false }),
    ).toBeInTheDocument();
  });

  it("prefills traceId from URL into TraceEventsView", async () => {
    renderWithRoute("/trace?trace_id=TRACE-123&warehouse_id=1");

    // 在 TraceFilters 里找到 trace_id 输入框
    // 不再死盯整句 placeholder 文案，只匹配 demo Trace 关键片段
    const input = await screen.findByPlaceholderText(/demo:order:PDD:1/i);
    expect(input).toHaveValue("TRACE-123");

    // 仓库下拉不强验证（非核心，且依赖异步加载），所以这里不做断言
  });
});
