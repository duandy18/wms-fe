// src/features/dev/ship/DevShipPanel.tsx
//
// 兼容壳：历史路径保留
// 真实实现统一在：src/features/dev/DevShipPanel.tsx
//
// 目的：避免双生子面板分裂（一个真算价，一个假数据）。

import DevShipPanel from "../DevShipPanel";
export default DevShipPanel;
export { default as DevShipPanel } from "../DevShipPanel";
