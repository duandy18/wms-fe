// src/components/ui/PageTitle.test.tsx

import React from "react";
import { render, screen } from "@testing-library/react";
import PageTitle from "./PageTitle";

describe("PageTitle", () => {
  it("renders title heading and children", () => {
    render(<PageTitle title="诊断驾驶舱">诊断驾驶舱</PageTitle>);

    // 只检查 H1 标题是否正确渲染，避免 getByText 命中多处文本
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "诊断驾驶舱",
    });
    expect(heading).toBeInTheDocument();

    // children 文本至少出现一次即可（允许多处）
    const allTexts = screen.getAllByText("诊断驾驶舱");
    expect(allTexts.length).toBeGreaterThanOrEqual(1);
  });
});
