// src/features/shipment/pages/ShipmentCockpitPage.tsx
//
// 发货 Shipment Cockpit（作业台）
// - 左：ShipmentInputPanel（订单 / 重量 / 地址 / 电子称 + prepare + 候选仓扫描 + 人工裁决）
// - 中：ShipmentOrderSummaryPanel（prepare 返回的真实订单摘要）
// - 右：ShipmentQuoteComparePanel（报价对比）

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "../cockpit/ui";

import ShipmentInputPanel from "../cockpit/components/ShipmentInputPanel";
import ShipmentOrderSummaryPanel from "../cockpit/components/ShipmentOrderSummaryPanel";
import ShipmentQuoteComparePanel from "../cockpit/components/ShipmentQuoteComparePanel";

import { useShipmentCockpitController } from "../cockpit/useShipmentCockpitController";

const ShipmentCockpitPage: React.FC = () => {
  const c = useShipmentCockpitController();

  return (
    <div className={UI.page}>
      <PageTitle title="发货" description="不可误操作的运输执行工作台" />

      {c.error && <div className={UI.errorBox}>{c.error}</div>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
        <ShipmentInputPanel
          orderRef={c.orderRef}
          onOrderRefChange={c.setOrderRef}
          preparing={c.preparing}
          onPrepare={c.handlePrepare}
          candidateWarehouses={c.candidateWarehouses}
          scanRows={c.scanRows}
          fulfillmentStatus={c.fulfillmentStatus}
          warehouseReason={c.warehouseReason}
          selectedWarehouseId={c.selectedWarehouseId}
          onSelectWarehouseId={c.setSelectedWarehouseId}
          weightKg={c.weightKg}
          onWeightChange={c.setWeightKg}
          packagingWeightKg={c.packagingWeightKg}
          onPackagingWeightChange={c.setPackagingWeightKg}
          province={c.province}
          city={c.city}
          district={c.district}
          onProvinceChange={c.setProvince}
          onCityChange={c.setCity}
          onDistrictChange={c.setDistrict}
          loadingCalc={c.loadingCalc}
          canCalc={c.canCalc}
          onCalc={c.handleCalc}
        />

        <ShipmentOrderSummaryPanel
          orderId={c.preparedOrderId}
          items={c.preparedItems}
          totalQty={c.preparedTotalQty}
          traceId={c.preparedTraceId}
          receiverName={c.receiverName}
          receiverPhone={c.receiverPhone}
          addressDetail={c.addressDetail}
          province={c.province}
          city={c.city}
          district={c.district}
          totalWeightKg={c.numericWeight}
          packagingWeightKg={c.numericPackagingWeight}
        />

        <section className={UI.card}>
          <h2 className={UI.h2}>报价对比</h2>

          <ShipmentQuoteComparePanel
            quotes={c.quotes}
            selectedSchemeId={c.selectedSchemeId}
            recommendedSchemeId={c.recommendedSchemeId}
            onSelect={c.setSelectedSchemeId}
          />

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            下一步：多包裹 / 拆单结构将在此处展开
          </div>

          <button
            type="button"
            className={`${UI.btnPrimary} mt-4 w-full`}
            disabled={!c.canConfirm}
            onClick={c.handleConfirmShip}
          >
            {c.confirming ? "提交中…" : "确认发货"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default ShipmentCockpitPage;
