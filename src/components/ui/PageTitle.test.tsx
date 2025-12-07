import { render, screen } from "@testing-library/react";
import PageTitle from "./PageTitle";

describe("PageTitle", () => {
  it("renders children text", () => {
    render(<PageTitle>诊断驾驶舱</PageTitle>);
    expect(screen.getByText("诊断驾驶舱")).toBeInTheDocument();
  });
});
