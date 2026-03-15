// src/features/tms/providers/pages/edit/ProviderBasicInfoCard.tsx
import React from "react";
import { UI } from "../../ui";
import { ProviderForm, type EditProviderFormState } from "../../edit-provider/ProviderForm";

export const ProviderBasicInfoCard: React.FC<{
  canWrite: boolean;
  busy: boolean;
  isCreate: boolean;

  state: EditProviderFormState;
  onChange: (patch: Partial<EditProviderFormState>) => void;

  savingProvider: boolean;
  onSaveProvider: () => void | Promise<void>;

  error?: string | null;
  ok?: string | null;
}> = ({
  canWrite,
  busy,
  isCreate,
  state,
  onChange,
  savingProvider,
  onSaveProvider,
  error,
  ok,
}) => {
  return (
    <section className={UI.card}>
      <div className={`${UI.h2} font-semibold text-slate-900`}>基础信息</div>

      {error ? <div className={`mt-3 ${UI.error}`}>{error}</div> : null}
      {ok ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{ok}</div>
      ) : null}

      <ProviderForm
        state={state}
        busy={busy || !canWrite}
        isCreate={isCreate}
        savingProvider={savingProvider}
        onChange={onChange}
        onSaveProvider={onSaveProvider}
      />
    </section>
  );
};

export default ProviderBasicInfoCard;
