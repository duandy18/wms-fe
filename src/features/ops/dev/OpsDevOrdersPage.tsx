// src/features/ops/dev/OpsDevOrdersPage.tsx
import React from "react";
import { OrdersDevPanel } from "../../dev/orders/OrdersDevPanel";

const OpsDevOrdersPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-4">
        <OrdersDevPanel />
      </section>
    </div>
  );
};

export default OpsDevOrdersPage;
