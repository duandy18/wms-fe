// DevConsole 面板枚举（v3）
// =====================================================
// DevConsole 分为两大区域：
// 1. 链路调试（flows）：orders / pick / inbound / count / ship
// 2. 工具（tools）：platform
// =====================================================

export enum DevPanelId {
  Orders = "orders",
  PickTasks = "pick-tasks",
  Inbound = "inbound",
  Count = "count",
  Ship = "ship",        // ⭐ 新增：发货成本调试
  Platform = "platform",
}

export type PanelGroup = "flows" | "tools";

export interface DevTabSpec {
  id: DevPanelId;
  label: string;
  group: PanelGroup;
}
