// src/features/operations/inbound/manual/ManualReceiveHeader.tsx

import React from "react";

export const ManualReceiveHeader: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">采购单行收货（手工录入）</h2>
        <span className="text-[11px] text-slate-500">
          场景：整箱整托、不便扫码或供应商已给出清单时，可按采购单行直接录入本次收货数量。
          批次/日期建议在左侧明细里维护；最终校验以服务端 commit 规则为准。
        </span>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
        <div className="font-semibold">规则提示</div>
        <div className="mt-1">
          有保质期商品：服务端提交入库（commit）会要求“批次 +（生产/到期日期至少一项）”。<br />
          无保质期商品：允许日期为空，批次为空会自动归入 <span className="font-mono">NOEXP</span>。
        </div>
      </div>
    </>
  );
};
