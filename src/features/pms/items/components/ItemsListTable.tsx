// src/features/pms/items/components/ItemsListTable.tsx

import React from "react";
import type {
  ItemCompleteness,
  ItemListAttribute,
  ItemListBarcode,
  ItemListDetail,
  ItemListRow,
  ItemListSkuCode,
  ItemListUom,
} from "../contracts/itemList";
import {
  formatShelfUnitCn,
  numberOrDash,
  policyCnExpiry,
  policyCnLotSource,
  textOrDash,
  weightOrDash,
} from "./itemsListTableFormatters";

function boolCn(v: boolean): string {
  return v ? "是" : "否";
}

function activeCn(v: boolean): string {
  return v ? "启用" : "停用";
}

function completenessLabel(status: ItemCompleteness["status"]): string {
  if (status === "COMPLETE") return "完整";
  if (status === "WARNING") return "有提醒";
  return "待完善";
}

function completenessBadgeClass(status: ItemCompleteness["status"]): string {
  if (status === "COMPLETE") {
    return "inline-flex rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800";
  }
  if (status === "WARNING") {
    return "inline-flex rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800";
  }
  return "inline-flex rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700";
}

function completenessSummary(row: ItemListRow): string {
  const items = [...row.completeness.blocking_items, ...row.completeness.warnings];
  if (items.length === 0) {
    return row.completeness.can_generate_sku ? "可生成候选 SKU" : "无阻塞项";
  }

  const shown = items.slice(0, 2).join("；");
  return items.length > 2 ? `${shown}；等 ${items.length} 项` : shown;
}

function renderCompleteness(row: ItemListRow): React.ReactNode {
  return (
    <div className="space-y-1">
      <span className={completenessBadgeClass(row.completeness.status)}>
        {completenessLabel(row.completeness.status)}
      </span>
      <div className="line-clamp-2 text-[11px] leading-4 text-slate-500">
        {completenessSummary(row)}
      </div>
    </div>
  );
}

function attributeValueText(row: ItemListAttribute): string {
  if (row.value_option_names.length > 0) return row.value_option_names.join(" / ");
  if (row.value_option_code_snapshots.length > 0) {
    return row.value_option_code_snapshots.join(" / ");
  }
  if (row.value_text) return row.value_text;
  if (typeof row.value_number === "number" && Number.isFinite(row.value_number)) {
    return String(row.value_number);
  }
  if (typeof row.value_bool === "boolean") return row.value_bool ? "是" : "否";
  return "—";
}

const DetailSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-3">
    <div className="mb-2 text-sm font-semibold text-slate-900">{title}</div>
    {children}
  </section>
);

