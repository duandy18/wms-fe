// src/features/admin/stores/StorePlatformAuthCard.tsx

import React from "react";
import type { StorePlatformAuthStatus } from "./types";
import { UI } from "./ui";

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

function renderStatusLabel(auth: StorePlatformAuthStatus | null, loading: boolean) {
  if (loading) {
    return <span className={UI.authStatusLoading}>加载中…</span>;
  }

  if (!auth) {
    return <span className={UI.authStatusNone}>未查询到授权信息</span>;
  }

  if (auth.auth_source === "NONE") {
    return <span className={UI.authStatusNone}>未授权</span>;
  }

  if (auth.auth_source === "MANUAL") {
    return <span className={UI.authStatusManual}>手工凭据（模拟环境）</span>;
  }

  return <span className={UI.authStatusOAuth}>OAuth 正式授权</span>;
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
    <section className={UI.authCard}>
      <div className={UI.authHead}>
        <div className="space-y-1">
          <div className={UI.authTitle}>平台授权状态</div>
          <div className={UI.authSub}>
            {detailPlatform}/{detailShopId}
            <span className={UI.authSubMeta}>store_id={detailStoreId}</span>
          </div>
        </div>

        <div>{renderStatusLabel(auth, loading)}</div>
      </div>

      <div className={UI.authBody}>
        <div>
          <span className={UI.authKey}>平台店铺编号（mall_id）:</span>
          {auth?.mall_id ?? "—"}
        </div>

        <div>
          <span className={UI.authKey}>Token 过期时间:</span>
          {renderExpires(auth)}
        </div>
      </div>

      <div className={UI.authActions}>
        <button type="button" className={UI.authBtn} disabled={!detailPlatform} onClick={onManualCredentialsClick}>
          录入 / 修改平台凭据
        </button>

        <button type="button" className={UI.authBtn} disabled={!detailPlatform} onClick={onOAuthClick}>
          去平台授权（OAuth）
        </button>

        <button type="button" className={UI.authBtn} disabled={!detailPlatform} onClick={onViewChannelInventory}>
          查看渠道库存
        </button>
      </div>
    </section>
  );
};

export default StorePlatformAuthCard;
