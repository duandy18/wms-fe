// src/features/admin/stores/components/order-sim/StoreOrderSimSection.tsx

import React from "react";
import { StoreOrderCustomerSubmitCard } from "../StoreOrderCustomerSubmitCard";
import { StoreOrderIngestExecuteCard } from "../StoreOrderIngestExecuteCard";
import { StoreOrderMerchantInputsCard } from "../StoreOrderMerchantInputsCard";
import { useStoreOrderSimSectionModel } from "./useStoreOrderSimSectionModel";

export const StoreOrderSimSection: React.FC<{
  enabled: boolean;
  platform: string;
  shopId: string;
  storeId: number;
}> = ({ enabled, platform, shopId, storeId }) => {
  // ✅ Hook 必须无条件调用（不能放在 if return 之后）
  const m = useStoreOrderSimSectionModel({ enabled, storeId });

  // ✅ 非测试店铺：不渲染（但 hook 已按规则调用；且 enabled=false 不会触发任何请求）
  if (!enabled) return null;

  return (
    <div className="space-y-4">
      {m.merchantLoadError ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          商家清单加载失败：{m.merchantLoadError}
        </div>
      ) : null}

      {m.merchantLoading ? <div className="text-sm text-slate-500">商家清单加载中…</div> : null}

      <StoreOrderMerchantInputsCard
        rows={m.merchantRows}
        onChangeRows={m.setMerchantRows}
        onSave={m.saveMerchantLines}
        saving={m.merchantSaving}
        saveError={m.merchantSaveError}
        justSaved={m.merchantJustSaved}
        onValidLinesChange={m.setMerchantValidLines}
        filledCodeOptions={m.filledCodeOptions}
        optionsLoading={m.optionsLoading}
        optionsError={m.optionsError}
      />

      {m.cartLoadError ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          客户输入加载失败：{m.cartLoadError}
        </div>
      ) : null}

      {m.cartLoading ? <div className="text-sm text-slate-500">客户输入加载中…</div> : null}

      <StoreOrderCustomerSubmitCard
        platform={platform}
        shopId={shopId}
        storeId={storeId}
        model={m.sim}
        onSave={m.saveCart}
        saving={m.cartSaving}
        saveError={m.cartSaveError}
        justSaved={m.cartJustSaved}
      />

      <StoreOrderIngestExecuteCard platform={platform} shopId={shopId} storeId={storeId} model={m.sim} />

      <div className="text-xs text-slate-500">
        提示：商家卡=维护并保存可售卖清单（事实）；客户卡=输入并保存（工作区）；执行卡=调用 ingest 并展示最近一次结果。
      </div>
    </div>
  );
};
