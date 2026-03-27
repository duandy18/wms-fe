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
  oauthStarting?: boolean;
  oauthError?: string | null;
};

function renderStatusLabel(auth: StorePlatformAuthStatus | null, loading: boolean) {
  if (loading) {
    return <span className="text-base font-medium text-slate-500">加载中…</span>;
  }

  if (!auth) {
    return (
      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-base font-medium text-slate-600">
        未查询到授权信息
      </span>
    );
  }

  if (auth.auth_source === "NONE") {
    return (
      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-base font-medium text-slate-600">
        未授权
      </span>
    );
  }

  if (auth.auth_source === "MANUAL") {
    return (
      <span className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-base font-medium text-amber-800">
        已授权（手工录入）
      </span>
    );
  }

  return (
    <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-base font-medium text-emerald-800">
      已授权（平台授权）
    </span>
  );
}

function renderExpires(auth: StorePlatformAuthStatus | null) {
  if (!auth?.expires_at) return "—";
  return new Date(auth.expires_at).toLocaleString();
}

function renderAuthSourceText(auth: StorePlatformAuthStatus | null) {
  if (!auth) return "—";
  if (auth.auth_source === "NONE") return "未授权";
  if (auth.auth_source === "MANUAL") return "手工录入";
  return "平台授权";
}

export const StorePlatformAuthCard: React.FC<Props> = ({
  detailPlatform,
  detailShopId,
  detailStoreId,
  auth,
  loading,
  onManualCredentialsClick,
  onOAuthClick,
  oauthStarting,
  oauthError,
}) => {
  const oauthEnabled = !!onOAuthClick;

  return (
    <section className="space-y-4 rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-lg font-bold text-slate-900">平台授权状态</div>
          <div className="text-base font-medium text-slate-700">
            {detailPlatform}/{detailShopId}
            <span className="ml-2 text-sm text-slate-500">（商铺编号：{detailStoreId}）</span>
          </div>
          <div className="text-xs text-slate-500">用于读取平台侧数据。</div>
        </div>

        <div>{renderStatusLabel(auth, loading)}</div>
      </div>

      <div className="space-y-2 text-base text-slate-700">
        <div>
          <span className="mr-2 text-slate-500">授权来源:</span>
          {renderAuthSourceText(auth)}
        </div>

        <div>
          <span className="mr-2 text-slate-500">平台侧标识:</span>
          {auth?.mall_id ?? "—"}
        </div>

        <div>
          <span className="mr-2 text-slate-500">授权到期时间:</span>
          {renderExpires(auth)}
        </div>
      </div>

      {oauthError ? (
        <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {oauthError}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          disabled={!detailPlatform}
          onClick={onManualCredentialsClick}
        >
          录入 / 修改授权信息
        </button>

        {oauthEnabled ? (
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            disabled={!detailPlatform || !!oauthStarting}
            onClick={onOAuthClick}
          >
            {oauthStarting ? "跳转中…" : "前往平台授权"}
          </button>
        ) : null}
      </div>
    </section>
  );
};
