// src/features/operations/ship/ShipCockpitPage.tsx
//
// 发货 Ship Cockpit（作业台）
// - 左：ShipInputPanel（订单 / 重量 / 地址 / 电子称 + prepare + 候选仓扫描 + 人工裁决）
// - 中：OrderSummaryPanel（订单明细占位）
// - 右：QuoteComparePanel（报价对比）
//
// Phase 4.x：
// - calc/recommend/confirm 必须在“起运仓事实”边界内执行
// - prepare-from-order：不预设、不兜底；返回候选仓 + 扫描报告（OK/缺货），作业员人工选择

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import { ShipInputPanel } from "./components/ShipInputPanel";
import { OrderSummaryPanel } from "./components/OrderSummaryPanel";
import { QuoteComparePanel } from "./components/QuoteComparePanel";

import { useShipCockpitController } from "./cockpit/useShipCockpitController";

const ShipCockpitPage: React.FC = () => {
  const c = useShipCockpitController();

  return (
    <div className={UI.page}>
      <PageTitle title="发货" description="不可误操作的发货决策中枢" />

      {c.error && <div className={UI.errorBox}>{c.error}</div>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
        {/* 左 */}
        <ShipInputPanel
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

        {/* 中 */}
        <OrderSummaryPanel
          province={c.province}
          city={c.city}
          district={c.district}
          totalWeightKg={c.numericWeight}
          packagingWeightKg={c.numericPackagingWeight}
        />

        {/* 右 */}
        <section className={UI.card}>
          <h2 className={UI.h2}>报价对比</h2>

          <QuoteComparePanel
            quotes={c.quotes}
            selectedSchemeId={c.selectedSchemeId}
            recommendedSchemeId={c.recommendedSchemeId}
            onSelect={c.setSelectedSchemeId}
          />

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            Phase 4：多包裹 / 拆单结构将在此处展开
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

export default ShipCockpitPage;
