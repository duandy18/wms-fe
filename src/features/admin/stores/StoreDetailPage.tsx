// src/features/admin/stores/StoreDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";

import { StorePlatformAuthCard } from "./StorePlatformAuthCard";
import { StoreDefaultWarehouseCard } from "./StoreDefaultWarehouseCard";
import { StoreBindingsTable } from "./StoreBindingsTable";
import { StoreBindWarehouseForm } from "./StoreBindWarehouseForm";
import { useStoreDetailPresenter } from "./useStoreDetailPresenter";
import { updateStore } from "./api";

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  // 解析 id，但不要用来控制 Hook 是否调用
  const parsedId = storeId ? Number(storeId) : NaN;
  const invalidId = !storeId || Number.isNaN(parsedId);

  const p = useStoreDetailPresenter(Number.isNaN(parsedId) ? 0 : parsedId);

  // 简化：前端不再做 can("admin.stores")，交给后端接口权限控制
  const canWrite = true;

  // 主数据编辑字段
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaJustSaved, setMetaJustSaved] = useState(false);
  const [metaInitialized, setMetaInitialized] = useState(false);

  useEffect(() => {
    if (!p.detail || metaInitialized) return;
    setName(p.detail.name);
    setEmail(p.detail.email || "");
    setContactName(p.detail.contact_name || "");
    setContactPhone(p.detail.contact_phone || "");
    setMetaInitialized(true);
  }, [p.detail, metaInitialized]);

  function markMetaDirty() {
    if (metaJustSaved) setMetaJustSaved(false);
  }

  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!p.detail) return;
    if (!canWrite) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMetaError("店铺名称不能为空");
      return;
    }

    setSavingMeta(true);
    setMetaError(null);
    setMetaJustSaved(false);

    try {
      await updateStore(p.detail.store_id, {
        name: trimmedName,
        email: email.trim() || null,
        contact_name: contactName.trim() || null,
        contact_phone: contactPhone.trim() || null,
      });
      setMetaJustSaved(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "保存店铺信息失败";
      setMetaError(message);
    } finally {
      setSavingMeta(false);
    }
  }

  if (invalidId) {
    return (
      <div className="p-4 text-sm text-red-600">
        缺少 storeId 参数（或参数非法）
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <PageTitle title="商铺详情" description="平台商铺 · 仓库绑定关系" />

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

      {metaError && (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {metaError}
        </div>
      )}
      {metaJustSaved && !metaError && (
        <div className="rounded border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          店铺基础信息已保存。
        </div>
      )}

      {p.credentialsOpen && p.detail && (
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
      )}

      {p.loading && !p.detail ? (
        <div className="text-sm text-slate-500">加载中…</div>
      ) : !p.detail ? (
        <div className="text-sm text-slate-500">未找到店铺。</div>
      ) : (
        <>
          {/* 店铺基础信息编辑区 */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-base font-semibold text-slate-900">
              店铺基础信息
            </div>

            <div className="text-xs text-slate-500">
              ID: {p.detail.store_id} · {p.detail.platform}/
              {p.detail.shop_id}
            </div>

            {canWrite ? (
              <form
                className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2"
                onSubmit={handleSaveMeta}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">名称</label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="例如：PDD-CUST001 主店"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">
                    Email（可选）
                  </label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="例如 ops@xxx.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">
                    联系人（可选）
                  </label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="例如 张三"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">
                    联系电话（可选）
                  </label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="手机 / 座机 / 分机号"
                  />
                </div>

                <div className="flex items-center">
                  <button
                    type="submit"
                    disabled={savingMeta}
                    className="rounded-lg bg-slate-900 px-5 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {savingMeta
                      ? "保存中…"
                      : metaJustSaved
                      ? "已保存"
                      : "保存修改"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs text-slate-500">
                无编辑权限（admin.stores）
              </div>
            )}
          </section>

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
          <StoreDefaultWarehouseCard
            defaultWarehouseId={p.defaultWarehouseId}
            bindings={p.detail.bindings}
          />

          {/* 绑定列表 Presenter */}
          <StoreBindingsTable
            bindings={p.detail.bindings}
            canWrite={p.canWrite}
            saving={p.saving}
            onToggleTop={p.handleToggleTop}
            onDelete={p.handleDelete}
          />

          {/* 新增绑定 Presenter */}
          <StoreBindWarehouseForm
            canWrite={p.canWrite}
            saving={p.saving}
            onSubmit={p.handleBindSubmit}
          />
        </>
      )}
    </div>
  );
}

/**
 * 手工凭据编辑小卡片（子模块）
 */
type CredentialsPanelProps = {
  platform: string;
  shopId: string;
  storeId: number;
  token: string;
  error: string | null;
  saving: boolean;
  onChangeToken: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

const CredentialsPanel: React.FC<CredentialsPanelProps> = ({
  platform,
  shopId,
  storeId,
  token,
  error,
  saving,
  onChangeToken,
  onClose,
  onSubmit,
}) => {
  return (
    <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-amber-900">
            手工录入平台凭据（模拟环境）
          </div>
          <div className="text-xs text-amber-800">
            {platform}/{shopId}（store_id={storeId}）
          </div>
        </div>
        <button
          type="button"
          className="text-xs text-amber-800 underline"
          onClick={onClose}
          disabled={saving}
        >
          关闭
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-700">
          {error}
        </div>
      )}

      <form
        className="flex flex-col items-start gap-2 sm:flex-row sm:items-end"
        onSubmit={onSubmit}
      >
        <label className="w-full text-xs text-slate-700 sm:flex-1">
          access_token
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={token}
            onChange={(e) => onChangeToken(e.target.value)}
            placeholder="例如 PASS-XXXXXX"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {saving ? "保存中…" : "保存凭据"}
        </button>
      </form>
    </section>
  );
};
