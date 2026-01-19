// src/features/admin/stores/StoreDetailPage.tsx

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";

import { StorePlatformAuthCard } from "./StorePlatformAuthCard";
import { useStoreDetailPresenter } from "./useStoreDetailPresenter";

import { useStoreMetaForm } from "./hooks/useStoreMetaForm";
import { StoreMetaCard } from "./components/StoreMetaCard";
import { StoreCredentialsPanel } from "./components/StoreCredentialsPanel";

import { StoreSkusCard } from "./store-skus/StoreSkusCard";

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const parsedId = storeId ? Number(storeId) : NaN;
  const invalidId = !storeId || Number.isNaN(parsedId);

  const p = useStoreDetailPresenter(Number.isNaN(parsedId) ? 0 : parsedId);

  const meta = useStoreMetaForm({
    detail: p.detail
      ? {
          store_id: p.detail.store_id,
          platform: p.detail.platform,
          shop_id: p.detail.shop_id,
          name: p.detail.name,
          email: p.detail.email,
          contact_name: p.detail.contact_name,
          contact_phone: p.detail.contact_phone,
        }
      : null,
    canWrite: p.canWrite,
  });

  if (invalidId) {
    return <div className="p-4 text-sm text-red-600">缺少 storeId 参数（或参数非法）</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <PageTitle title="商铺详情" description="以 SKU 为中心的履约配置" />

      <button
        type="button"
        className="text-sm text-sky-700 underline"
        onClick={() => navigate(-1)}
      >
        ← 返回商铺管理
      </button>

      {p.error && (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {p.error}
        </div>
      )}

      {meta.metaError && (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {meta.metaError}
        </div>
      )}
      {meta.metaJustSaved && !meta.metaError && (
        <div className="rounded border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          店铺基础信息已保存。
        </div>
      )}

      {p.credentialsOpen && p.detail && (
        <StoreCredentialsPanel
          platform={p.detail.platform}
          shopId={p.detail.shop_id}
          storeId={p.detail.store_id}
          token={p.credentialsToken}
          error={p.credentialsError}
          saving={p.credentialsSaving}
          onChangeToken={p.setCredentialsToken}
          onClose={p.closeCredentials}
          onSubmit={p.submitCredentials}
        />
      )}

      {p.loading && !p.detail ? (
        <div className="text-sm text-slate-500">加载中…</div>
      ) : !p.detail ? (
        <div className="text-sm text-slate-500">未找到店铺。</div>
      ) : (
        <>
          {/* 1) 基础信息 */}
          <StoreMetaCard
            detail={{
              store_id: p.detail.store_id,
              platform: p.detail.platform,
              shop_id: p.detail.shop_id,
              name: p.detail.name,
              email: p.detail.email,
              contact_name: p.detail.contact_name,
              contact_phone: p.detail.contact_phone,
            }}
            canWrite={p.canWrite}
            name={meta.name}
            setName={meta.setName}
            email={meta.email}
            setEmail={meta.setEmail}
            contactName={meta.contactName}
            setContactName={meta.setContactName}
            contactPhone={meta.contactPhone}
            setContactPhone={meta.setContactPhone}
            savingMeta={meta.savingMeta}
            metaJustSaved={meta.metaJustSaved}
            onDirty={meta.markDirty}
            onSubmit={meta.save}
          />

          {/* 2) 主线：商铺 SKU（卖哪些 SKU + 每个 SKU 的履约仓） */}
          <StoreSkusCard
            canWrite={p.canWrite}
            store={{
              store_id: p.detail.store_id,
              platform: p.detail.platform,
              shop_id: p.detail.shop_id,
            }}
          />

          {/* 3) 平台授权（常用，但不抢主线） */}
          <StorePlatformAuthCard
            detailPlatform={p.detail.platform}
            detailShopId={p.detail.shop_id}
            detailStoreId={p.detail.store_id}
            auth={p.platformAuth}
            loading={p.authLoading}
            onManualCredentialsClick={p.openCredentials}
            onOAuthClick={() => console.log("oauth clicked")}
            onViewChannelInventory={p.viewChannelInventory}
          />
        </>
      )}
    </div>
  );
}
