// src/features/admin/shipping-providers/scheme/flow/FlowSectionCard.tsx

import React from "react";

export type FlowSectionCardProps = {
  title: string;
  desc?: string;
  children: React.ReactNode;
};

export const FlowSectionCard: React.FC<FlowSectionCardProps> = ({ title, desc, children }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {desc ? <div className="mt-1 text-sm text-slate-600">{desc}</div> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default FlowSectionCard;
