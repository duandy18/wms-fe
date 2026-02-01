// src/features/admin/shipping-providers/pages/ShippingProviderEditPage.tsx
//
// 快递网点编辑页（唯一入口）
// - 页面只负责编排（Orchestrator）
// - 状态/取数：useShippingProviderEditModel
// - UI：拆成 ProviderBasicInfoCard / ContactsSectionCard / SchemesSectionCard
//
// Phase 6 收尾裁决：
// - 不引入第三入口（SchemesPage/DetailPage 仅兼容重定向）
// - 列表页不再提供“网点价表”入口
// - 编辑页承载“基础信息 / 联系人 / 收费标准（工作台入口）”

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageTitle from "../../../../components/ui/PageTitle";
import { UI } from "../ui";

import { useAuth } from "../../../../shared/useAuth";
import { fetchWarehouses } from "../../warehouses/api";
import type { WarehouseListItem } from "../../warehouses/types";

import type { EditProviderFormState } from "../edit-provider/ProviderForm";
import type { ShippingProvider } from "../api/types";

import { createShippingProvider, updateShippingProvider } from "../api/providers";

import { useShippingProviderEditModel } from "./edit/useShippingProviderEditModel";
import { ProviderBasicInfoCard } from "./edit/ProviderBasicInfoCard";
import { ContactsSectionCard } from "./edit/ContactsSectionCard";
import { SchemesSectionCard } from "./edit/SchemesSectionCard";

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

  // ===== Warehouses dict =====
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

  // ===== 基础信息表单状态（沿用 ProviderForm 组件）=====
  const [savingProvider, setSavingProvider] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerOk, setProviderOk] = useState<string | null>(null);
  const okTimerRef = useRef<number | null>(null);

  // warehouse_id 选择（string 便于 select 绑定）
  const [warehouseIdStr, setWarehouseIdStr] = useState<string>("");

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
      // 用户一改输入，就清掉“已保存”的提示，避免误导
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
      setWarehouseIdStr("");
      setState((s) => ({ ...s, editName: "", editCode: "", editAddress: "", editPriority: "0", editActive: true }));
      return;
    }
    const p = m.provider;
    if (!p) return;

    setWarehouseIdStr(String(p.warehouse_id ?? ""));
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

    const whId = Number(warehouseIdStr);
    if (!Number.isFinite(whId) || whId <= 0) {
      setProviderError("请选择所属仓库");
      return;
    }

    const priorityNum = Number(state.editPriority || "0");
    const addrTrim = state.editAddress.trim();

    const payload = {
      warehouse_id: whId,
      name,
      code: state.editCode.trim() ? state.editCode.trim() : undefined,
      address: addrTrim ? addrTrim : undefined,
      active: Boolean(state.editActive),
      priority: Number.isFinite(priorityNum) ? priorityNum : 0,
    };

    setSavingProvider(true);
    try {
      if (isCreate) {
        const created = await createShippingProvider(payload);
        const createdId = created?.id;
        if (typeof createdId === "number" && createdId > 0) {
          nav(`/admin/shipping-providers/${createdId}/edit`, { replace: true });
        } else {
          nav("/admin/shipping-providers", { replace: true });
        }
        return;
      }

      if (!safePid) return;

      await updateShippingProvider(safePid, {
        warehouse_id: payload.warehouse_id,
        name: payload.name,
        code: payload.code ?? null,
        // ✅ 允许清空：表单为空字符串时传 null
        address: addrTrim ? addrTrim : null,
        active: payload.active,
        priority: payload.priority,
      });

      // 保存后刷新：provider + schemes
      await m.refreshProvider();
      await m.refreshSchemes();

      // ✅ 明确成功反馈（2 秒后自动消失）
      setProviderOk("已保存网点信息");
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
    safePid,
    state.editActive,
    state.editAddress,
    state.editCode,
    state.editName,
    state.editPriority,
    warehouseIdStr,
    nav,
  ]);

  const showErrors = useMemo(() => {
    return providerError || warehousesError || m.providerError || m.schemesError || m.contactError;
  }, [providerError, warehousesError, m.providerError, m.schemesError, m.contactError]);

  // 编辑页需要一个 provider 实体用于渲染/判断（来自 model）
  const provider: ShippingProvider | null = m.provider;

  // ✅ 供 Workbench 返回使用：明确记录 “从哪里打开的”
  const from = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className={UI.page}>
      <div className="flex items-center justify-between gap-3">
        <PageTitle title={isCreate ? "新建快递网点" : "编辑快递网点"} />
        <button type="button" className={UI.btnSecondary} onClick={() => nav("/admin/shipping-providers")}>
          返回列表
        </button>
      </div>

      {!canWrite && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="text-sm opacity-80">你没有该页面的写权限（config.store.write）。可查看配置与事实，但不能保存修改。</div>
        </div>
      )}

      {/* 页面级错误保留（用于汇总展示），但卡片内也会显示基础信息的保存结果 */}
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
          warehouses={warehouses}
          warehousesLoading={warehousesLoading}
          warehouseIdStr={warehouseIdStr}
          onWarehouseIdStrChange={(v) => {
            // 选择仓库也属于“修改”，清掉成功提示
            if (providerOk) {
              clearOkTimer();
              setProviderOk(null);
            }
            setWarehouseIdStr(v);
          }}
          state={state}
          onChange={patchState}
          savingProvider={savingProvider}
          onSaveProvider={onSaveProvider}
          error={providerError}
          ok={providerOk}
        />

        <ContactsSectionCard
          canWrite={canWrite}
          busy={busy || !provider} // provider 未加载完时先禁用
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

        <SchemesSectionCard
          canWrite={canWrite}
          busy={busy}
          providerId={safePid}
          schemes={m.schemes}
          loading={m.loadingSchemes}
          error={m.schemesError}
          includeInactive={m.includeInactiveSchemes}
          includeArchived={m.includeArchivedSchemes}
          onChangeIncludeInactive={m.setIncludeInactiveSchemes}
          onChangeIncludeArchived={m.setIncludeArchivedSchemes}
          onRefresh={m.refreshSchemes}
          onOpenWorkbench={(schemeId) =>
            nav(`/admin/shipping-providers/schemes/${schemeId}/workbench-flow`, {
              state: { from },
            })
          }
        />
      </div>
    </div>
  );
};

export default ShippingProviderEditPage;
