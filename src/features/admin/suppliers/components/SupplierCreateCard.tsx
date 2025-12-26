// src/features/admin/suppliers/components/SupplierCreateCard.tsx

import React from "react";
import { UI } from "../ui";

export const SupplierCreateCard: React.FC<{
  createError: string | null;
  creating: boolean;

  name: string;
  code: string;
  contactName: string;
  phone: string;
  email: string;
  wechat: string;

  onChangeName: (v: string) => void;
  onChangeCode: (v: string) => void;
  onChangeContactName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeWechat: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}> = ({
  createError,
  creating,
  name,
  code,
  contactName,
  phone,
  email,
  wechat,
  onChangeName,
  onChangeCode,
  onChangeContactName,
  onChangePhone,
  onChangeEmail,
  onChangeWechat,
  onSubmit,
}) => {
  return (
    <section className={UI.card}>
      <div className={UI.titleRow}>
        <h2 className={UI.h2}>新建供应商</h2>
        {createError ? <div className={UI.errorText}>{createError}</div> : null}
      </div>

      <form onSubmit={onSubmit} className={UI.formGrid}>
        <div className="flex flex-col">
          <label className={UI.label}>公司名称 *</label>
          <input className={UI.input} value={name} onChange={(e) => onChangeName(e.target.value)} placeholder="如：上海某某宠物食品有限公司" />
        </div>

        <div className="flex flex-col">
          <label className={UI.label}>编码</label>
          <input className={UI.input} value={code} onChange={(e) => onChangeCode(e.target.value)} placeholder="SUP-001" />
        </div>

        <div className="flex flex-col">
          <label className={UI.label}>联系人</label>
          <input className={UI.input} value={contactName} onChange={(e) => onChangeContactName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className={UI.label}>电话</label>
          <input className={UI.input} value={phone} onChange={(e) => onChangePhone(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className={UI.label}>电子邮件</label>
          <input className={UI.input} value={email} onChange={(e) => onChangeEmail(e.target.value)} placeholder="name@example.com" />
        </div>

        <div className="flex flex-col">
          <label className={UI.label}>微信号</label>
          <input className={UI.input} value={wechat} onChange={(e) => onChangeWechat(e.target.value)} />
        </div>

        <div className="flex items-end">
          <button type="submit" disabled={creating} className={UI.btnPrimary}>
            {creating ? "创建中…" : "创建供应商"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SupplierCreateCard;
