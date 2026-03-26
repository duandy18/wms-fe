// src/features/tms/shipment/pages/ShipmentCockpitPage.tsx
//
// 分拆说明：
// - 本页从旧的“三列执行台”改为“单列顺序式发运作业台”。
// - 页面当前负责装配以下顺序卡片：
//   1) 订单与地址
//   2) 订单拆包与报价
//   3) 执行区
// - 顶部“订单队列表”已移除：发货作业页收口为“单订单作业台”，
//   订单汇总与进入作业的职责统一留在发运准备页。
// - 原“报价与承运商”已并入“订单拆包与报价”大卡，按包裹完成：
//   重量录入 / 发货仓选择 / 算价 / 候选报价查看 / 承运商选择。
// - 当前页已改为接真实 controller，不再使用静态 mock。

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import { UI } from "../cockpit/ui";

import ShipmentOrderAddressCard from "../cockpit/components/ShipmentOrderAddressCard";
import ShipmentPackagePlanCard from "../cockpit/components/ShipmentPackagePlanCard";
import ShipmentExecutionCard from "../cockpit/components/ShipmentExecutionCard";

import { useShipmentCockpitController } from "../cockpit/useShipmentCockpitController";

const ShipmentCockpitPage: React.FC = () => {
  const c = useShipmentCockpitController();

  return (
    <div className={UI.page}>
      <PageTitle title="发货作业" description="单订单发运作业台" />

      {c.error && <div className={UI.errorBox}>{c.error}</div>}

      {c.loading ? (
        <div className={UI.card}>
          <div className={UI.helper}>正在加载发货作业数据...</div>
        </div>
      ) : null}

      <div className={UI.stageStack}>
        <ShipmentOrderAddressCard
          order={c.currentOrder}
          confirmingAddress={c.confirmingAddress}
          successMessage={c.addressSuccessMessage}
          onConfirmAddress={() => void c.confirmAddress()}
        />

        <ShipmentPackagePlanCard
          warehouseName={c.currentOrder.warehouseName}
          packageCount={c.packageCount}
          packages={c.packages}
          quoteCandidates={c.quoteCandidates}
          creatingPackage={c.creatingPackage}
          quotingByPackage={c.quotingByPackage}
          confirmingByPackage={c.confirmingByPackage}
          savingByPackage={c.savingByPackage}
          packageActionMessageByPackage={c.packageActionMessageByPackage}
          onCreatePackage={() => void c.createPackage()}
          onUpdatePackage={(packageNo, payload) =>
            void c.updatePackage(packageNo, payload)
          }
          onQuotePackage={(packageNo) => void c.quotePackage(packageNo)}
          onConfirmQuote={(packageNo, providerId) =>
            void c.confirmPackageQuote(packageNo, providerId)
          }
        />

        <ShipmentExecutionCard
          packageCount={c.executionSummary.packageCount}
          waybillCreatedCount={c.executionSummary.waybillCreatedCount}
          printedCount={c.executionSummary.printedCount}
          packages={c.packages}
          requestingWaybillByPackage={c.requestingWaybillByPackage}
          onRequestWaybill={(packageNo) => void c.requestWaybill(packageNo)}
          onPrintWaybill={(packageNo) => void c.printWaybill(packageNo)}
        />
      </div>
    </div>
  );
};

export default ShipmentCockpitPage;
