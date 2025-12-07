// src/features/diagnostics/batch-lifeline/BatchLifelinePage.test.tsx

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BatchLifelinePage from "./BatchLifelinePage";

/**
 * mock 掉 lib/api，避免真实网络请求
 */
const apiGetMock = vi.fn();

vi.mock("../../../lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
}));

describe("BatchLifelinePage initial props & auto load", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    // 默认返回一个空 lifeline
    apiGetMock.mockResolvedValue({ lifeline: [] });
  });

  it("prefills inputs from initial props and auto-loads lifeline", async () => {
    render(
      <BatchLifelinePage
        initialWarehouseId={1}
        initialItemId={1001}
        initialBatchCode="NEAR-001"
      />,
    );

    // 输入框里的值应该自动填入
    const whInput = screen.getByPlaceholderText("如 1");
    const itemInput = screen.getByPlaceholderText("如 1001");
    const batchInput = screen.getByPlaceholderText("如 25022301");

    expect(whInput).toHaveValue("1");
    expect(itemInput).toHaveValue("1001");
    expect(batchInput).toHaveValue("NEAR-001");

    // 组件挂载后应自动调用一次 /diagnostics/lifecycle/batch
    await waitFor(() => {
      expect(apiGetMock).toHaveBeenCalledTimes(1);
    });

    expect(apiGetMock).toHaveBeenCalledWith(
      "/diagnostics/lifecycle/batch",
      {
        warehouse_id: 1,
        item_id: 1001,
        batch_code: "NEAR-001",
      },
    );
  });
});
