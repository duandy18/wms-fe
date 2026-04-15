import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchPurchaseOrderV2,
  updatePurchaseOrder,
  type PurchaseOrderDetail,
} from "./api";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";
import { PurchaseOrderReceiptsPanel } from "./PurchaseOrderReceiptsPanel";
import { PurchaseOrderCreateHeaderForm } from "./PurchaseOrderCreateHeaderForm";
import { PurchaseOrderCreateLinesEditor } from "./PurchaseOrderCreateLinesEditor";
import { buildPayloadLines } from "./create/presenter/lineDraft";
import {
  datetimeLocalToIsoOrThrow,
  getErrorMessage,
} from "./create/utils";
import { usePurchaseOrderFormShell } from "./form/usePurchaseOrderFormShell";

function formatTs(ts: string | null | undefined): string {
  return ts ? ts.replace("T", " ").replace("Z", "") : "-";
}

function formatMoney(v: string | null | undefined): string {
  if (v == null) return "-";
  const s = String(v).trim();
  return s || "-";
}

type PageMode = "view" | "edit";

const PurchaseOrderViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { poId } = useParams();

  const [po, setPo] = useState<PurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  const [mode, setMode] = useState<PageMode>("view");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, formActions] = usePurchaseOrderFormShell();

  const canEdit = useMemo(() => {
    if (!po) return false;
    return po.editable === true;
  }, [po]);

  useEffect(() => {
    let alive = true;

    async function load() {
      const id = Number(poId);
      if (!Number.isInteger(id) || id <= 0) {
        if (!alive) return;
        setPo(null);
        setError("采购单 ID 非法");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchPurchaseOrderV2(id);
        if (!alive) return;
        setPo(data);
        setSelectedLineId(data.lines[0]?.id ?? null);
        setMode("view");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载采购单失败";
        if (!alive) return;
        setPo(null);
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, [poId]);

  function handleStartEdit() {
    if (!po) return;
    formActions.hydrateFromDetail(po);
    setMode("edit");
  }

  function handleCancelEdit() {
    setMode("view");
    setFormError(null);
  }

  function handleSelectSupplier(id: number | null) {
    formActions.selectSupplier(id);

    if (id == null) {
      setFormError(null);
      return;
    }

    setFormError("已切换供应商：已清空行明细，请重新选择该供应商提供的商品。");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!po) return;

    setFormError(null);

    if (
      formState.supplierId == null ||
      !Number.isFinite(formState.supplierId) ||
      formState.supplierId <= 0
    ) {
      setFormError("请选择供应商");
      return;
    }

    const warehouseText = formState.warehouseId.trim();
    if (!warehouseText) {
      setFormError("请选择仓库");
      return;
    }

    const wid = Number(warehouseText);
    if (Number.isNaN(wid) || wid <= 0) {
      setFormError("仓库 ID 非法");
      return;
    }

    const purchaserTrimmed = formState.purchaser.trim();
    if (!purchaserTrimmed) {
      setFormError("请填写采购人");
      return;
    }

    let purchaseTimeIso: string;
    try {
      purchaseTimeIso = datetimeLocalToIsoOrThrow(formState.purchaseTime);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "采购时间格式非法，请重新选择");
      return;
    }

    let normalizedLines;
    try {
      normalizedLines = buildPayloadLines(formState.lines);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "行校验失败");
      return;
    }

    if (normalizedLines.length === 0) {
      setFormError("请至少填写一行有效的商品行");
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePurchaseOrder(po.id, {
        supplier_id: formState.supplierId,
        warehouse_id: wid,
        purchaser: purchaserTrimmed,
        purchase_time: purchaseTimeIso,
        remark: formState.remark.trim() || null,
        lines: normalizedLines,
      });

      setPo(updated);
      setSelectedLineId(updated.lines[0]?.id ?? null);
      setMode("view");
      setFormError(null);
    } catch (err) {
      console.error("updatePurchaseOrder failed", err);
      setFormError(getErrorMessage(err, "更新采购单失败"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <PageTitle
            title={mode === "edit" ? "编辑采购单" : "查看采购单"}
            description={
              mode === "edit"
                ? "在详情页内直接编辑采购计划。保存时以后端准入规则为准：存在 DRAFT 收货单或正式采购入库事实时将禁止修改。"
                : "采购列表页只负责搜索与完成情况浏览；进入本页后查看采购计划头表、行明细与正式收货事实。"
            }
          />
          {po ? (
            <p className="mt-2 text-sm text-slate-600">
              当前采购单：<span className="font-mono">{po.po_no || `PO-${po.id}`}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            返回采购列表
          </button>

          {mode === "view" && canEdit ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
            >
              编辑采购单
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          加载中…
        </section>
      ) : null}

      {!loading && error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          加载失败：{error}
        </section>
      ) : null}

      {!loading && !error && po && mode === "view" ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">采购单基本信息</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                状态：{po.status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-3">
              <div>
                <div className="text-xs text-slate-500">采购单号</div>
                <div className="font-mono">{po.po_no || `PO-${po.id}`}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">供应商</div>
                <div>{po.supplier_name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">仓库 ID</div>
                <div>{po.warehouse_id}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">采购人</div>
                <div>{po.purchaser}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">采购时间</div>
                <div>{formatTs(po.purchase_time)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">总金额</div>
                <div>{formatMoney(po.total_amount)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">创建时间</div>
                <div>{formatTs(po.created_at)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">最后收货</div>
                <div>{formatTs(po.last_received_at)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">关闭时间</div>
                <div>{formatTs(po.closed_at)}</div>
              </div>
            </div>

            <div
              className={[
                "rounded-lg px-4 py-3 text-sm",
                canEdit
                  ? "border border-slate-200 bg-slate-50 text-slate-600"
                  : "border border-amber-200 bg-amber-50 text-amber-900",
              ].join(" ")}
            >
              {canEdit
                ? "采购列表只负责浏览完成情况；采购单若允许修改，统一在本详情页进入编辑态。"
                : po.edit_block_reason
                  ? `当前采购单只读：${po.edit_block_reason}`
                  : "当前采购单只读。"}
            </div>

            {po.remark ? (
              <div>
                <div className="text-xs text-slate-500">备注</div>
                <div className="mt-1 text-sm text-slate-700">{po.remark}</div>
              </div>
            ) : null}
          </section>

          <PurchaseOrderLinesTable
            po={po}
            selectedLineId={selectedLineId}
            onSelectLine={setSelectedLineId}
          />

          <PurchaseOrderReceiptsPanel poId={po.id} />
        </>
      ) : null}

      {!loading && !error && po && mode === "edit" ? (
        <form onSubmit={handleSaveEdit} className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            编辑保存会以后端准入规则为准：若该采购单已有 DRAFT 收货单，或已发生正式采购入库事实，将返回冲突并拒绝保存。
          </div>

          {formState.itemsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              商品加载失败：{formState.itemsError}
            </div>
          ) : null}

          <PurchaseOrderCreateHeaderForm
            supplierId={formState.supplierId}
            supplierName={formState.supplierName}
            supplierOptions={formState.supplierOptions}
            suppliersLoading={formState.suppliersLoading}
            suppliersError={formState.suppliersError}
            warehouseId={formState.warehouseId}
            purchaser={formState.purchaser}
            purchaseTime={formState.purchaseTime}
            remark={formState.remark}
            error={formError}
            onSelectSupplier={handleSelectSupplier}
            onChangeWarehouseId={formActions.setWarehouseId}
            onChangePurchaser={formActions.setPurchaser}
            onChangePurchaseTime={formActions.setPurchaseTime}
            onChangeRemark={formActions.setRemark}
          />

          <PurchaseOrderCreateLinesEditor
            lines={formState.lines}
            items={formState.itemOptions}
            itemsLoading={formState.itemsLoading}
            onSelectItem={formActions.selectItemForLine}
            onChangeLineField={formActions.changeLineField}
            onAddLine={formActions.addLine}
            onRemoveLine={formActions.removeLine}
          />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? "保存中…" : "保存采购单"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default PurchaseOrderViewPage;
