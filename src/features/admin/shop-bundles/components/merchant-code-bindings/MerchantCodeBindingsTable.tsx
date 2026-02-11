// src/features/admin/shop-bundles/components/merchant-code-bindings/MerchantCodeBindingsTable.tsx
import React from "react";
import type { Fsku, Platform, MerchantCodeBindingRow } from "../../types";
import { PLATFORM_OPTIONS, fmtIso } from "../../ui";

export const MerchantCodeBindingsTable: React.FC<{
  mode: "global" | "store";

  platform: Platform;
  setPlatform: (p: Platform) => void;

  shopId: string;
  setShopId: (v: string) => void;

  // filters
  qMerchantCode: string;
  setQMerchantCode: (v: string) => void;
  qFskuCode: string;
  setQFskuCode: (v: string) => void;
  qFskuId: string;
  setQFskuId: (v: string) => void;
  currentOnly: boolean;
  setCurrentOnly: (v: boolean) => void;

  // paging
  total: number;
  limit: number; // 容器层可能用到，表格层不强制使用
  offset: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRefresh: () => void;

  // input row（历史遗留：表格层当前不使用，避免解构触发 lint）
  newMerchantCode: string;
  setNewMerchantCode: (v: string) => void;
  newReason: string;
  setNewReason: (v: string) => void;

  // store mode binding（历史遗留）
  bindFskuIdText: string;
  setBindFskuIdText: (v: string) => void;

  // global mode binding（历史遗留）
  selectedFskuId: number | null;
  selectedFsku: Fsku | null;
  canBindSelected: boolean;

  // data
  rows: MerchantCodeBindingRow[];

  // actions
  loading: boolean;
  onBind: () => void; // 历史遗留
  onClose: (row: MerchantCodeBindingRow) => void;
}> = (props) => {
  const {
    mode,
    platform,
    setPlatform,
    shopId,
    setShopId,
    qMerchantCode,
    setQMerchantCode,
    qFskuCode,
    setQFskuCode,
    qFskuId,
    setQFskuId,
    currentOnly,
    setCurrentOnly,
    total,
    offset,
    canPrev,
    canNext,
    onPrev,
    onNext,
    onRefresh,
    rows,
    loading,
    onClose,
  } = props;

  const showContextCols = mode === "global";

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-slate-200 text-[11px] text-slate-600">
              <th className="px-3 py-2 text-left">行号</th>
              {showContextCols ? <th className="px-3 py-2 text-left">platform</th> : null}
              {showContextCols ? <th className="px-3 py-2 text-left">shop_id</th> : null}
              {showContextCols ? <th className="px-3 py-2 text-left">店铺名称</th> : null}
              <th className="px-3 py-2 text-left">商家后端规格编码</th>
              <th className="px-3 py-2 text-left">fsku_id</th>
              <th className="px-3 py-2 text-left">FSKU 名称</th>
              <th className="px-3 py-2 text-left">reason</th>
              <th className="px-3 py-2 text-left">updated_at</th>
              <th className="px-3 py-2 text-left">created_at</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>

            {/* ✅ 筛选行 */}
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
              <th className="px-3 py-2">—</th>

              {showContextCols ? (
                <th className="px-3 py-2">
                  <select
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    disabled={loading}
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </th>
              ) : null}

              {showContextCols ? (
                <th className="px-3 py-2">
                  <input
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    placeholder="字符串"
                    disabled={loading}
                  />
                </th>
              ) : null}

              {showContextCols ? <th className="px-3 py-2">—</th> : null}

              <th className="px-3 py-2">
                <input
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                  value={qMerchantCode}
                  onChange={(e) => setQMerchantCode(e.target.value)}
                  placeholder="模糊"
                  disabled={loading}
                />
              </th>

              <th className="px-3 py-2" colSpan={2}>
                <div className="flex gap-2">
                  <input
                    className="w-1/2 rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                    value={qFskuCode}
                    onChange={(e) => setQFskuCode(e.target.value)}
                    placeholder="fsku.code 模糊"
                    disabled={loading}
                  />
                  <input
                    className="w-1/2 rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                    value={qFskuId}
                    onChange={(e) => setQFskuId(e.target.value)}
                    placeholder="fsku_id"
                    disabled={loading}
                  />
                </div>
              </th>

              <th className="px-3 py-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentOnly}
                    onChange={(e) => setCurrentOnly(e.target.checked)}
                    disabled={loading}
                  />
                  仅当前（无历史）
                </label>
              </th>

              <th className="px-3 py-2" colSpan={2}>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    刷新
                  </button>
                  <div className="text-[11px] text-slate-500">
                    total <span className="font-mono">{total}</span> / offset <span className="font-mono">{offset}</span>
                  </div>
                </div>
              </th>

              <th className="px-3 py-2">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    disabled={!canPrev || loading}
                    onClick={onPrev}
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    disabled={!canNext || loading}
                    onClick={onNext}
                  >
                    下一页
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((b) => {
                return (
                  <tr key={String(b.id)} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{b.id}</td>

                    {showContextCols ? <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{b.platform}</td> : null}
                    {showContextCols ? <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{b.shop_id}</td> : null}
                    {showContextCols ? <td className="px-3 py-2 text-[11px] text-slate-700">{b.store.name}</td> : null}

                    <td className="px-3 py-2 font-mono text-[11px] text-slate-900">{b.merchant_code}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-900">{b.fsku_id}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">{b.fsku.name}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">{b.reason ?? "—"}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{fmtIso(b.updated_at)}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{fmtIso(b.created_at)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-700 hover:bg-red-100 disabled:opacity-60"
                        disabled={loading}
                        onClick={() => onClose(b)}
                        title="解绑（删除绑定）"
                      >
                        解绑
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showContextCols ? 11 : 8} className="px-3 py-3 text-[12px] text-slate-500">
                  暂无数据（可调整筛选条件后刷新）。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
