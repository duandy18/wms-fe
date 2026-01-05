// src/features/operations/inbound/InboundTabs.tsx

import React from "react";
import type { InboundTabKey } from "./inboundTabs";
import { INBOUND_TABS } from "./inboundTabs";

export const InboundTabs: React.FC<{
  value: InboundTabKey;
  onChange: (v: InboundTabKey) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {INBOUND_TABS.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={
              "rounded-full border px-3 py-1 text-sm " +
              (active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
