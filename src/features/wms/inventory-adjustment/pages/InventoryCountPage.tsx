import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import CountDocInlineDetail from "../components/CountDocInlineDetail";
import CountDocStatusTag from "../components/CountDocStatusTag";
import { useInventoryCountPage } from "../model/useInventoryCountPage";

const InventoryCountPage: React.FC = () => {
  const m = useInventoryCountPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="盘点单"
        description="当前阶段先做整库盘点：上卡创建并冻结盘点单，下卡按基础单位录入实盘数量。保存盘点录入由盘点人完成，提交盘点结果并过账由复核人完成。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">整库盘点创建 / 冻结</div>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
            onClick={m.refreshRows}
            disabled={m.rowsLoading}
          >
            {m.rowsLoading ? "刷新中…" : "刷新盘点单列表"}
          </button>
        </div>

        {m.warehousesError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.warehousesError}
          </div>
        ) : null}

        {m.rowsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.rowsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <label className="space-y-1">
            <div className="text-xs text-slate-500">仓库</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.warehouseId}
              disabled={m.warehousesLoading || m.createLoading}
              onChange={(e) => m.selectWarehouseId(e.target.value)}
            >
              <option value="">
                {m.warehousesLoading ? "仓库加载中…" : "请选择仓库"}
              </option>
              {m.warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {m.warehouseLabel(warehouse)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs text-slate-500">盘点时点</div>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.snapshotAt}
              disabled={m.createLoading}
              onChange={(e) => m.setSnapshotAt(e.target.value)}
            />
          </label>

          <label className="space-y-1 xl:col-span-2">
            <div className="text-xs text-slate-500">备注</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.remark}
              disabled={m.createLoading}
              placeholder="可选：说明本次整库盘点背景"
              onChange={(e) => m.setRemark(e.target.value)}
            />
          </label>
        </div>

        {m.createError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.createError}
          </div>
        ) : null}

        {m.createSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {m.createSuccess}
          </div>
        ) : null}

        {m.freezeError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.freezeError}
          </div>
        ) : null}

        {m.freezeSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {m.freezeSuccess}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={() => {
              void m.createAndFreeze();
            }}
            disabled={m.createLoading}
          >
            {m.createLoading ? "创建并冻结中…" : "创建并冻结"}
          </button>

          {m.detail?.status === "DRAFT" ? (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              onClick={() => {
                void m.freezeCurrentDoc();
              }}
              disabled={m.freezeLoading}
            >
              {m.freezeLoading ? "冻结中…" : "冻结当前盘点单"}
            </button>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">未完成盘点单</div>

          <label className="space-y-1">
            <div className="text-xs text-slate-500">当前盘点单</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.currentDocId != null ? String(m.currentDocId) : ""}
              onChange={(e) => m.selectCurrentDocId(e.target.value)}
            >
              <option value="">
                {m.currentDocSelectableOptions.length > 0
                  ? "请选择未完成盘点单"
                  : "当前仓暂无未完成盘点单"}
              </option>
              {m.currentDocSelectableOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">盘点执行区</div>

          {m.detail ? (
            <div className="flex items-center gap-2">
              <CountDocStatusTag status={m.detail.status} />
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                onClick={() => {
                  void m.refreshCurrent();
                }}
                disabled={m.detailLoading}
              >
                {m.detailLoading ? "刷新中…" : "刷新当前盘点单"}
              </button>
            </div>
          ) : null}
        </div>

        {m.saveError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.saveError}
          </div>
        ) : null}

        {m.saveSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {m.saveSuccess}
          </div>
        ) : null}

        {m.postError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.postError}
          </div>
        ) : null}

        {m.postSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {m.postSuccess}
          </div>
        ) : null}

        <CountDocInlineDetail
          detail={m.detail}
          loading={m.detailLoading}
          error={m.detailError}
          countedByNameSnapshot={m.countedByNameSnapshot}
          reviewedByNameSnapshot={m.reviewedByNameSnapshot}
          interactionDisabled={m.interactionDisabled}
          draftsByLineId={m.draftsByLineId}
          onChangeDraft={m.updateLineDraft}
          onChangeCountedByNameSnapshot={m.setCountedByNameSnapshot}
          onChangeReviewedByNameSnapshot={m.setReviewedByNameSnapshot}
        />

        {m.detail ? (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              onClick={() => {
                void m.saveCurrentLines();
              }}
              disabled={
                m.saveLoading ||
                m.interactionDisabled ||
                (m.detail.status !== "FROZEN" && m.detail.status !== "COUNTED")
              }
            >
              {m.saveLoading ? "保存中…" : "保存盘点录入"}
            </button>

            <button
              type="button"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={() => {
                void m.postCurrent();
              }}
              disabled={m.postLoading || m.detail.status !== "COUNTED"}
            >
              {m.postLoading ? "过账中…" : "提交盘点结果并过账"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default InventoryCountPage;
