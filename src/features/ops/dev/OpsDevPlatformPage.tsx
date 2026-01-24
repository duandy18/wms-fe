// src/features/ops/dev/OpsDevPlatformPage.tsx
import React from "react";
import { PlatformDevPanel } from "../../dev/platform/PlatformDevPanel";

const OpsDevPlatformPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-4">
        <PlatformDevPanel />
      </section>
    </div>
  );
};

export default OpsDevPlatformPage;
