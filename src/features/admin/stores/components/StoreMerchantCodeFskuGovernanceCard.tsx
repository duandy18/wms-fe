// src/features/admin/stores/components/StoreMerchantCodeFskuGovernanceCard.tsx

import React from "react";
import type { Platform } from "../../shop-bundles/types";
import { useStoreMerchantCodeFskuGovernance } from "./storeMerchantCodeGovernance/useStoreMerchantCodeFskuGovernance";
import { StoreMerchantCodeFskuGovernanceTable } from "./storeMerchantCodeGovernance/StoreMerchantCodeFskuGovernanceTable";

export const StoreMerchantCodeFskuGovernanceCard: React.FC<{
  storeId: number;
  platform: Platform;
  shopId: string;
  storeName: string;
  canWrite: boolean;
}> = (props) => {
  const { state, actions } = useStoreMerchantCodeFskuGovernance(props);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">店铺商品代码 ↔ 仓库代码（FSKU）绑定</div>
          <div className="mt-1 text-xs text-slate-600">目标：每个 FSKU 一行，默认店铺商品代码 = FSKU.code；勾选后可批量写入绑定事实。</div>
          <div className="mt-1 text-xs text-slate-500">
            当前店铺：{props.storeName}（{props.platform}/{props.shopId}｜store_id={props.storeId}）｜仅展示已发布 FSKU
          </div>
        </div>
      </div>

      {state.banner ? (
        <div
          className={
            state.banner.kind === "success"
              ? "mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800"
              : "mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
          }
        >
          {state.banner.message}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-500">提示：已绑定到本 FSKU 的行不可重复勾选。</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => actions.setCheckedAll(true)}
            disabled={state.loading || !state.fskus.length}
          >
            全选
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => actions.setCheckedAll(false)}
            disabled={state.loading || !state.fskus.length}
          >
            全不选
          </button>
          <button
            type="button"
            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            onClick={() => void actions.bindSelected()}
            disabled={state.loading || !state.selectedCount || !props.canWrite}
            title={!props.canWrite ? "无写权限" : ""}
          >
            批量绑定（{state.selectedCount}）
          </button>
        </div>
      </div>

      <StoreMerchantCodeFskuGovernanceTable
        fskus={state.fskus}
        rowState={state.rowState}
        currentByMerchantCode={state.currentByMerchantCode}
        loading={state.loading}
        canWrite={props.canWrite}
        onRowChecked={actions.setRowChecked}
        onMerchantCodeChange={actions.setRowMerchantCode}
        onToggleExpanded={actions.toggleExpanded}
        onBindOne={(f) => void actions.bindOne(f)}
        onCloseByMerchantCode={(mc) => void actions.closeCurrentByMerchantCode(mc)}
      />
    </div>
  );
};
