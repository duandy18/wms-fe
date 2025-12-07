// src/features/admin/stores/StorePlatformAuthCard.tsx

import React from "react";
import type { StorePlatformAuthStatus } from "./types";

type Props = {
  detailPlatform: string;
  detailShopId: string;
  detailStoreId: number;
  auth: StorePlatformAuthStatus | null;
  loading: boolean;
  onManualCredentialsClick?: () => void;
  onOAuthClick?: () => void;
  onViewChannelInventory?: () => void;
};

function renderStatusLabel(
  auth: StorePlatformAuthStatus | null,
  loading: boolean,
) {
  if (loading) {
    return (
      <span className="text-base text-slate-500 font-medium">
        加载中…
      </span>
    );
  }

  if (!auth) {
    return (
      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-base font-medium">
        未查询到授权信息
      </span>
    );
  }

  if (auth.auth_source === "NONE") {
    return (
      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-base font-medium">
        未授权
      </span>
    );
  }

  if (auth.auth_source === "MANUAL") {
    return (
      <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-base font-medium border border-amber-300">
        手工凭据（模拟环境）
      </span>
    );
  }

  return (
    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-base font-medium border border-emerald-300">
      OAuth 正式授权
    </span>
  );
}

function renderExpires(auth: StorePlatformAuthStatus | null) {
  if (!auth?.expires_at) return "—";
  return new Date(auth.expires_at).toLocaleString();
}

export const StorePlatformAuthCard: React.FC<Props> = ({
  detailPlatform,
  detailShopId,
  detailStoreId,
  auth,
  loading,
  onManualCredentialsClick,
  onOAuthClick,
  onViewChannelInventory,
}) => {
  return (
    <section className="bg-white border-2 border-slate-300 rounded-2xl p-6 space-y-4 shadow-sm">
      {/* 标题行 */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="text-lg font-bold text-slate-900">
            平台授权状态
          </div>
          <div className="text-base text-slate-700 font-medium">
            {detailPlatform}/{detailShopId}
            <span className="text-slate-500 text-sm ml-2">
              store_id={detailStoreId}
            </span>
          </div>
        </div>

        <div>{renderStatusLabel(auth, loading)}</div>
      </div>

      {/* 详情内容 */}
      <div className="text-base text-slate-700 space-y-2">
        <div>
          <span className="text-slate-500 mr-2">平台店铺编号（mall_id）:</span>
          {auth?.mall_id ?? "—"}
        </div>

        <div>
          <span className="text-slate-500 mr-2">Token 过期时间:</span>
          {renderExpires(auth)}
        </div>
      </div>

      {/* 操作按钮组 */}
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-400 text-base text-slate-800 hover:bg-slate-100"
          disabled={!detailPlatform}
          onClick={onManualCredentialsClick}
        >
          录入 / 修改平台凭据
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-400 text-base text-slate-800 hover:bg-slate-100"
          disabled={!detailPlatform}
          onClick={onOAuthClick}
        >
          去平台授权（OAuth）
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-400 text-base text-slate-800 hover:bg-slate-100"
          disabled={!detailPlatform}
          onClick={onViewChannelInventory}
        >
          查看渠道库存
        </button>
      </div>
    </section>
  );
};
