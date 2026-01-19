// src/features/admin/stores/components/StoreCredentialsPanel.tsx
import React from "react";

export type StoreCredentialsPanelProps = {
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

export const StoreCredentialsPanel: React.FC<StoreCredentialsPanelProps> = ({
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
