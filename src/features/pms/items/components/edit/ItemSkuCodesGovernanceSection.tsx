// src/features/pms/items/components/edit/ItemSkuCodesGovernanceSection.tsx
import React from "react";
import type { ItemSkuCode, ItemSkuCodeType } from "../../api/itemSkuCodesOwnerApi";
import { generateSkuCodeFromItem, type SkuGenerateData } from "../../../sku-coding/api/skuCodingApi";
import { useItemSkuCodesGovernanceModel } from "./useItemSkuCodesGovernanceModel";

function typeLabel(t: ItemSkuCodeType): string {
  if (t === "PRIMARY") return "当前主 SKU";
  if (t === "ALIAS") return "历史 / 别名";
  if (t === "LEGACY") return "旧系统编码";
  if (t === "MANUAL") return "人工维护";
  return t;
}

function statusBadge(row: ItemSkuCode) {
  if (row.is_primary) {
    return <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">主码</span>;
  }
  if (row.is_active) {
    return <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">启用</span>;
  }
  return <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">停用</span>;
}

function dateText(v?: string | null): string {
  if (!v) return "—";
  return String(v).slice(0, 10);
}

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function generatedSegmentText(data: SkuGenerateData): string {
  return data.segments.map((segment) => `${segment.segment_key}:${segment.code}`).join(" / ");
}

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60";
const dangerBtnCls = "rounded border border-red-300 bg-white px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60";

