// src/features/tms/shipment/cockpit/components/ShipmentOrdersQueueCard.tsx
//
// 分拆说明：
// - 本组件负责发运作业台顶部“订单队列表”卡片。
// - 第一轮只做静态展示，不接点击切换、不做筛选逻辑。
// - 后续可在不改页面骨架的前提下补充筛选、选中、高亮、自动下一单。

import React from "react";
import { UI } from "../ui";
import type { ShipmentQueueRow } from "../useShipmentCockpitController";

type Props = {
  rows: ShipmentQueueRow[];
  currentOrderId: number | null;
};

function badgeClass(
  value: ShipmentQueueRow["addressStatus"] | ShipmentQueueRow["planStatus"] | ShipmentQueueRow["executionStatus"],
): string {
  if (value === "异常") return `${UI.badgeBase} ${UI.badgeRed}`;
  if (value === "已完成" || value === "已计划" || value === "已打印") {
    return `${UI.badgeBase} ${UI.badgeGreen}`;
  }
  if (value === "未执行" || value === "待处理" || value === "待解析") {
    return `${UI.badgeBase} ${UI.badgeSlate}`;
  }
  if (value === "待确认" || value === "规划中") {
    return `${UI.badgeBase} ${UI.badgeAmber}`;
  }
  if (value === "已拉单") {
    return `${UI.badgeBase} ${UI.badgeBlue}`;
  }
  return `${UI.badgeBase} ${UI.badgeSlate}`;
}

const ShipmentOrdersQueueCard: React.FC<Props> = ({
  rows,
  currentOrderId,
}) => {
  return (
    <section className={UI.card}>
      <div className={UI.cardHeader}>
        <div className={UI.cardTitleWrap}>
          <span className={UI.stageNo}>0</span>
          <div>
            <h2 className={UI.h2}>订单队列表</h2>
            <div className={UI.helper}>拉取后的订单在这里逐单进入上方作业流处理</div>
          </div>
        </div>

        <div className={UI.btnGroup}>
          <button type="button" className={UI.btnSecondary} disabled>
            平台
          </button>
          <button type="button" className={UI.btnSecondary} disabled>
            店铺
          </button>
          <button type="button" className={UI.btnSecondary} disabled>
            只看未完成
          </button>
        </div>
      </div>

      <div className={UI.tableWrap}>
        <div className={UI.tableScroll}>
          <table className={UI.table}>
            <thead className={UI.thead}>
              <tr>
                <th className={UI.th}>当前</th>
                <th className={UI.th}>平台</th>
                <th className={UI.th}>店铺</th>
                <th className={UI.th}>订单号</th>
                <th className={UI.th}>收件人</th>
                <th className={UI.th}>地址状态</th>
                <th className={UI.th}>包裹数</th>
                <th className={UI.th}>计划状态</th>
                <th className={UI.th}>执行状态</th>
                <th className={UI.th}>下一步</th>
                <th className={UI.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isCurrent = row.orderId === currentOrderId;
                return (
                  <tr
                    key={row.orderId}
                    className={`${UI.tr} ${isCurrent ? "bg-sky-50/60" : ""}`}
                  >
                    <td className={UI.td}>
                      {isCurrent ? (
                        <span className={`${UI.badgeBase} ${UI.badgeBlue}`}>当前处理</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className={UI.td}>{row.platform}</td>
                    <td className={UI.td}>{row.shopName}</td>
                    <td className={`${UI.td} ${UI.mono}`}>{row.extOrderNo}</td>
                    <td className={UI.td}>{row.receiverName}</td>
                    <td className={UI.td}>
                      <span className={badgeClass(row.addressStatus)}>{row.addressStatus}</span>
                    </td>
                    <td className={`${UI.td} ${UI.mono}`}>{row.packageCount}</td>
                    <td className={UI.td}>
                      <span className={badgeClass(row.planStatus)}>{row.planStatus}</span>
                    </td>
                    <td className={UI.td}>
                      <span className={badgeClass(row.executionStatus)}>
                        {row.executionStatus}
                      </span>
                    </td>
                    <td className={UI.td}>{row.nextStep}</td>
                    <td className={UI.td}>
                      <button type="button" className={UI.btnSecondary} disabled>
                        处理
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={UI.sectionNote}>
        第一轮先固定表头和行结构，不接筛选、点击切换和自动流转。
      </div>
    </section>
  );
};

export default ShipmentOrdersQueueCard;
