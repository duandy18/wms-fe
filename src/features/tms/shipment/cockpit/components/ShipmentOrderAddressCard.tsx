// src/features/tms/shipment/cockpit/components/ShipmentOrderAddressCard.tsx
//
// 分拆说明：
// - 本组件负责顺序卡 1：订单与地址。
// - 当前页面语义已收口为“地址核对”而不是“TMS 内解析 / 人工修正”。
// - 正确流程：
//   1) 核对地址
//   2) 地址正确则写入发运准备表的地址状态
//   3) 地址有问题则返回 OMS 处理
// - 当前已接真实“核对地址正确”动作。
// - “返回 OMS”仍保持占位，不在本轮展开。

import React from "react";
import { UI } from "../ui";
import type { ShipmentWorkbenchOrder } from "../useShipmentCockpitController";

type Props = {
  order: ShipmentWorkbenchOrder;
  confirmingAddress: boolean;
  successMessage: string | null;
  onConfirmAddress: () => void;
};

function addressBadgeClass(status: ShipmentWorkbenchOrder["addressStatus"]): string {
  if (status === "异常") return `${UI.badgeBase} ${UI.badgeRed}`;
  if (status === "已完成") return `${UI.badgeBase} ${UI.badgeGreen}`;
  if (status === "待确认") return `${UI.badgeBase} ${UI.badgeAmber}`;
  return `${UI.badgeBase} ${UI.badgeSlate}`;
}

const ShipmentOrderAddressCard: React.FC<Props> = ({
  order,
  confirmingAddress,
  successMessage,
  onConfirmAddress,
}) => {
  const parsedAddress = [
    order.parsedProvince,
    order.parsedCity,
    order.parsedDistrict,
    order.parsedAddressDetail,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={UI.card}>
      <div className={UI.cardHeader}>
        <div className={UI.cardTitleWrap}>
          <span className={UI.stageNo}>1</span>
          <div>
            <h2 className={UI.h2}>订单与地址</h2>
            <div className={UI.helper}>
              先核对订单基础信息和地址结果；地址正确才可进入后续发货作业。
            </div>
          </div>
        </div>

        <div className={UI.btnGroup}>
          <button
            type="button"
            className={UI.btnPrimary}
            onClick={onConfirmAddress}
            disabled={confirmingAddress || order.addressStatus === "已完成"}
          >
            {order.addressStatus === "已完成"
              ? "地址已确认"
              : confirmingAddress
                ? "确认中..."
                : "核对地址正确"}
          </button>
          <button type="button" className={UI.btnSecondary} disabled>
            返回 OMS
          </button>
        </div>
      </div>

      {successMessage ? (
        <div className="mb-3 whitespace-pre-line rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className={UI.summaryGrid}>
        <div className={UI.summaryBox}>
          <div className={UI.summaryList}>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>订单号</span>
              <span className={`${UI.kvValue} ${UI.mono}`}>{order.extOrderNo}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>平台</span>
              <span className={UI.kvValue}>{order.platform}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>店铺</span>
              <span className={UI.kvValue}>{order.shopName}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>下单时间</span>
              <span className={`${UI.kvValue} ${UI.mono}`}>{order.createdAt}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>收件人</span>
              <span className={UI.kvValue}>{order.receiverName}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>手机号</span>
              <span className={`${UI.kvValue} ${UI.mono}`}>{order.receiverPhone}</span>
            </div>
          </div>
        </div>

        <div className={UI.summaryBox}>
          <div className={UI.summaryList}>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>原始地址</span>
              <span className={UI.kvValue}>{order.rawAddress}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>解析结果</span>
              <span className={UI.kvValue}>{parsedAddress || "—"}</span>
            </div>
            <div className={UI.kvRow}>
              <span className={UI.kvLabel}>地址状态</span>
              <span className={UI.kvValue}>
                <span className={addressBadgeClass(order.addressStatus)}>
                  {order.addressStatus}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={UI.sectionNote}>
        地址核对正确后，应写入发运准备表地址状态；如地址有问题，不在 TMS 内修改，统一返回 OMS 处理。
      </div>
    </section>
  );
};

export default ShipmentOrderAddressCard;
