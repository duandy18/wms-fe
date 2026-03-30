import React from "react";

const PddOrdersPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">拼多多订单台账</h1>
        <p className="text-sm text-slate-500">
          基于 pdd_orders / pdd_order_items 展示拼多多订单事实与解析结果。
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        待接入拼多多订单列表与详情。
      </div>
    </div>
  );
};

export default PddOrdersPage;
