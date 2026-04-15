// src/app/router/AppRouter.inventoryRoutes.test.tsx

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import AppRouter from "./index";

vi.mock("../layout/AppLayout", () => ({
  __esModule: true,
  AppLayout: () => <Outlet />,
}));

vi.mock("./guards", () => ({
  __esModule: true,
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RequirePermission: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ForbiddenPage: () => <div>ForbiddenPage mock view</div>,
  RouteLoading: () => <div>RouteLoading mock view</div>,
}));

vi.mock("./lazyPages", () => {
  const page = (name: string) => () => <div>{name}</div>;

  return {
    __esModule: true,

    LoginPage: page("LoginPage mock view"),
    ShippingLabelPrintPage: page("ShippingLabelPrintPage mock view"),

    InventoryPage: page("InventoryPage mock view"),
    InventoryLedgerPage: page("InventoryLedgerPage mock view"),

    InboundCockpitPage: page("InboundCockpitPage mock view"),
    CountCockpitPage: page("CountCockpitPage mock view"),
    PickTasksCockpitPage: page("PickTasksCockpitPage mock view"),
    InternalOutboundPage: page("InternalOutboundPage mock view"),
    OutboundDashboardPage: page("OutboundDashboardPage mock view"),

    AnalyticsPage: page("AnalyticsPage mock view"),

    PddStoresPage: page("PddStoresPage mock view"),
    PddOrdersPage: page("PddOrdersPage mock view"),
    PddOrderDetailPage: page("PddOrderDetailPage mock view"),
    TaobaoStoresPage: page("TaobaoStoresPage mock view"),
    TaobaoOrdersPage: page("TaobaoOrdersPage mock view"),
    TaobaoOrderDetailPage: page("TaobaoOrderDetailPage mock view"),
    JdStoresPage: page("JdStoresPage mock view"),
    JdOrdersPage: page("JdOrdersPage mock view"),
    JdOrderDetailPage: page("JdOrderDetailPage mock view"),

    ShipmentPreparePage: page("ShipmentPreparePage mock view"),
    ShipmentCockpitPage: page("ShipmentCockpitPage mock view"),
    PricingPage: page("PricingPage mock view"),
    TemplatesPage: page("TemplatesPage mock view"),
    TemplateWorkbenchPage: page("TemplateWorkbenchPage mock view"),
    TransportReportsPage: page("TransportReportsPage mock view"),
    ShippingLedgerPage: page("ShippingLedgerPage mock view"),
    BillingItemsPage: page("BillingItemsPage mock view"),
    ReconciliationPage: page("ReconciliationPage mock view"),

    FinanceOverviewPage: page("FinanceOverviewPage mock view"),
    FinanceShopPage: page("FinanceShopPage mock view"),
    FinanceSkuPage: page("FinanceSkuPage mock view"),
    FinanceOrderUnitPage: page("FinanceOrderUnitPage mock view"),

    UsersManagePage: page("UsersManagePage mock view"),

    PurchaseOrdersPage: page("PurchaseOrdersPage mock view"),
    PurchaseOrderCreatePage: page("PurchaseOrderCreatePage mock view"),
    PurchaseOrderViewPage: page("PurchaseOrderViewPage mock view"),

    PurchaseOrderCreateV2Page: page("PurchaseOrderCreateV2Page mock view"),
    ReceiveTaskDetailPage: page("ReceiveTaskDetailPage mock view"),
    ReturnTaskDetailPage: page("ReturnTaskDetailPage mock view"),

    WarehousesListPage: page("WarehousesListPage mock view"),
    WarehouseCreatePage: page("WarehouseCreatePage mock view"),
    WarehouseDetailPage: page("WarehouseDetailPage mock view"),

    ItemsPage: page("ItemsPage mock view"),
    ItemBarcodesPage: page("ItemBarcodesPage mock view"),
    SuppliersListPage: page("SuppliersListPage mock view"),

    ShippingProvidersListPage: page("ShippingProvidersListPage mock view"),
    ElectronicWaybillConfigPage: page("ElectronicWaybillConfigPage mock view"),
    ShippingProviderEditPage: page("ShippingProviderEditPage mock view"),
  };
});

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe("AppRouter inventory routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders InventoryPage on root index", async () => {
    renderWithRoute("/");
    expect(
      await screen.findByText("InventoryPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InventoryPage on /inventory", async () => {
    renderWithRoute("/inventory");
    expect(
      await screen.findByText("InventoryPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InventoryLedgerPage on /inventory/ledger", async () => {
    renderWithRoute("/inventory/ledger");
    expect(
      await screen.findByText("InventoryLedgerPage mock view"),
    ).toBeInTheDocument();
  });

  it("falls back to /inventory for unknown route", async () => {
    renderWithRoute("/some/unknown/path");
    expect(
      await screen.findByText("InventoryPage mock view"),
    ).toBeInTheDocument();
  });
});
