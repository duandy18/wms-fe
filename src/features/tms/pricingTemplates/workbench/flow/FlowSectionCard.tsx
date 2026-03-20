// src/features/tms/pricingTemplates/workbench/flow/FlowSectionCard.tsx

import React from "react";
import { UI } from "../ui";

type Props = {
  title: string;
  hint?: string;
  children: React.ReactNode;
};

const FlowSectionCard: React.FC<Props> = ({ title, hint, children }) => {
  return (
    <section className={UI.card}>
      <div className="mb-3">
        <div className={UI.panelTitle}>{title}</div>
        {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
      </div>
      {children}
    </section>
  );
};

export default FlowSectionCard;
