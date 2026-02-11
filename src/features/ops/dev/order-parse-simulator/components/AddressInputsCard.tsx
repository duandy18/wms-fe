// src/features/ops/dev/order-parse-simulator/components/AddressInputsCard.tsx

import React from "react";

export type OrderAddrIn = {
  receiver_name: string | null;
  receiver_phone: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  detail: string | null;
  zipcode: string | null;
};

function setOpt(v: string): string | null {
  const s = v.trim();
  return s ? s : null;
}

export function AddressInputsCard(props: { value: OrderAddrIn; onChange: (v: OrderAddrIn) => void }) {
  const { value, onChange } = props;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-lg font-semibold text-slate-900">订单地址（可选）</div>
      <div className="text-sm text-slate-600 mt-1">
        地址不影响 filled_code 解析，但会影响履约状态（例如省份缺失会导致 FULFILLMENT_BLOCKED）。
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={() =>
            onChange({
              receiver_name: "正常地址",
              receiver_phone: "13800000002",
              province: "河北省",
              city: "廊坊市",
              district: "广阳区",
              detail: "银河北路 88 号",
              zipcode: null,
            })
          }
        >
          正常地址模板
        </button>

        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={() =>
            onChange({
              receiver_name: "缺省测试",
              receiver_phone: "13800000001",
              province: null,
              city: "廊坊市",
              district: "广阳区",
              detail: "测试缺省省份",
              zipcode: null,
            })
          }
        >
          缺省省份模板（province=null）
        </button>

        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={() =>
            onChange({
              receiver_name: null,
              receiver_phone: null,
              province: null,
              city: null,
              district: null,
              detail: null,
              zipcode: null,
            })
          }
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="text-sm text-slate-700">
          收件人
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={value.receiver_name ?? ""}
            onChange={(e) => onChange({ ...value, receiver_name: setOpt(e.target.value) })}
            placeholder="可空"
          />
        </label>

        <label className="text-sm text-slate-700">
          电话
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono"
            value={value.receiver_phone ?? ""}
            onChange={(e) => onChange({ ...value, receiver_phone: setOpt(e.target.value) })}
            placeholder="可空"
          />
        </label>

        <label className="text-sm text-slate-700">
          省（province）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={value.province ?? ""}
            onChange={(e) => onChange({ ...value, province: setOpt(e.target.value) })}
            placeholder="可空（留空 = null）"
          />
        </label>

        <label className="text-sm text-slate-700">
          市（city）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={value.city ?? ""}
            onChange={(e) => onChange({ ...value, city: setOpt(e.target.value) })}
            placeholder="可空（留空 = null）"
          />
        </label>

        <label className="text-sm text-slate-700">
          区（district）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={value.district ?? ""}
            onChange={(e) => onChange({ ...value, district: setOpt(e.target.value) })}
            placeholder="可空（留空 = null）"
          />
        </label>

        <label className="text-sm text-slate-700">
          邮编（zipcode）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono"
            value={value.zipcode ?? ""}
            onChange={(e) => onChange({ ...value, zipcode: setOpt(e.target.value) })}
            placeholder="可空"
          />
        </label>

        <label className="text-sm text-slate-700 col-span-2">
          详细地址（detail）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={value.detail ?? ""}
            onChange={(e) => onChange({ ...value, detail: setOpt(e.target.value) })}
            placeholder="可空（留空 = null）"
          />
        </label>
      </div>
    </div>
  );
}
