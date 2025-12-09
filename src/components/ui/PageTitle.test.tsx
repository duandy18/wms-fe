// src/components/ui/PageTitle.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTitle from "./PageTitle";

describe("PageTitle", () => {
  it("renders title heading and children", () => {
    render(
      <PageTitle title="诊断驾驶舱">
        <span>诊断驾驶舱</span>
      </PageTitle>,
    );

    // 1) 标题用 heading role 断言
    const heading = screen.getByRole("heading", { name: "诊断驾驶舱" });
    expect(heading).toBeInTheDocument();

    // 2) 文本可出现多处，用 getAllByText 断言至少出现一次
    const allTexts = screen.getAllByText("诊断驾驶舱");
    expect(allTexts.length).toBeGreaterThanOrEqual(1);
  });
});
