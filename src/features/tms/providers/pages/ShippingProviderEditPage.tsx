// src/features/tms/providers/pages/ShippingProviderEditPage.tsx
//
// 快递网点配置页（唯一业务容器）
// - 页面只负责编排（Orchestrator）
// - 状态/取数：useShippingProviderEditModel
// - UI：拆成 ProviderBasicInfoCard / ContactsSectionCard / WarehouseBindingsCard / SchemesSectionCard
//
// 当前页定位：
// - 这是“快递网点”业务的主容器，不再拆出第三入口页面。
// - 列表页只负责进入这里；真正配置在本页内完成。
// - 页面内统一维护：
//   1) 基础信息
//   2) 联系人
//   3) 仓库绑定
//   4) 运价方案
//
// Phase 6 收尾裁决：
// - 不引入第三入口（SchemesPage/DetailPage 仅兼容重定向）
// - 列表页不再提供“网点价表”入口
// - 编辑页承载“基础信息 / 联系人 / 仓库绑定 / 收费标准（工作台入口）”
//
// Step-1 语义纠偏：
// - shipping_provider 本体不再承载 warehouse_id
// - code 仅创建时可编辑；编辑时只读
//
// Step-2 主线接线：
// - 仓库绑定事实由 warehouse_shipping_providers 维护
// - 当前页显式展示 WarehouseBindingsCard
// - 收费方案创建依赖“该网点在某仓库下已绑定且启用”
//
// Step-3 真相优先：
// - 基础信息卡不再展示任何“工作仓库”伪字段
// - 收费方案创建所需 warehouse_id 来自真实绑定关系，而不是页面伪上下文

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageTitle from "../../../../components/ui/PageTitle";
import { UI } from "../ui";

import { useAuth } from "../../../../shared/useAuth";
import { fetchWarehouses } from "../../../admin/warehouses/api";
import type { WarehouseListItem } from "../../../admin/warehouses/types";

import type { EditProviderFormState } from "../edit-provider/ProviderForm";
import type { ShippingProvider } from "../api/types";

import { createShippingProvider, updateShippingProvider } from "../api/providers";

import { useShippingProviderEditModel } from "./edit/useShippingProviderEditModel";
import { ProviderBasicInfoCard } from "./edit/ProviderBasicInfoCard";
import { ContactsSectionCard } from "./edit/ContactsSectionCard";
import { WarehouseBindingsCard } from "./edit/WarehouseBindingsCard";
import { SchemesSectionCard } from "./edit/SchemesSectionCard";
import { useProviderBindings } from "./edit/useProviderBindings";

function toErrMsg(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

const ShippingProviderEditPage: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { providerId } = useParams<{ providerId?: string }>();

  const pidNum = providerId ? Number(providerId) : NaN;
  const safePid = Number.isFinite(pidNum) && pidNum > 0 ? pidNum : null;
  const isCreate = !safePid;

  const { can } = useAuth();
  const canWrite = can("config.store.write");

  // ===== Warehouses dict（用于仓库绑定卡展示 + 收费方案创建时展示仓库标签）=====
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);

  const loadWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    setWarehousesError(null);
    try {
      const res = await fetchWarehouses();
      const list = (res?.data ?? []) as WarehouseListItem[];
      setWarehouses(list);
    } catch (e: unknown) {
      setWarehouses([]);
      setWarehousesError(toErrMsg(e, "加载仓库列表失败"));
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  // ===== 页面模型（联系人 / schemes / provider 拉取都在这里）=====
  const m = useShippingProviderEditModel(safePid);

  // ===== 真实仓库绑定模型（供绑定卡 + 收费方案创建共用）=====
  const bindingModel = useProviderBindings({ providerId: safePid, warehouses });

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

  const busy = !canWrite || m.loadingProvider || savingProvider || warehousesLoading;

  const activeBindingWarehouses = useMemo(() => {
    return bindingModel.rows
      .filter((row) => row.bound && row.active)
      .map((row) => ({
        warehouse_id: row.warehouse_id,
        warehouse_label: row.warehouse_label,
      }));
  }, [bindingModel.rows]);

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
      await m.refreshSchemes();

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
    return providerError || warehousesError || m.providerError || m.schemesError || m.contactError;
  }, [providerError, warehousesError, m.providerError, m.schemesError, m.contactError]);

  const provider: ShippingProvider | null = m.provider;

  const from = `${location.pathname}${location.search}${location.hash}`;

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
          本页是“快递网点”配置主容器，统一维护
          <span className="font-semibold text-slate-900">
            基础信息、联系人、仓库绑定、运价方案
          </span>
          四块内容。
        </div>
        <div className="mt-2 text-sm text-slate-500">
          其中“运价方案”负责进入深度工作台；创建方案前，必须先在“仓库绑定”中完成至少一个启用绑定。
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
          {warehousesError && <div className={UI.error}>{warehousesError}</div>}
          {m.providerError && <div className={UI.error}>{m.providerError}</div>}
          {m.schemesError && <div className={UI.error}>{m.schemesError}</div>}
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

        <WarehouseBindingsCard
          canWrite={canWrite}
          busy={busy}
          providerId={safePid}
          warehouses={warehouses}
        />

        <SchemesSectionCard
          canWrite={canWrite}
          busy={busy}
          providerId={safePid}
          activeBindingWarehouses={activeBindingWarehouses}
          schemes={m.schemes}
          loading={m.loadingSchemes}
          error={m.schemesError}
          includeInactive={m.includeInactiveSchemes}
          includeArchived={m.includeArchivedSchemes}
          onChangeIncludeInactive={m.setIncludeInactiveSchemes}
          onChangeIncludeArchived={m.setIncludeArchivedSchemes}
          onRefresh={m.refreshSchemes}
          onOpenWorkbench={(schemeId) =>
            nav(`/tms/providers/schemes/${schemeId}/workbench-flow`, {
              state: { from },
            })
          }
        />
      </div>
    </div>
  );
};

export default ShippingProviderEditPage;
