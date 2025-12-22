// src/features/dev/DevConsoleTypes.ts
// DevConsole 面板枚举（v3）

export enum DevPanelId {
  Orders = "orders",
  PickTasks = "pick-tasks",
  Inbound = "inbound",
  Count = "count",

  Ship = "ship",

  // ✅ Phase 4：Shipping Pricing Lab（解释/实验室）
  ShippingPricingLab = "shipping-pricing-lab",

  Platform = "platform",
}

export type PanelGroup = "flows" | "tools";

export interface DevTabSpec {
  id: DevPanelId;
  label: string;
  group: PanelGroup;
}
