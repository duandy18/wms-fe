// src/features/dev/DevConsoleTabs.tsx
// 简洁版：所有 Tab 一行横向排列（Orders / Pick / Inbound / Count / Platform）

import React from "react";
import { DevPanelId, type DevTabSpec } from "./DevConsoleTypes";

const TABS: DevTabSpec[] = [
  { id: DevPanelId.Orders, label: "订单链路调试", group: "flows" },
  { id: DevPanelId.PickTasks, label: "拣货链路调试", group: "flows" },
  { id: DevPanelId.Inbound, label: "入库链路调试", group: "flows" },
  { id: DevPanelId.Count, label: "盘点链路调试", group: "flows" },
  { id: DevPanelId.Platform, label: "平台 / 店铺", group: "tools" },
];

type Props = {
  active: DevPanelId;
  onChange: (panel: DevPanelId) => void;
};

export const DevConsoleTabs: React.FC<Props> = ({ active, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={
              "rounded-md border px-3 py-1.5 text-xs " +
              (isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
