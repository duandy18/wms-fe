// src/features/admin/stores/StoreDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";

import { StorePlatformAuthCard } from "./StorePlatformAuthCard";
import { StoreDefaultWarehouseCard } from "./StoreDefaultWarehouseCard";
import { StoreBindingsTable } from "./StoreBindingsTable";
import { StoreBindWarehouseForm } from "./StoreBindWarehouseForm";
import { useStoreDetailPresenter } from "./useStoreDetailPresenter";
import { useAuth } from "../../../app/auth/useAuth";
import { updateStore } from "./api";

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canWrite = can("admin.stores");

  // 解析 id，但不要用来控制 Hook 是否调用
  const parsedId = storeId ? Number(storeId) : NaN;
  const invalidId = !storeId || Number.isNaN(parsedId);

  // Presenter 一律调用，避免 Hooks 条件执行
  // 对于非法 id，只是 presenter 返回的 detail 会是空/报错状态
  const p = useStoreDetailPresenter(Number.isNaN(parsedId) ? 0 : parsedId);

  // 主数据编辑字段
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaJustSaved, setMetaJustSaved] = useState(false);
  const [metaInitialized, setMetaInitialized] = useState(false);

  // 首次加载 detail 后，同步一份到本地表单状态
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

  // 如果路由本身就没带 storeId，直接报参数错误
  if (invalidId) {
    return (
      <div className="p-4 text-sm text-red-600">
        缺少 storeId 参数（或参数非法）
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <PageTitle title="商铺详情" description="平台商铺 · 仓库绑定关系" />

      {/* 返回商铺管理 */}
      <button
        type="button"
        className="text-sm text-sky-700 underline"
        onClick={() => navigate(-1)}
      >
        ← 返回商铺管理
      </button>

      {/* 顶层错误（绑定、平台授权等） */}
      {p.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {p.error}
        </div>
      )}

      {/* 店铺主数据编辑错误 & 提示 */}
      {metaError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {metaError}
        </div>
      )}
      {metaJustSaved && !metaError && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-3 py-1">
          店铺基础信息已保存。
        </div>
      )}

      {/* 手工凭据小卡片（内部环境用） */}
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
          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="text-base font-semibold text-slate-900">
              店铺基础信息
            </div>

            <div className="text-xs text-slate-500">
              ID: {p.detail.store_id} · {p.detail.platform}/{p.detail.shop_id}
            </div>

            {canWrite ? (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                onSubmit={handleSaveMeta}
              >
                {/* 名称 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">名称</label>
                  <input
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="例如：PDD-CUST001 主店"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">
                    Email（可选）
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="例如 ops@xxx.com"
                  />
                </div>

                {/* 联系人 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">
                    联系人（可选）
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      markMetaDirty();
                    }}
                    placeholder="例如 张三"
                  />
                </div>

                {/* 联系电话 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">
                    联系电话（可选）
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 text-sm"
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
                    className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
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
              // TODO：/oauth/{platform}/start
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
    <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center gap-2">
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
        <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </div>
      )}

      <form
        className="flex flex-col sm:flex-row gap-2 items-start sm:items-end"
        onSubmit={onSubmit}
      >
        <label className="text-xs text-slate-700 w-full sm:flex-1">
          access_token
          <input
            className="mt-1 border border-slate-300 rounded px-2 py-1 text-sm w-full"
            value={token}
            onChange={(e) => onChangeToken(e.target.value)}
            placeholder="例如 PASS-XXXXXX"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
        >
          {saving ? "保存中…" : "保存凭据"}
        </button>
      </form>
    </section>
  );
};
