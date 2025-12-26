// src/features/admin/stores/detail/StoreMetaCard.tsx

import React from "react";
import { UI } from "./ui";

export const StoreMetaCard: React.FC<{
  canWrite: boolean;

  storeId: number;
  platform: string;
  shopId: string;

  name: string;
  email: string;
  contactName: string;
  contactPhone: string;

  saving: boolean;
  justSaved: boolean;

  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeContactName: (v: string) => void;
  onChangeContactPhone: (v: string) => void;

  onDirty: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}> = ({
  canWrite,
  storeId,
  platform,
  shopId,
  name,
  email,
  contactName,
  contactPhone,
  saving,
  justSaved,
  onChangeName,
  onChangeEmail,
  onChangeContactName,
  onChangeContactPhone,
  onDirty,
  onSubmit,
}) => {
  return (
    <section className={UI.card}>
      <div className={UI.cardTitle}>店铺基础信息</div>

      <div className={UI.metaLine}>
        ID: {storeId} · {platform}/{shopId}
      </div>

      {canWrite ? (
        <form className={UI.formGrid} onSubmit={onSubmit}>
          <div className={UI.field}>
            <label className={UI.label}>名称</label>
            <input
              className={UI.input}
              value={name}
              onChange={(e) => {
                onChangeName(e.target.value);
                onDirty();
              }}
              placeholder="例如：PDD-CUST001 主店"
            />
          </div>

          <div className={UI.field}>
            <label className={UI.label}>Email（可选）</label>
            <input
              className={UI.input}
              value={email}
              onChange={(e) => {
                onChangeEmail(e.target.value);
                onDirty();
              }}
              placeholder="例如 ops@xxx.com"
            />
          </div>

          <div className={UI.field}>
            <label className={UI.label}>联系人（可选）</label>
            <input
              className={UI.input}
              value={contactName}
              onChange={(e) => {
                onChangeContactName(e.target.value);
                onDirty();
              }}
              placeholder="例如 张三"
            />
          </div>

          <div className={UI.field}>
            <label className={UI.label}>联系电话（可选）</label>
            <input
              className={UI.input}
              value={contactPhone}
              onChange={(e) => {
                onChangeContactPhone(e.target.value);
                onDirty();
              }}
              placeholder="手机 / 座机 / 分机号"
            />
          </div>

          <div className="flex items-center">
            <button type="submit" disabled={saving} className={UI.btnPrimary}>
              {saving ? "保存中…" : justSaved ? "已保存" : "保存修改"}
            </button>
          </div>
        </form>
      ) : (
        <div className={UI.metaLine}>无编辑权限（admin.stores）</div>
      )}
    </section>
  );
};

export default StoreMetaCard;
