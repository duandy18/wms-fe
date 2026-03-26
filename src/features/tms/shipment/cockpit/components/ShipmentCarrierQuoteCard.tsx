// src/features/tms/shipment/cockpit/components/ShipmentCarrierQuoteCard.tsx
//
// 分拆说明：
// - 本组件负责顺序卡 3：报价与承运商。
// - 第一轮展示每个包裹的当前报价状态、当前承运商和候选列表占位。
// - 不做推荐逻辑，不出现“推荐方案”语义。

import React from "react";
import { UI } from "../ui";
import type {
  ShipmentPackagePlan,
  ShipmentQuoteCandidate,
} from "../useShipmentCockpitController";

type Props = {
  packages: ShipmentPackagePlan[];
  quoteCandidates: ShipmentQuoteCandidate[];
};

function groupByPackageNo(
  candidates: ShipmentQuoteCandidate[],
): Record<number, ShipmentQuoteCandidate[]> {
  return candidates.reduce<Record<number, ShipmentQuoteCandidate[]>>((acc, item) => {
    if (!acc[item.packageNo]) {
      acc[item.packageNo] = [];
    }
    acc[item.packageNo].push(item);
    return acc;
  }, {});
}

const ShipmentCarrierQuoteCard: React.FC<Props> = ({
  packages,
  quoteCandidates,
}) => {
  const grouped = groupByPackageNo(quoteCandidates);

  return (
    <section className={UI.card}>
      <div className={UI.cardHeader}>
        <div className={UI.cardTitleWrap}>
          <span className={UI.stageNo}>3</span>
          <div>
            <h2 className={UI.h2}>报价与承运商</h2>
            <div className={UI.helper}>每个包裹独立获取候选报价，再由人工选择承运商</div>
          </div>
        </div>

        <div className={UI.btnGroup}>
          <button type="button" className={UI.btnSecondary} disabled>
            获取报价
          </button>
          <button type="button" className={UI.btnSecondary} disabled>
            查看候选
          </button>
          <button type="button" className={UI.btnSecondary} disabled>
            重新报价
          </button>
        </div>
      </div>

      <div className={UI.packageList}>
        {packages.map((pkg) => {
          const candidates = grouped[pkg.packageNo] ?? [];
          return (
            <div key={pkg.packageNo} className={UI.packageCard}>
              <div className={UI.packageHeader}>
                <div className="flex items-center gap-3">
                  <h3 className={UI.h3}>包裹 {pkg.packageNo}</h3>
                  <span className={`${UI.badgeBase} ${UI.badgeSlate}`}>
                    {pkg.quoteStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className={UI.summaryBox}>
                  <div className={UI.summaryList}>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>当前报价</span>
                      <span className={`${UI.kvValue} ${UI.mono}`}>
                        {pkg.quoteAmount ? `￥${pkg.quoteAmount}` : "—"}
                      </span>
                    </div>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>承运商</span>
                      <span className={UI.kvValue}>{pkg.carrierName || "未选择"}</span>
                    </div>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>包裹状态</span>
                      <span className={UI.kvValue}>{pkg.packageStatus}</span>
                    </div>
                  </div>
                </div>

                <div className={UI.tableWrap}>
                  <div className={UI.tableScroll}>
                    <table className={UI.table}>
                      <thead className={UI.thead}>
                        <tr>
                          <th className={UI.th}>承运商</th>
                          <th className={UI.th}>服务</th>
                          <th className={UI.th}>价格</th>
                          <th className={UI.th}>时效</th>
                          <th className={UI.th}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.length > 0 ? (
                          candidates.map((item, idx) => (
                            <tr key={`${item.packageNo}-${item.carrierName}-${idx}`} className={UI.tr}>
                              <td className={UI.td}>{item.carrierName}</td>
                              <td className={UI.td}>{item.serviceName}</td>
                              <td className={`${UI.td} ${UI.mono}`}>￥{item.amount}</td>
                              <td className={UI.td}>{item.etaText}</td>
                              <td className={UI.td}>
                                <button type="button" className={UI.btnSecondary} disabled>
                                  选择
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className={UI.tr}>
                            <td colSpan={5} className={`${UI.td} text-center text-slate-500`}>
                              暂无候选报价
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={UI.sectionNote}>
        第一轮不做候选弹窗和选择联动，只固定报价区结构与候选列表展示方式。
      </div>
    </section>
  );
};

export default ShipmentCarrierQuoteCard;