const UomsTable: React.FC<{ rows: ItemListUom[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-[900px] table-fixed border-collapse text-xs">
      <thead>
        <tr className="bg-slate-50 text-slate-600">
          <th className="border px-2 py-1 text-left">单位</th>
          <th className="border px-2 py-1 text-left">显示名</th>
          <th className="border px-2 py-1 text-left">转换系数</th>
          <th className="border px-2 py-1 text-left">净重kg</th>
          <th className="border px-2 py-1 text-left">基础单位</th>
          <th className="border px-2 py-1 text-left">采购默认</th>
          <th className="border px-2 py-1 text-left">入库默认</th>
          <th className="border px-2 py-1 text-left">出库默认</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={8} className="border px-2 py-4 text-center text-slate-400">
              暂无包装单位
            </td>
          </tr>
        ) : null}
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="border px-2 py-1 font-mono">{textOrDash(row.uom)}</td>
            <td className="border px-2 py-1">{textOrDash(row.display_name)}</td>
            <td className="border px-2 py-1 font-mono">{numberOrDash(row.ratio_to_base)}</td>
            <td className="border px-2 py-1 font-mono">{weightOrDash(row.net_weight_kg)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_base)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_purchase_default)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_inbound_default)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_outbound_default)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BarcodesTable: React.FC<{ rows: ItemListBarcode[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-[900px] table-fixed border-collapse text-xs">
      <thead>
        <tr className="bg-slate-50 text-slate-600">
          <th className="border px-2 py-1 text-left">包装单位</th>
          <th className="border px-2 py-1 text-left">显示名</th>
          <th className="border px-2 py-1 text-left">条码</th>
          <th className="border px-2 py-1 text-left">码制</th>
          <th className="border px-2 py-1 text-left">主条码</th>
          <th className="border px-2 py-1 text-left">状态</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={6} className="border px-2 py-4 text-center text-slate-400">
              暂无条码
            </td>
          </tr>
        ) : null}
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="border px-2 py-1 font-mono">{textOrDash(row.uom)}</td>
            <td className="border px-2 py-1">{textOrDash(row.display_name)}</td>
            <td className="border px-2 py-1 font-mono">{textOrDash(row.barcode)}</td>
            <td className="border px-2 py-1">{textOrDash(row.symbology)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_primary)}</td>
            <td className="border px-2 py-1">{activeCn(row.active)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SkuCodesTable: React.FC<{ rows: ItemListSkuCode[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-[900px] table-fixed border-collapse text-xs">
      <thead>
        <tr className="bg-slate-50 text-slate-600">
          <th className="border px-2 py-1 text-left">编码</th>
          <th className="border px-2 py-1 text-left">类型</th>
          <th className="border px-2 py-1 text-left">主编码</th>
          <th className="border px-2 py-1 text-left">状态</th>
          <th className="border px-2 py-1 text-left">生效开始</th>
          <th className="border px-2 py-1 text-left">生效结束</th>
          <th className="border px-2 py-1 text-left">备注</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={7} className="border px-2 py-4 text-center text-slate-400">
              暂无 SKU 编码
            </td>
          </tr>
        ) : null}
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="border px-2 py-1 font-mono">{textOrDash(row.code)}</td>
            <td className="border px-2 py-1">{textOrDash(row.code_type)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_primary)}</td>
            <td className="border px-2 py-1">{activeCn(row.is_active)}</td>
            <td className="border px-2 py-1">{textOrDash(row.effective_from)}</td>
            <td className="border px-2 py-1">{textOrDash(row.effective_to)}</td>
            <td className="border px-2 py-1">{textOrDash(row.remark)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AttributesTable: React.FC<{ rows: ItemListAttribute[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-[1000px] table-fixed border-collapse text-xs">
      <thead>
        <tr className="bg-slate-50 text-slate-600">
          <th className="border px-2 py-1 text-left">属性编码</th>
          <th className="border px-2 py-1 text-left">属性名</th>
          <th className="border px-2 py-1 text-left">值</th>
          <th className="border px-2 py-1 text-left">值类型</th>
          <th className="border px-2 py-1 text-left">选择模式</th>
          <th className="border px-2 py-1 text-left">单位</th>
          <th className="border px-2 py-1 text-left">参与 SKU 段</th>
          <th className="border px-2 py-1 text-left">排序</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={8} className="border px-2 py-4 text-center text-slate-400">
              暂无属性值
            </td>
          </tr>
        ) : null}
        {rows.map((row) => (
          <tr key={row.attribute_def_id}>
            <td className="border px-2 py-1 font-mono">{textOrDash(row.code)}</td>
            <td className="border px-2 py-1">{textOrDash(row.name_cn)}</td>
            <td className="border px-2 py-1">{attributeValueText(row)}</td>
            <td className="border px-2 py-1">{textOrDash(row.value_type)}</td>
            <td className="border px-2 py-1">{textOrDash(row.selection_mode)}</td>
            <td className="border px-2 py-1">{textOrDash(row.unit ?? row.value_unit_snapshot)}</td>
            <td className="border px-2 py-1">{boolCn(row.is_sku_segment)}</td>
            <td className="border px-2 py-1 font-mono">{numberOrDash(row.sort_order)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DetailPanel: React.FC<{
  detail: ItemListDetail;
  isEditing: boolean;
  onEdit: (row: ItemListRow) => void;
}> = ({ detail, isEditing, onEdit }) => (
  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div>
        <div className="text-sm font-semibold text-slate-900">只读详情</div>
        <div className="mt-1 text-xs text-slate-500">
          详情区只展示后端读模型；需要修改商品本体、包装、条码、SKU 编码或属性时，请进入上方编辑流程。
        </div>
      </div>
      <button
        type="button"
        className="rounded bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => onEdit(detail.row)}
        disabled={isEditing}
      >
        {isEditing ? "加载中…" : "去编辑流程"}
      </button>
    </div>

    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <DetailSection title="包装单位">
        <UomsTable rows={detail.uoms} />
      </DetailSection>

      <DetailSection title="条码">
        <BarcodesTable rows={detail.barcodes} />
      </DetailSection>

      <DetailSection title="SKU 编码">
        <SkuCodesTable rows={detail.sku_codes} />
      </DetailSection>

      <DetailSection title="属性">
        <AttributesTable rows={detail.attributes} />
      </DetailSection>
    </div>
  </div>
);

export const ItemsListTable: React.FC<{
  rows: ItemListRow[];
  editingItemId: number | null;
  expandedItemId: number | null;
  detailLoadingItemId: number | null;
  detailByItemId: Record<number, ItemListDetail>;
  onEdit: (row: ItemListRow) => void;
  onToggleDetail: (row: ItemListRow) => void;
}> = ({
  rows,
  editingItemId,
  expandedItemId,
  detailLoadingItemId,
  detailByItemId,
  onEdit,
  onToggleDetail,
}) => {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[2040px] w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[320px]" />
            <col className="w-[340px]" />
            <col className="w-[170px]" />
            <col className="w-[130px]" />
            <col className="w-[150px]" />
            <col className="w-[240px]" />
            <col className="w-[280px]" />
            <col className="w-[130px]" />
            <col className="w-[130px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[150px]" />
          </colgroup>

          <thead>
            <tr className="bg-slate-50 text-xs text-slate-600">
              <th className="border px-3 py-2 text-left font-semibold">SKU</th>
              <th className="border px-3 py-2 text-left font-semibold">商品名称</th>
              <th className="border px-3 py-2 text-left font-semibold">规格</th>
              <th className="border px-3 py-2 text-left font-semibold">品牌</th>
              <th className="border px-3 py-2 text-left font-semibold">分类</th>
              <th className="border px-3 py-2 text-left font-semibold">完整度</th>
              <th className="border px-3 py-2 text-left font-semibold">供应商</th>
              <th className="border px-3 py-2 text-left font-semibold">批次策略</th>
              <th className="border px-3 py-2 text-left font-semibold">有效期策略</th>
              <th className="border px-3 py-2 text-left font-semibold">保质期值</th>
              <th className="border px-3 py-2 text-left font-semibold">保质期单位</th>
              <th className="border px-3 py-2 text-left font-semibold">操作</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-slate-400">
                  暂无商品记录
                </td>
              </tr>
            ) : null}

            {rows.map((row) => {
              const isEditing = editingItemId === row.item_id;
              const isExpanded = expandedItemId === row.item_id;
              const isDetailLoading = detailLoadingItemId === row.item_id;
              const detail = detailByItemId[row.item_id] ?? null;
              const mutedRowClass = row.enabled ? "" : " bg-slate-50 text-slate-400";

              return (
                <React.Fragment key={row.item_id}>
                  <tr className={`border-t text-[13px] text-slate-700${mutedRowClass}`}>
                    <td className="px-3 py-2 align-top font-mono text-xs leading-5 text-slate-900 break-all">
                      {textOrDash(row.sku)}
                    </td>
                    <td className="px-3 py-2 align-top font-medium text-slate-900 break-words">
                      {textOrDash(row.name)}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-pre-line break-words">{textOrDash(row.spec)}</td>
                    <td className="px-3 py-2 align-top break-words">{textOrDash(row.brand)}</td>
                    <td className="px-3 py-2 align-top break-words">{textOrDash(row.category)}</td>
                    <td className="px-3 py-2 align-top">{renderCompleteness(row)}</td>
                    <td className="px-3 py-2 align-top break-words">{textOrDash(row.supplier_name)}</td>
                    <td className="px-3 py-2 align-top">{policyCnLotSource(row.lot_source_policy)}</td>
                    <td className="px-3 py-2 align-top">{policyCnExpiry(row.expiry_policy)}</td>
                    <td className="px-3 py-2 align-top font-mono text-xs">{numberOrDash(row.shelf_life_value)}</td>
                    <td className="px-3 py-2 align-top">{formatShelfUnitCn(row.shelf_life_unit)}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => onEdit(row)}
                          disabled={isEditing}
                        >
                          {isEditing ? "加载中…" : "编辑"}
                        </button>
                        <button
                          className="rounded bg-sky-100 px-3 py-1.5 text-xs text-sky-700 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => onToggleDetail(row)}
                          disabled={isDetailLoading}
                        >
                          {isDetailLoading ? "加载中…" : isExpanded ? "收起" : "详情"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr className="border-t">
                      <td colSpan={12} className="bg-white px-3 py-3">
                        {detail ? (
                          <DetailPanel detail={detail} isEditing={isEditing} onEdit={onEdit} />
                        ) : (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                            详情加载中…
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsListTable;
