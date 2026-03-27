// src/features/admin/stores/components/StoreMetaCard.tsx
import React from "react";
import type { StoreMetaDetail } from "../hooks/useStoreMetaForm";

export const StoreMetaCard: React.FC<{
  detail: StoreMetaDetail;
  canWrite: boolean;

  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;

  savingMeta: boolean;
  metaJustSaved: boolean;

  onDirty: () => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  detail,
  canWrite,
  name,
  setName,
  email,
  setEmail,
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  savingMeta,
  metaJustSaved,
  onDirty,
  onSubmit,
}) => {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-base font-semibold text-slate-900">店铺基础信息</div>

      <div className="text-xs text-slate-500">
        ID: {detail.store_id} · {detail.platform}/{detail.shop_id}
      </div>

      {canWrite ? (
        <form
          className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">名称</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                onDirty();
              }}
              placeholder="例如：PDD-CUST001 主店"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Email（可选）</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                onDirty();
              }}
              placeholder="例如 ops@xxx.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">联系人（可选）</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={contactName}
              onChange={(e) => {
                setContactName(e.target.value);
                onDirty();
              }}
              placeholder="例如 张三"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">联系电话（可选）</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
                onDirty();
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
              {savingMeta ? "保存中…" : metaJustSaved ? "已保存" : "保存修改"}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-xs text-slate-500">无编辑权限（admin.stores）</div>
      )}
    </section>
  );
};
