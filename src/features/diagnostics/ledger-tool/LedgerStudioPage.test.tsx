// src/features/diagnostics/ledger-tool/LedgerStudioPage.test.tsx

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import LedgerStudioPage from "./LedgerStudioPage";

/**
 * 1) mock 掉 LedgerToolPage / LedgerCockpitPage / LedgerTimelinePage
 *    这样我们只验证中控 Tab 行为，不受子页面复杂 UI 干扰。
 */
vi.mock("./LedgerToolPage", () => ({
  __esModule: true,
  default: () => <div>LedgerTool mock view</div>,
}));

vi.mock("../ledger-cockpit/LedgerCockpitPage", () => ({
  __esModule: true,
  default: () => <div>LedgerCockpit mock view</div>,
}));

vi.mock("../ledger-timeline/LedgerTimelinePage", () => ({
  __esModule: true,
  default: () => <div>LedgerTimeline mock view</div>,
}));

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/tools/ledger" element={<LedgerStudioPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LedgerStudioPage tab routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows tool view by default when no tab is specified", async () => {
    renderWithRoute("/tools/ledger");
    // 中控标题
    expect(
      await screen.findByText("Ledger Studio（台账诊断工作台）"),
    ).toBeInTheDocument();
    // 默认渲染 LedgerTool mock view
    expect(
      await screen.findByText("LedgerTool mock view"),
    ).toBeInTheDocument();
  });

  it("shows cockpit view when tab=cockpit", async () => {
    renderWithRoute("/tools/ledger?tab=cockpit");
    expect(
      await screen.findByText("LedgerCockpit mock view"),
    ).toBeInTheDocument();
  });

  it("shows timeline view when tab=timeline", async () => {
    renderWithRoute("/tools/ledger?tab=timeline");
    expect(
      await screen.findByText("LedgerTimeline mock view"),
    ).toBeInTheDocument();
  });
});
