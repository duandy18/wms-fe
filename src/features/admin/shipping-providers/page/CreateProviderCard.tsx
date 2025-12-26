// src/features/admin/shipping-providers/page/CreateProviderCard.tsx

import React from "react";
import { UI } from "../ui";

export type CreateProviderCardProps = {
  createError: string | null;
  creating: boolean;

  name: string;
  code: string;

  setName: (v: string) => void;
  setCode: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
};

export const CreateProviderCard: React.FC<CreateProviderCardProps> = ({
  createError,
  creating,
  name,
  code,
  setName,
  setCode,
  onSubmit,
}) => {
  return (
    <section className={UI.card}>
      <div className={UI.cardHeader}>
        <h2 className={`${UI.h2} font-semibold text-slate-900`}>关联物流与快递公司</h2>
        {createError ? <div className={UI.error}>{createError}</div> : null}
      </div>

      <form onSubmit={onSubmit} className={UI.createProviderGrid}>
        <div className={UI.field}>
          <label className={UI.label}>公司名称 *</label>
          <input className={UI.input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className={UI.field}>
          <label className={UI.label}>编码</label>
          <input className={UI.inputMono} value={code} onChange={(e) => setCode(e.target.value)} />
        </div>

        <div className="flex items-end">
          <button type="submit" disabled={creating} className={UI.btnPrimary}>
            {creating ? "关联中…" : "关联"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateProviderCard;
