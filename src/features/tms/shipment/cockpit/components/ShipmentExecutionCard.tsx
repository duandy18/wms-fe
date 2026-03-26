// src/features/tms/shipment/cockpit/components/ShipmentExecutionCard.tsx
//
// 分拆说明：
// - 本组件负责顺序卡 3：执行区。
// - 当前执行链已收口为包级执行：
//   1) 拉取运单号 -> ship_with_waybill
//   2) 打印面单 -> 仅在后端真实返回 print_data / template_url 时可用
// - 本轮不做 UI 美化，优先让真实执行链路跑通。

import React from "react";
import { UI } from "../ui";
import type { ShipmentPackagePlan } from "../useShipmentCockpitController";

type Props = {
  packageCount: number;
  waybillCreatedCount: number;
  printedCount: number;
  packages: ShipmentPackagePlan[];
  requestingWaybillByPackage: Record<number, boolean>;
  onRequestWaybill: (packageNo: number) => void;
  onPrintWaybill: (packageNo: number) => void;
};

const ShipmentExecutionCard: React.FC<Props> = ({
  packageCount,
  waybillCreatedCount,
  printedCount,
  packages,
  requestingWaybillByPackage,
  onRequestWaybill,
  onPrintWaybill,
}) => {
  return (
    <section className={UI.cardMuted}>
      <div className={UI.cardHeader}>
        <div className={UI.cardTitleWrap}>
          <span className={UI.stageNo}>3</span>
          <div>
            <h2 className={UI.h2}>执行区</h2>
            <div className={UI.helper}>按包裹执行拉单与打印，走真实 ship_with_waybill 链路</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className={UI.summaryBox}>
          <div className={UI.label}>包裹总数</div>
          <div className={`mt-2 text-2xl font-semibold text-slate-900 ${UI.mono}`}>
            {packageCount}
          </div>
        </div>

        <div className={UI.summaryBox}>
          <div className={UI.label}>已拉单数</div>
          <div className={`mt-2 text-2xl font-semibold text-slate-900 ${UI.mono}`}>
            {waybillCreatedCount}
          </div>
        </div>

        <div className={UI.summaryBox}>
          <div className={UI.label}>已打印数</div>
          <div className={`mt-2 text-2xl font-semibold text-slate-900 ${UI.mono}`}>
            {printedCount}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className={UI.tableWrap}>
          <div className={UI.tableScroll}>
            <table className={UI.table}>
              <thead className={UI.thead}>
                <tr>
                  <th className={UI.th}>包裹</th>
                  <th className={UI.th}>承运商</th>
                  <th className={UI.th}>运单号</th>
                  <th className={UI.th}>面单状态</th>
                  <th className={`${UI.th} text-center`}>操作</th>
                </tr>
              </thead>
              <tbody>
                {packages.length > 0 ? (
                  packages.map((pkg) => {
                    const requesting = Boolean(
                      requestingWaybillByPackage[pkg.packageNo],
                    );
                    const canRequestWaybill =
                      pkg.packageStatus === "已就绪" && !pkg.trackingNo;
                    const canPrint =
                      Boolean(pkg.templateUrl) &&
                      Boolean(pkg.printData) &&
                      pkg.printStatus !== "已打印";

                    return (
                      <tr key={pkg.packageNo} className={UI.tr}>
                        <td className={`${UI.td} ${UI.mono}`}>包裹 {pkg.packageNo}</td>
                        <td className={UI.td}>{pkg.carrierName || "未选择"}</td>
                        <td className={`${UI.td} ${UI.mono}`}>
                          {pkg.trackingNo || "未拉单"}
                        </td>
                        <td className={UI.td}>
                          {pkg.templateUrl && pkg.printData
                            ? "模板数据可打印"
                            : pkg.trackingNo
                              ? "后端未返回面单数据"
                              : "—"}
                        </td>
                        <td className={`${UI.td} text-center`}>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              className={pkg.trackingNo ? UI.btnPrimary : UI.btnSecondary}
                              onClick={() => onRequestWaybill(pkg.packageNo)}
                              disabled={requesting || !canRequestWaybill}
                            >
                              {pkg.trackingNo
                                ? "已拉单"
                                : requesting
                                  ? "拉取中..."
                                  : "拉取运单号"}
                            </button>

                            <button
                              type="button"
                              className={
                                pkg.printStatus === "已打印"
                                  ? UI.btnPrimary
                                  : UI.btnSecondary
                              }
                              onClick={() => onPrintWaybill(pkg.packageNo)}
                              disabled={!canPrint}
                            >
                              {pkg.printStatus === "已打印" ? "已打印" : "打印面单"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className={UI.tr}>
                    <td colSpan={5} className={`${UI.td} text-center text-slate-500`}>
                      当前暂无包裹，请先在上一张卡完成拆包与报价。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={UI.sectionNote}>
        执行入口已按后端真实合同切到包级 ship_with_waybill；当前若拉单成功后仍无法打印，说明后端尚未返回 print_data / template_url。
      </div>
    </section>
  );
};

export default ShipmentExecutionCard;
