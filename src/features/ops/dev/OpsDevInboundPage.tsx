// src/features/ops/dev/OpsDevInboundPage.tsx
import React from "react";
import { InboundDevPanel } from "../../dev/inbound/InboundDevPanel";

const OpsDevInboundPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-4">
        <InboundDevPanel />
      </section>
    </div>
  );
};

export default OpsDevInboundPage;
