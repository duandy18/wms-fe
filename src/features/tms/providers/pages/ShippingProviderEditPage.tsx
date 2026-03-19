// src/features/tms/providers/pages/ShippingProviderEditPage.tsx
//
// 快递网点配置页（唯一业务容器）
// - 页面只负责编排（Orchestrator）
// - 状态/取数：useShippingProviderEditModel
// - UI：拆成 ProviderBasicInfoCard / ContactsSectionCard
//
// 当前页定位：
// - 这是“快递网点”业务的主容器，不再承载服务关系与运价配置。
// - 列表页只负责进入这里；本页只维护网点主数据。
// - 页面内统一维护：
//   1) 基础信息
//   2) 联系人
//
// 结构收口裁决：
// - 网点编辑页只保留“基础信息 / 联系人”
// - “仓库绑定 / 运价方案”从本页移除
// - 服务关系统一收敛到 Pricing 页维护
//
// 真相优先：
// - shipping_provider 本体不承载 warehouse 绑定事实
// - 仓库服务关系由 Pricing 页对应能力负责维护
// - 本页不再提供任何 workbench / 方案配置入口

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageTitle from "../../../../components/ui/PageTitle";
import { UI } from "../ui";

import { useAuth } from "../../../../shared/useAuth";

import type { EditProviderFormState } from "../edit-provider/ProviderForm";
import type { ShippingProvider } from "../api/types";

import { createShippingProvider, updateShippingProvider } from "../api/providers";

import { useShippingProviderEditModel } from "./edit/useShippingProviderEditModel";
import { ProviderBasicInfoCard } from "./edit/ProviderBasicInfoCard";
import { ContactsSectionCard } from "./edit/ContactsSectionCard";

