// src/features/admin/stores/StoreDetailPage.tsx

import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { StorePlatformAuthCard } from "./StorePlatformAuthCard";
import { StoreDefaultWarehouseCard } from "./StoreDefaultWarehouseCard";
import { StoreBindingsTable } from "./StoreBindingsTable";
import { StoreBindWarehouseForm } from "./StoreBindWarehouseForm";
import { useStoreDetailPresenter } from "./useStoreDetailPresenter";

import { UI } from "./detail/ui";
import StoreDetailHeader from "./detail/StoreDetailHeader";
import StoreMetaCard from "./detail/StoreMetaCard";
import CredentialsPanel from "./detail/CredentialsPanel";
import { useStoreMetaForm } from "./detail/useStoreMetaForm";

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  // 解析 id，但不要用来控制 Hook 是否调用
  const parsedId = storeId ? Number(storeId) : NaN;
  const invalidId = !storeId || Number.isNaN(parsedId);

  const p = useStoreDetailPresenter(Number.isNaN(parsedId) ? 0 : parsedId);

  // 简化：前端不再做 can("admin.stores")，交给后端接口权限控制
  const canWrite = true;

  const meta = useStoreMetaForm({ canWrite, detail: p.detail });

  if (invalidId) {
    return <div className="p-4 text-sm text-red-600">缺少 storeId 参数（或参数非法）</div>;
  }

  return (
    <div className={UI.page}>
      <StoreDetailHeader
        onBack={() => navigate(-1)}
        presenterError={p.error}
        metaError={meta.metaError}
        metaJustSaved={meta.metaJustSaved}
      />

      {p.credentialsOpen && p.detail ? (
        <CredentialsPanel
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
      ) : null}

      {p.loading && !p.detail ? (
        <div className={UI.loadingText}>加载中…</div>
      ) : !p.detail ? (
        <div className={UI.loadingText}>未找到店铺。</div>
      ) : (
        <>
          <StoreMetaCard
            canWrite={canWrite}
            storeId={p.detail.store_id}
            platform={p.detail.platform}
            shopId={p.detail.shop_id}
            name={meta.name}
            email={meta.email}
            contactName={meta.contactName}
            contactPhone={meta.contactPhone}
            saving={meta.savingMeta}
            justSaved={meta.metaJustSaved}
            onChangeName={meta.setName}
            onChangeEmail={meta.setEmail}
            onChangeContactName={meta.setContactName}
            onChangeContactPhone={meta.setContactPhone}
            onDirty={meta.markMetaDirty}
            onSubmit={meta.handleSaveMeta}
          />

          {/* 平台授权 Presenter */}
          <StorePlatformAuthCard
            detailPlatform={p.detail.platform}
            detailShopId={p.detail.shop_id}
            detailStoreId={p.detail.store_id}
            auth={p.platformAuth}
            loading={p.authLoading}
            onManualCredentialsClick={p.openCredentials}
            onOAuthClick={() => {
              // TODO: /oauth/{platform}/start
              console.log("oauth clicked");
            }}
            onViewChannelInventory={p.viewChannelInventory}
          />

          {/* 默认仓 Presenter */}
          <StoreDefaultWarehouseCard defaultWarehouseId={p.defaultWarehouseId} bindings={p.detail.bindings} />

          {/* 绑定列表 Presenter */}
          <StoreBindingsTable
            bindings={p.detail.bindings}
            canWrite={p.canWrite}
            saving={p.saving}
            onToggleTop={p.handleToggleTop}
            onDelete={p.handleDelete}
          />

          {/* 新增绑定 Presenter */}
          <StoreBindWarehouseForm canWrite={p.canWrite} saving={p.saving} onSubmit={p.handleBindSubmit} />
        </>
      )}
    </div>
  );
}
