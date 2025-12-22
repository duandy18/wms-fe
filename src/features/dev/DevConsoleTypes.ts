// src/features/dev/DevConsoleTypes.ts
// DevConsole 面板枚举（v3）
// =====================================================
// DevConsole 分为两大区域：
// 1. 链路调试（flows）：orders / pick / inbound / count
// 2. 工具（tools）：platform / shipping pricing lab(另一个 panel id)
// =====================================================

export enum DevPanelId {
  Orders = "orders",
  PickTasks = "pick-tasks",
  Inbound = "inbound",
  Count = "count",
  Platform = "platform",
}

export type PanelGroup = "flows" | "tools";

export interface DevTabSpec {
  id: DevPanelId;
  label: string;
  group: PanelGroup;
}
