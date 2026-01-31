// src/features/admin/shipping-providers/scheme/surcharges/SurchargesPanel.tsx

import React, { useState } from "react";
import type { PricingSchemeDetail, PricingSchemeSurcharge } from "../../api";
import { SurchargeCreateForm } from "./SurchargeCreateForm";
import { SurchargeList } from "./SurchargeList";
import { UI } from "../ui";

function toErrMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return "请求失败";
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  let timer: number | null = null;
  const t = new Promise<T>((_resolve, reject) => {
    timer = window.setTimeout(() => reject(new Error(msg)), ms);
  });
  return Promise.race([p, t]).finally(() => {
    if (timer !== null) window.clearTimeout(timer);
  });
}

export const SurchargesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  onError: (msg: string) => void;

  onCreate: (payload: {
    name: string;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }) => Promise<void>;

  onPatch: (
    surchargeId: number,
    payload: Partial<{
      name: string;
      active: boolean;
      condition_json: Record<string, unknown>;
      amount_json: Record<string, unknown>;
    }>,
  ) => Promise<void>;

  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
}> = ({ detail, disabled, onError, onCreate, onPatch, onToggle, onDelete }) => {
  const [listOpen, setListOpen] = useState(true);

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const flashOkLocal = (msg: string) => {
    setOkMsg(msg);
    window.setTimeout(() => setOkMsg(null), 2200);
  };

  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-4">
      {okMsg ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{okMsg}</div>
      ) : null}

      {/* ✅ 仅保留：规则附加费创建/编辑（不再维护“省/市 upsert”旧路径） */}
      <SurchargeCreateForm
        schemeId={detail.id}
        existingSurcharges={detail.surcharges ?? []}
        disabled={disabled || busy}
        onCreate={async (payload) => {
          try {
            setBusy(true);
            await withTimeout(onCreate(payload), 8000, "写入超时：请检查后端服务/网络，再重试");
            flashOkLocal("已创建附加费规则");
            setListOpen(true);
          } catch (e) {
            onError(toErrMsg(e));
          } finally {
            setBusy(false);
          }
        }}
        onPatch={async (surchargeId, payload) => {
          try {
            setBusy(true);
            await withTimeout(onPatch(surchargeId, payload), 8000, "写入超时：请检查后端服务/网络，再重试");
            flashOkLocal("已保存附加费规则");
            setListOpen(true);
          } catch (e) {
            onError(toErrMsg(e));
          } finally {
            setBusy(false);
          }
        }}
        onError={onError}
      />

      <div className={UI.cardTight}>
        <div className="flex items-start justify-between gap-3">
          <div className={UI.sectionTitle}>已写入规则</div>

          <button type="button" className={UI.btnNeutralSm} disabled={disabled || busy} onClick={() => setListOpen((v) => !v)}>
            {listOpen ? "折叠" : "展开"}
          </button>
        </div>

        {listOpen ? (
          <div className="mt-3">
            <SurchargeList
              list={detail.surcharges ?? []}
              disabled={disabled || busy}
              onToggle={async (s) => {
                try {
                  setBusy(true);
                  await withTimeout(onToggle(s), 8000, "写入超时：请检查后端服务/网络，再重试");
                  flashOkLocal("已更新附加费状态");
                  setListOpen(true);
                } catch (e) {
                  onError(toErrMsg(e));
                } finally {
                  setBusy(false);
                }
              }}
              onDelete={async (s) => {
                try {
                  setBusy(true);
                  await withTimeout(onDelete(s), 8000, "写入超时：请检查后端服务/网络，再重试");
                  flashOkLocal("已删除附加费规则");
                  setListOpen(true);
                } catch (e) {
                  onError(toErrMsg(e));
                } finally {
                  setBusy(false);
                }
              }}
              onPatchAmount={async (s, amt) => {
                try {
                  setBusy(true);
                  await withTimeout(
                    onPatch(s.id, { amount_json: { kind: "flat", amount: amt } }),
                    8000,
                    "写入超时：请检查后端服务/网络，再重试",
                  );
                  flashOkLocal("已保存金额");
                  setListOpen(true);
                } catch (e) {
                  onError(toErrMsg(e));
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
