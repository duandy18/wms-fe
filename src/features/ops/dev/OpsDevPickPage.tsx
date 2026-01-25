// src/features/ops/dev/OpsDevPickPage.tsx
import React from "react";
import { PickDevPanel } from "../../dev/pick-tasks/PickDevPanel";

const OpsDevPickPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-4">
        <PickDevPanel />
      </section>
    </div>
  );
};

export default OpsDevPickPage;
