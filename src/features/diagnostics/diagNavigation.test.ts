// src/features/diagnostics/diagNavigation.test.ts
import { describe, it, expect } from "vitest";
import { buildDiagnosticUrl } from "./diagNavigation";

describe("buildDiagnosticUrl", () => {
  it("builds trace URL with traceId", () => {
    const url = buildDiagnosticUrl({
      kind: "trace",
      traceId: "demo-trace-123",
    });
    expect(url).toBe("/trace?tab=trace&trace_id=demo-trace-123");
  });
});
