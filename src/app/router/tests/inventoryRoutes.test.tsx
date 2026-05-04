// src/app/router/tests/inventoryRoutes.test.tsx

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import AppRouter from "../index";

vi.mock("../../layout/AppLayout", () => ({
  __esModule: true,
  AppLayout: () => <Outlet />,
}));

vi.mock("../guards", () => ({
  __esModule: true,
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RequirePermission: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  ForbiddenPage: () => <div>ForbiddenPage mock view</div>,
  RouteLoading: () => <div>RouteLoading mock view</div>,
}));

vi.mock("../lazyPages", () => {
  const page = (name: string) => () => <div>{name}</div>;

  return {
    __esModule: true,

    LoginPage: page("LoginPage mock view"),
    ShippingLabelPrintPage: page("ShippingLabelPrintPage mock view"),

    InventoryPage: page("InventoryPage mock view"),
    InventoryLedgerPage: page("InventoryLedgerPage mock view"),

    InventoryAdjustmentSummaryPage: page(
      "InventoryAdjustmentSummaryPage mock view",
    ),
    InventoryCountPage: page("InventoryCountPage mock view"),
    InventoryInboundReversalPage: page(
      "InventoryInboundReversalPage mock view",
    ),
    InventoryOutboundReversalPage: page(
      "InventoryOutboundReversalPage mock view",
    ),

    InboundReceiptsSummaryPage: page("InboundReceiptsSummaryPage mock view"),
    InboundReceiptsPurchasePage: page("InboundReceiptsPurchasePage mock view"),
    InboundReceiptsManualPage: page("InboundReceiptsManualPage mock view"),

    ReceivingSummaryPage: page("ReceivingSummaryPage mock view"),
    ReceivingPurchasePage: page("ReceivingPurchasePage mock view"),
    ReceivingManualPage: page("ReceivingManualPage mock view"),
    ReceivingTaskPage: page("ReceivingTaskPage mock view"),

    OutboundSummaryPage: page("OutboundSummaryPage mock view"),
    OutboundOrderPage: page("OutboundOrderPage mock view"),
    OutboundManualDocsPage: page("OutboundManualDocsPage mock view"),
    OutboundManualPage: page("OutboundManualPage mock view"),
    OmsPddPlatformOrderMirrorPage: page("OmsPddPlatformOrderMirrorPage mock view"),
    OmsPddFskuMappingPage: page("OmsPddFskuMappingPage mock view"),
    OmsPddFulfillmentOrderConversionPage: page("OmsPddFulfillmentOrderConversionPage mock view"),
    OmsTaobaoPlatformOrderMirrorPage: page("OmsTaobaoPlatformOrderMirrorPage mock view"),
    OmsTaobaoFskuMappingPage: page("OmsTaobaoFskuMappingPage mock view"),
    OmsTaobaoFulfillmentOrderConversionPage: page("OmsTaobaoFulfillmentOrderConversionPage mock view"),
    OmsJdPlatformOrderMirrorPage: page("OmsJdPlatformOrderMirrorPage mock view"),
    OmsJdFskuMappingPage: page("OmsJdFskuMappingPage mock view"),
    OmsJdFulfillmentOrderConversionPage: page("OmsJdFulfillmentOrderConversionPage mock view"),

    AnalyticsPage: page("AnalyticsPage mock view"),

    ShipmentPreparePage: page("ShipmentPreparePage mock view"),
    ShipmentCockpitPage: page("ShipmentCockpitPage mock view"),
    PricingPage: page("PricingPage mock view"),
    TemplatesPage: page("TemplatesPage mock view"),
    TemplateWorkbenchPage: page("TemplateWorkbenchPage mock view"),
    ShippingLedgerPage: page("ShippingLedgerPage mock view"),
    BillingItemsPage: page("BillingItemsPage mock view"),
    ReconciliationPage: page("ReconciliationPage mock view"),

    FinanceOverviewPage: page("FinanceOverviewPage mock view"),
    FinanceOrderSalesPage: page("FinanceOrderSalesPage mock view"),
    FinancePurchaseCostPage: page("FinancePurchaseCostPage mock view"),
    FinanceShippingCostPage: page("FinanceShippingCostPage mock view"),

    UsersManagePage: page("UsersManagePage mock view"),

    PurchaseOrdersPage: page("PurchaseOrdersPage mock view"),
    PurchaseOrderCreatePage: page("PurchaseOrderCreatePage mock view"),
    PurchaseOrderViewPage: page("PurchaseOrderViewPage mock view"),
    PurchaseReportsPage: page("PurchaseReportsPage mock view"),

    ReturnTaskDetailPage: page("ReturnTaskDetailPage mock view"),

    WarehousesListPage: page("WarehousesListPage mock view"),
    WarehouseCreatePage: page("WarehouseCreatePage mock view"),
    WarehouseDetailPage: page("WarehouseDetailPage mock view"),

    ItemsPage: page("ItemsPage mock view"),
    ItemBarcodesPage: page("ItemBarcodesPage mock view"),
    PmsBrandsPage: page("PmsBrandsPage mock view"),
    PmsCategoriesPage: page("PmsCategoriesPage mock view"),
    PmsAttributeDefsPage: page("PmsAttributeDefsPage mock view"),
    PmsItemUomsPage: page("PmsItemUomsPage mock view"),
    SkuCodingGeneratorPage: page("SkuCodingGeneratorPage mock view"),
    PmsFskuRulesPage: page("PmsFskuRulesPage mock view"),
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
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("renders InventoryPage on /inventory", async () => {
    renderWithRoute("/inventory");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("renders InventoryLedgerPage on /inventory/ledger", async () => {
    renderWithRoute("/inventory/ledger");
    expect(
      await screen.findByText("InventoryLedgerPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InventoryAdjustmentSummaryPage on /inventory-adjustment", async () => {
    renderWithRoute("/inventory-adjustment");
    expect(
      await screen.findByText("InventoryAdjustmentSummaryPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InventoryCountPage on /inventory-adjustment/count", async () => {
    renderWithRoute("/inventory-adjustment/count");
    expect(await screen.findByText("InventoryCountPage mock view")).toBeInTheDocument();
  });

  it("renders InventoryInboundReversalPage on /inventory-adjustment/inbound-reversal", async () => {
    renderWithRoute("/inventory-adjustment/inbound-reversal");
    expect(
      await screen.findByText("InventoryInboundReversalPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InventoryOutboundReversalPage on /inventory-adjustment/outbound-reversal", async () => {
    renderWithRoute("/inventory-adjustment/outbound-reversal");
    expect(
      await screen.findByText("InventoryOutboundReversalPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InboundReceiptsSummaryPage on /inbound-receipts", async () => {
    renderWithRoute("/inbound-receipts");
    expect(
      await screen.findByText("InboundReceiptsSummaryPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InboundReceiptsPurchasePage on /inbound-receipts/purchase", async () => {
    renderWithRoute("/inbound-receipts/purchase");
    expect(
      await screen.findByText("InboundReceiptsPurchasePage mock view"),
    ).toBeInTheDocument();
  });

  it("renders InboundReceiptsManualPage on /inbound-receipts/manual", async () => {
    renderWithRoute("/inbound-receipts/manual");
    expect(
      await screen.findByText("InboundReceiptsManualPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders ReceivingSummaryPage on /receiving", async () => {
    renderWithRoute("/receiving");
    expect(
      await screen.findByText("ReceivingSummaryPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders ReceivingPurchasePage on /receiving/purchase", async () => {
    renderWithRoute("/receiving/purchase");
    expect(
      await screen.findByText("ReceivingPurchasePage mock view"),
    ).toBeInTheDocument();
  });

  it("renders ReceivingTaskPage on /receiving/IBR-0001", async () => {
    renderWithRoute("/receiving/IBR-0001");
    expect(
      await screen.findByText("ReceivingTaskPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OutboundSummaryPage on /outbound/summary", async () => {
    renderWithRoute("/outbound/summary");
    expect(
      await screen.findByText("OutboundSummaryPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OutboundOrderPage on /outbound/order", async () => {
    renderWithRoute("/outbound/order");
    expect(
      await screen.findByText("OutboundOrderPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OutboundManualDocsPage on /outbound/manual-docs", async () => {
    renderWithRoute("/outbound/manual-docs");
    expect(
      await screen.findByText("OutboundManualDocsPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OutboundManualPage on /outbound/manual", async () => {
    renderWithRoute("/outbound/manual");
    expect(
      await screen.findByText("OutboundManualPage mock view"),
    ).toBeInTheDocument();
  });

  it("redirects /oms to PDD platform mirror", async () => {
    renderWithRoute("/oms");
    expect(
      await screen.findByText("OmsPddPlatformOrderMirrorPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OmsPddPlatformOrderMirrorPage on /oms/pdd", async () => {
    renderWithRoute("/oms/pdd");
    expect(
      await screen.findByText("OmsPddPlatformOrderMirrorPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OmsPddPlatformOrderMirrorPage on /oms/pdd/platform-order-mirror", async () => {
    renderWithRoute("/oms/pdd/platform-order-mirror");
    expect(await screen.findByText("OmsPddPlatformOrderMirrorPage mock view")).toBeInTheDocument();
  });

  it("renders OmsPddFskuMappingPage on /oms/pdd/fsku-mapping", async () => {
    renderWithRoute("/oms/pdd/fsku-mapping");
    expect(await screen.findByText("OmsPddFskuMappingPage mock view")).toBeInTheDocument();
  });

  it("renders OmsPddFulfillmentOrderConversionPage on /oms/pdd/fulfillment-order-conversion", async () => {
    renderWithRoute("/oms/pdd/fulfillment-order-conversion");
    expect(await screen.findByText("OmsPddFulfillmentOrderConversionPage mock view")).toBeInTheDocument();
  });

  it("renders OmsTaobaoPlatformOrderMirrorPage on /oms/taobao", async () => {
    renderWithRoute("/oms/taobao");
    expect(
      await screen.findByText("OmsTaobaoPlatformOrderMirrorPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders OmsJdPlatformOrderMirrorPage on /oms/jd", async () => {
    renderWithRoute("/oms/jd");
    expect(
      await screen.findByText("OmsJdPlatformOrderMirrorPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders FinanceOverviewPage on /finance", async () => {
    renderWithRoute("/finance");
    expect(
      await screen.findByText("FinanceOverviewPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders FinanceOrderSalesPage on /finance/order-sales", async () => {
    renderWithRoute("/finance/order-sales");
    expect(
      await screen.findByText("FinanceOrderSalesPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders FinancePurchaseCostPage on /finance/purchase-costs", async () => {
    renderWithRoute("/finance/purchase-costs");
    expect(
      await screen.findByText("FinancePurchaseCostPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders FinanceShippingCostPage on /finance/shipping-costs", async () => {
    renderWithRoute("/finance/shipping-costs");
    expect(
      await screen.findByText("FinanceShippingCostPage mock view"),
    ).toBeInTheDocument();
  });

  it("redirects /outbound to /outbound/summary", async () => {
    renderWithRoute("/outbound");
    expect(
      await screen.findByText("OutboundSummaryPage mock view"),
    ).toBeInTheDocument();
  });

  it("falls back to /inventory after old /count route is retired", async () => {
    renderWithRoute("/count");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("falls back to /inventory after old /inbound-receipts/returns route is retired", async () => {
    renderWithRoute("/inbound-receipts/returns");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it.each([
    "/orders",
    "/shops",
    "/platforms",
    "/platforms/1",
    "/shop-bundles",
    "/parsing",
    "/oms/pdd/import",
    "/oms/taobao/import",
    "/oms/jd/import",
    "/oms/pdd/stores",
    "/oms/pdd/orders",
    "/oms/pdd/orders/1",
    "/oms/taobao/stores",
    "/oms/taobao/orders",
    "/oms/taobao/orders/1",
    "/oms/jd/stores",
    "/oms/jd/orders",
    "/oms/jd/orders/1",
  ])("falls back to /inventory after old platform route %s is retired", async (route) => {
    renderWithRoute(route);
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("renders PmsFskuRulesPage on /pms/fskus", async () => {
    renderWithRoute("/pms/fskus");
    expect(
      await screen.findByText("PmsFskuRulesPage mock view"),
    ).toBeInTheDocument();
  });

  it("falls back to /inventory for unknown route", async () => {
    renderWithRoute("/some/unknown/path");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });
});
