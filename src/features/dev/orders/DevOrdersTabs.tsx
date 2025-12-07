// src/features/dev/orders/DevOrdersTabs.tsx
import React from "react";

type Props = {
  active: "flow" | "scenarios" | "tools";
  onChange: (v: "flow" | "scenarios" | "tools") => void;
};

export const DevOrdersTabs: React.FC<Props> = ({ active, onChange }) => {
  const tabs = [
    { id: "flow", label: "订单链路（Flow）" },
    { id: "scenarios", label: "调试场景（Scenarios）" },
    { id: "tools", label: "工具（Tools）" },
  ] as const;

  return (
    <div className="flex gap-2 border-b border-slate-200 pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={
            "rounded-t-md px-3 py-1 text-xs " +
            (active === t.id
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200")
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
