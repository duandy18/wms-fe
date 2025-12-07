// src/features/inventory/outbound-dashboard/TabsBar.tsx
import React from "react";
import { cn } from "../../../lib/utils";
import { TAB_LABELS, type TabId } from "./types";

type TabsBarProps = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
};

export const TabsBar: React.FC<TabsBarProps> = ({ activeTab, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-1">
      {TAB_LABELS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-1.5 text-base font-semibold rounded-full border transition-colors shadow-sm",
              isActive
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
