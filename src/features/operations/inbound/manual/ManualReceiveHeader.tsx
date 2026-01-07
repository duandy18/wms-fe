// src/features/operations/inbound/manual/ManualReceiveHeader.tsx

import React from "react";

export const ManualReceiveHeader: React.FC = () => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700">
      <div className="font-medium">采购手工收货</div>
      <div className="text-[11px] text-slate-500">
        场景：整箱整托、不便扫码或供应商已给出清单时，可按采购单行直接录入本次收货数量。
      </div>
    </div>
  );
};
