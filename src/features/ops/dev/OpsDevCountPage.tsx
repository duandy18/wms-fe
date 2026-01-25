// src/features/ops/dev/OpsDevCountPage.tsx
import React from "react";
import { CountDevPanel } from "../../dev/count/CountDevPanel";

const OpsDevCountPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-4">
        <CountDevPanel />
      </section>
    </div>
  );
};

export default OpsDevCountPage;
