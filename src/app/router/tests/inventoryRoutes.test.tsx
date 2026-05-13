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


    ShippingHandoffPage: page("ShippingHandoffPage mock view"),
    ShippingLedgerPage: page("ShippingLedgerPage mock view"),

    FinanceOverviewPage: page("FinanceOverviewPage mock view"),
    FinanceOrderSalesPage: page("FinanceOrderSalesPage mock view"),
    FinancePurchaseCostPage: page("FinancePurchaseCostPage mock view"),
    FinanceShippingCostPage: page("FinanceShippingCostPage mock view"),

    UsersManagePage: page("UsersManagePage mock view"),

    OmsOrderProjectionPage: page("OmsOrderProjectionPage mock view"),
    OmsLineProjectionPage: page("OmsLineProjectionPage mock view"),
    OmsComponentProjectionPage: page("OmsComponentProjectionPage mock view"),

    PmsItemProjectionPage: page("PmsItemProjectionPage mock view"),
    PmsSupplierProjectionPage: page("PmsSupplierProjectionPage mock view"),
    PmsUomProjectionPage: page("PmsUomProjectionPage mock view"),
    PmsSkuCodeProjectionPage: page("PmsSkuCodeProjectionPage mock view"),
    PmsBarcodeProjectionPage: page("PmsBarcodeProjectionPage mock view"),

    PurchaseOrdersPage: page("PurchaseOrdersPage mock view"),
    PurchaseOrderCreatePage: page("PurchaseOrderCreatePage mock view"),
    PurchaseOrderViewPage: page("PurchaseOrderViewPage mock view"),
    PurchaseReportsPage: page("PurchaseReportsPage mock view"),

    ReturnTaskDetailPage: page("ReturnTaskDetailPage mock view"),

    WarehousesListPage: page("WarehousesListPage mock view"),
    WarehouseCreatePage: page("WarehouseCreatePage mock view"),
    WarehouseDetailPage: page("WarehouseDetailPage mock view"),
    SuppliersListPage: page("SuppliersListPage mock view"),
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

  it("redirects /oms to OMS order projection", async () => {
    renderWithRoute("/oms");
    expect(await screen.findByText("OmsOrderProjectionPage mock view")).toBeInTheDocument();
  });

  it.each([
    ["/oms/order-projection", "OmsOrderProjectionPage mock view"],
    ["/oms/line-projection", "OmsLineProjectionPage mock view"],
    ["/oms/component-projection", "OmsComponentProjectionPage mock view"],
  ])("renders OMS projection page %s", async (route, expectedText) => {
    renderWithRoute(route);
    expect(await screen.findByText(expectedText)).toBeInTheDocument();
  });

  it("redirects /shipping-assist/handoffs to status tab route", async () => {
    renderWithRoute("/shipping-assist/handoffs");
    expect(
      await screen.findByText("ShippingHandoffPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders ShippingHandoffPage on /shipping-assist/handoffs/status", async () => {
    renderWithRoute("/shipping-assist/handoffs/status");
    expect(
      await screen.findByText("ShippingHandoffPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders ShippingHandoffPage on /shipping-assist/handoffs/payload", async () => {
    renderWithRoute("/shipping-assist/handoffs/payload");
    expect(
      await screen.findByText("ShippingHandoffPage mock view"),
    ).toBeInTheDocument();
  });

  it("renders ShippingLedgerPage on /shipping-assist/records", async () => {
    renderWithRoute("/shipping-assist/records");
    expect(
      await screen.findByText("ShippingLedgerPage mock view"),
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

  it.each([
    ["/pms/item-projection", "PmsItemProjectionPage mock view"],
    ["/pms/supplier-projection", "PmsSupplierProjectionPage mock view"],
    ["/pms/uom-projection", "PmsUomProjectionPage mock view"],
    ["/pms/sku-code-projection", "PmsSkuCodeProjectionPage mock view"],
    ["/pms/barcode-projection", "PmsBarcodeProjectionPage mock view"],
  ])("renders PMS projection page %s", async (route, expectedText) => {
    renderWithRoute(route);
    expect(await screen.findByText(expectedText)).toBeInTheDocument();
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
    "/print/shipping-label",
    "/outbound/ship",
    "/shipping-assist/shipping/quote",
    "/shipping-assist/shipping/quote/workbench",
    "/shipping-assist/settings/waybill",
    "/shipping-assist/shipping/records",
    "/shipping-assist/pricing/providers",
    "/shipping-assist/pricing/providers/1",
    "/shipping-assist/pricing/providers/new",
    "/shipping-assist/pricing/providers/1/edit",
    "/shipping-assist/pricing/bindings",
    "/shipping-assist/pricing/templates",
    "/shipping-assist/pricing/templates/1",
    "/shipping-assist/billing/items",
    "/shipping-assist/billing/reconciliation",
  ])("falls back to /inventory after retired WMS shipping route %s is removed", async (route) => {
    renderWithRoute(route);
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it.each([
    "/items",
    "/pms/brands",
    "/pms/categories",
    "/pms/item-attribute-defs",
    "/item-uoms",
    "/item-barcodes",
    "/items/sku-coding",
  ])("falls back to /inventory after retired PMS owner route %s is removed", async (route) => {
    renderWithRoute(route);
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it.each([
    "/orders",
    "/shops",
    "/platforms",
    "/platforms/1",
    "/shop-bundles",
    "/parsing",
    "/oms/fskus",
    "/oms/platform-code-mappings",
    "/oms/pdd",
    "/oms/pdd/platform-order-mirror",
    "/oms/pdd/code-mapping",
    "/oms/taobao",
    "/oms/taobao/platform-order-mirror",
    "/oms/taobao/code-mapping",
    "/oms/jd",
    "/oms/jd/platform-order-mirror",
    "/oms/jd/code-mapping",
    "/oms/fulfillment-projection",
    "/oms/fulfillment-projection/orders",
    "/oms/fulfillment-projection/lines",
    "/oms/fulfillment-projection/components",
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

  it("falls back to /inventory after old OMS fulfillment conversion route /oms/pdd/fulfillment-order-conversion is retired", async () => {
    renderWithRoute("/oms/pdd/fulfillment-order-conversion");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("falls back to /inventory after old OMS fulfillment conversion route /oms/taobao/fulfillment-order-conversion is retired", async () => {
    renderWithRoute("/oms/taobao/fulfillment-order-conversion");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("falls back to /inventory after old OMS fulfillment conversion route /oms/jd/fulfillment-order-conversion is retired", async () => {
    renderWithRoute("/oms/jd/fulfillment-order-conversion");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });

  it("falls back to /inventory for unknown route", async () => {
    renderWithRoute("/some/unknown/path");
    expect(await screen.findByText("InventoryPage mock view")).toBeInTheDocument();
  });
});