export const ItemSkuCodesGovernanceSection: React.FC<{
  itemId: number;
  currentSku: string;
  disabled?: boolean;
  onChanged: () => Promise<void>;
}> = ({ itemId, currentSku, disabled = false, onChanged }) => {
  const m = useItemSkuCodesGovernanceModel({ itemId, currentSku, onChanged });
  const busy = disabled || m.saving || m.loading;
  const [generatedSku, setGeneratedSku] = React.useState<SkuGenerateData | null>(null);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [generatingSku, setGeneratingSku] = React.useState(false);

  async function handleGenerateFromItem() {
    setGeneratingSku(true);
    setGenerateError(null);
    setGeneratedSku(null);

    try {
      setGeneratedSku(await generateSkuCodeFromItem(itemId));
    } catch (e) {
      setGenerateError(errorText(e, "根据当前商品属性生成 SKU 失败"));
    } finally {
      setGeneratingSku(false);
    }
  }

  function fillGeneratedSkuToPrimaryInput() {
    if (!generatedSku?.sku) return;
    m.setPrimaryCode(generatedSku.sku);
    m.setPrimaryRemark("根据当前商品属性生成候选 SKU 后切换");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">SKU 编码管理</h3>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-mono">item_id</span> 是商品身份真相；
            <span className="font-mono">items.sku</span> 只是当前主 SKU 投影。历史采购、入库、财务单据里的 SKU 快照不会追改。
          </p>
        </div>

        <button type="button" className={btnCls} onClick={m.refresh} disabled={busy}>
          刷新编码
        </button>
      </div>

      {m.banner ? (
        <div
          className={
            m.banner.kind === "success"
              ? "mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              : "mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {m.banner.text}
        </div>
      ) : null}

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-700">根据当前商品属性生成候选 SKU</div>
            <p className="mt-1 text-xs text-slate-500">
              从当前商品真实品牌、分类、规格和已保存的 SKU 段属性值生成候选 SKU；最终是否切换主 SKU 仍需人工确认。
            </p>
          </div>
          <button
            type="button"
            className={btnCls}
            onClick={() => void handleGenerateFromItem()}
            disabled={busy || generatingSku}
          >
            {generatingSku ? "生成中…" : "根据当前商品生成"}
          </button>
        </div>

        {generateError ? (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {generateError}
          </div>
        ) : null}

        {generatedSku ? (
          <div className="mt-3 space-y-2 rounded border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-slate-500">候选 SKU</div>
                <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
                  {generatedSku.sku}
                </div>
              </div>
              <button
                type="button"
                className={primaryBtnCls}
                onClick={fillGeneratedSkuToPrimaryInput}
                disabled={busy}
              >
                填入主 SKU 切换框
              </button>
            </div>
            <div className={generatedSku.exists ? "text-xs text-red-600" : "text-xs text-emerald-700"}>
              {generatedSku.exists ? "该 SKU 已存在，请谨慎切换。" : "未发现同码商品。"}
            </div>
            <div className="break-all text-[11px] text-slate-500">
              {generatedSegmentText(generatedSku)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-xs font-semibold text-slate-700">新增别名 / 历史编码</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px]">
            <input
              className={`${inputCls} font-mono`}
              value={m.newCode}
              maxLength={128}
              placeholder="例如：OLD-SKU-001"
              onChange={(e) => m.setNewCode(e.target.value.toUpperCase())}
              disabled={busy}
            />
            <select
              className={inputCls}
              value={m.newType}
              onChange={(e) => m.setNewType(e.target.value as Exclude<ItemSkuCodeType, "PRIMARY">)}
              disabled={busy}
            >
              <option value="ALIAS">历史 / 别名</option>
              <option value="LEGACY">旧系统编码</option>
              <option value="MANUAL">人工维护</option>
            </select>
          </div>
          <input
            className={`${inputCls} mt-2 w-full`}
            value={m.newRemark}
            maxLength={255}
            placeholder="备注（可选）"
            onChange={(e) => m.setNewRemark(e.target.value)}
            disabled={busy}
          />
          <button type="button" className={`${primaryBtnCls} mt-2`} onClick={m.addCode} disabled={!m.canAdd || busy}>
            新增编码
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-xs font-semibold text-slate-700">切换当前主 SKU</div>
          <input
            className={`${inputCls} w-full font-mono`}
            value={m.primaryCode}
            maxLength={128}
            placeholder={`当前：${currentSku || "-"}`}
            onChange={(e) => m.setPrimaryCode(e.target.value.toUpperCase())}
            disabled={busy}
          />
          <input
            className={`${inputCls} mt-2 w-full`}
            value={m.primaryRemark}
            maxLength={255}
            placeholder="切换原因 / 备注（可选）"
            onChange={(e) => m.setPrimaryRemark(e.target.value)}
            disabled={busy}
          />
          <button
            type="button"
            className={`${primaryBtnCls} mt-2`}
            onClick={() => m.changePrimary(m.primaryCode)}
            disabled={!m.canChangePrimary || busy}
          >
            切换主 SKU
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-[880px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-600">
              <th className="border-b px-3 py-2 text-left font-semibold">编码</th>
              <th className="border-b px-3 py-2 text-left font-semibold">类型</th>
              <th className="border-b px-3 py-2 text-left font-semibold">状态</th>
              <th className="border-b px-3 py-2 text-left font-semibold">生效</th>
              <th className="border-b px-3 py-2 text-left font-semibold">备注</th>
              <th className="border-b px-3 py-2 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {m.codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                  {m.loading ? "加载中…" : "暂无 SKU 编码。"}
                </td>
              </tr>
            ) : (
              m.codes.map((row) => (
                <tr key={row.id} className="border-t text-[13px] text-slate-700">
                  <td className="px-3 py-2 align-top font-mono text-xs text-slate-900 break-all">{row.code}</td>
                  <td className="px-3 py-2 align-top">{typeLabel(row.code_type)}</td>
                  <td className="px-3 py-2 align-top">{statusBadge(row)}</td>
                  <td className="px-3 py-2 align-top text-xs text-slate-500">
                    <div>起：{dateText(row.effective_from)}</div>
                    <div>止：{dateText(row.effective_to)}</div>
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-600">{row.remark || "—"}</td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-wrap gap-2">
                      {!row.is_primary && row.is_active ? (
                        <button type="button" className={btnCls} onClick={() => m.changePrimary(row.code)} disabled={busy}>
                          设为主 SKU
                        </button>
                      ) : null}
                      {!row.is_primary ? (
                        <button
                          type="button"
                          className={row.is_active ? dangerBtnCls : btnCls}
                          onClick={() => m.toggleActive(row)}
                          disabled={busy}
                        >
                          {row.is_active ? "停用" : "启用"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">主 SKU 不可停用</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ItemSkuCodesGovernanceSection;