function toErrMsg(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

const ShippingProviderEditPage: React.FC = () => {
  const nav = useNavigate();
  const { providerId } = useParams<{ providerId?: string }>();

  const pidNum = providerId ? Number(providerId) : NaN;
  const safePid = Number.isFinite(pidNum) && pidNum > 0 ? pidNum : null;
  const isCreate = !safePid;

  const { can } = useAuth();
  const canWrite = can("config.store.write");

  // ===== 页面模型（联系人 / provider 拉取都在这里）=====
  const m = useShippingProviderEditModel(safePid);

  // ===== 基础信息表单状态（沿用 ProviderForm 组件）=====
  const [savingProvider, setSavingProvider] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerOk, setProviderOk] = useState<string | null>(null);
  const okTimerRef = useRef<number | null>(null);

  const [state, setState] = useState<EditProviderFormState>({
    editName: "",
    editCode: "",
    editAddress: "",
    editActive: true,
    editPriority: "0",
    cName: "",
    cPhone: "",
    cEmail: "",
    cWechat: "",
    cRole: "OP",
    cPrimary: true,
  });

  const clearOkTimer = useCallback(() => {
    if (okTimerRef.current != null) {
      window.clearTimeout(okTimerRef.current);
      okTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearOkTimer();
    };
  }, [clearOkTimer]);

  const patchState = useCallback(
    (patch: Partial<EditProviderFormState>) => {
      if (providerOk) {
        clearOkTimer();
        setProviderOk(null);
      }
      setState((s) => ({ ...s, ...patch }));
    },
    [providerOk, clearOkTimer],
  );

  // provider 变化时同步表单（编辑模式）
  useEffect(() => {
    if (!safePid) {
      setState((s) => ({
        ...s,
        editName: "",
        editCode: "",
        editAddress: "",
        editPriority: "0",
        editActive: true,
      }));
      return;
    }

    const p = m.provider;
    if (!p) return;

    setState((s) => ({
      ...s,
      editName: p.name ?? "",
      editCode: p.code ?? "",
      editAddress: p.address ?? "",
      editPriority: String(p.priority ?? 0),
      editActive: Boolean(p.active),
    }));
  }, [m.provider, safePid]);

  const busy = !canWrite || m.loadingProvider || savingProvider;

  const onSaveProvider = useCallback(async () => {
    if (!canWrite) return;

    setProviderError(null);
    clearOkTimer();
    setProviderOk(null);

    const name = state.editName.trim();
    if (!name) {
      setProviderError("网点名称不能为空");
      return;
    }

    const codeTrim = state.editCode.trim();
    if (isCreate && !codeTrim) {
      setProviderError("网点编号不能为空");
      return;
    }

    const priorityNum = Number(state.editPriority || "0");
    const addrTrim = state.editAddress.trim();

    setSavingProvider(true);
    try {
      if (isCreate) {
        const created = await createShippingProvider({
          name,
          code: codeTrim,
          address: addrTrim ? addrTrim : undefined,
          active: Boolean(state.editActive),
          priority: Number.isFinite(priorityNum) ? priorityNum : 0,
        });
        const createdId = created?.id;
        if (typeof createdId === "number" && createdId > 0) {
          nav(`/tms/providers/${createdId}/edit`, { replace: true });
        } else {
          nav("/tms/providers", { replace: true });
        }
        return;
      }

      if (!safePid) return;

      await updateShippingProvider(safePid, {
        name,
        address: addrTrim ? addrTrim : null,
        active: Boolean(state.editActive),
        priority: Number.isFinite(priorityNum) ? priorityNum : 0,
      });

      await m.refreshProvider();

      setProviderOk("已保存网点基础信息");
      okTimerRef.current = window.setTimeout(() => {
        setProviderOk(null);
        okTimerRef.current = null;
      }, 2000);
    } catch (e: unknown) {
      setProviderError(toErrMsg(e, "保存失败"));
    } finally {
      setSavingProvider(false);
    }
  }, [
    canWrite,
    clearOkTimer,
    isCreate,
    m,
    nav,
    safePid,
    state.editActive,
    state.editAddress,
    state.editCode,
    state.editName,
    state.editPriority,
  ]);

  const showErrors = useMemo(() => {
    return providerError || m.providerError || m.contactError;
  }, [providerError, m.providerError, m.contactError]);

  const provider: ShippingProvider | null = m.provider;

  return (
    <div className={UI.page}>
      <div className="flex items-center justify-between gap-3">
        <PageTitle title={isCreate ? "新建快递网点" : "编辑快递网点"} />
        <button type="button" className={UI.btnSecondary} onClick={() => nav("/tms/providers")}>
          返回列表
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="text-sm text-slate-700">
          本页是“快递网点”主数据配置页，统一维护
          <span className="font-semibold text-slate-900">基础信息、联系人</span>
          两块内容。
        </div>
        <div className="mt-2 text-sm text-slate-500">
          仓库服务关系与运价方案已从本页移出，统一收敛到 Pricing 页维护。
        </div>
      </div>

      {!canWrite && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="text-sm opacity-80">
            你没有该页面的写权限（config.store.write）。可查看配置与事实，但不能保存修改。
          </div>
        </div>
      )}

      {showErrors && (
        <div className="mt-4 space-y-2">
          {providerError && <div className={UI.error}>{providerError}</div>}
          {m.providerError && <div className={UI.error}>{m.providerError}</div>}
          {m.contactError && <div className={UI.error}>{m.contactError}</div>}
        </div>
      )}

      <div className="mt-4 space-y-4">
        <ProviderBasicInfoCard
          canWrite={canWrite}
          busy={busy}
          isCreate={isCreate}
          state={state}
          onChange={patchState}
          savingProvider={savingProvider}
          onSaveProvider={onSaveProvider}
          error={providerError}
          ok={providerOk}
        />

        <ContactsSectionCard
          canWrite={canWrite}
          busy={busy || !provider}
          contacts={m.contacts}
          draft={m.draft}
          onPatchDraft={m.patchDraft}
          savingContact={m.savingContact}
          contactError={m.contactError}
          onCreateContact={m.createContact}
          onSetPrimary={m.setPrimary}
          onToggleContactActive={m.toggleContactActive}
          onRemoveContact={m.removeContact}
        />
      </div>
    </div>
  );
};

export default ShippingProviderEditPage;
