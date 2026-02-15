// src/features/admin/stores/components/order-sim/execute/CustomerInfoCard.tsx

import React from "react";

export type CustomerInfo = {
  receiver_name: string;
  receiver_phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  zipcode: string;
};

export function CustomerInfoCard(props: { info: CustomerInfo }) {
  const { info } = props;

  const addrText = [info.province, info.city, info.district, info.detail].filter((x) => x.trim().length > 0).join(" ");

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="text-sm font-semibold text-slate-800">客户信息</div>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 text-xs text-slate-700">
        <div>
          <span className="text-slate-500">收货人：</span>
          <span className="font-semibold">{info.receiver_name || "—"}</span>
        </div>
        <div>
          <span className="text-slate-500">电话：</span>
          <span className="font-mono">{info.receiver_phone || "—"}</span>
        </div>
        <div className="md:col-span-2">
          <span className="text-slate-500">地址：</span>
          <span>
            {addrText || "—"}
            {info.zipcode ? <span className="ml-2 text-slate-500">（邮编 {info.zipcode}）</span> : null}
          </span>
        </div>
      </div>
    </div>
  );
}
