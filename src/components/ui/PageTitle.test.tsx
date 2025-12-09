// src/components/ui/PageTitle.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTitle from "./PageTitle";

describe("PageTitle", () => {
  it("renders title and children text", () => {
    render(<PageTitle title="诊断驾驶舱">诊断驾驶舱</PageTitle>);

    expect(screen.getByText("诊断驾驶舱")).toBeInTheDocument();
  });
});
