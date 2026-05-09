import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchItemAggregate,
  fetchItemsBasic,
  type ItemBasic,
  type PublicAggregateUom,
} from "../../../domains/pms/export";
import {
  fetchSuppliersBasic,
  type SupplierBasic,
} from "../../../domains/partners/export";
import { fetchActiveWarehouses } from "../../wms/warehouses/api";
import {
  createInboundReceiptManual,
  type InboundReceiptCreateManualIn,
} from "../api/inboundReceiptsApi";
import {
  formatInboundSourceType,
  formatInboundStatus,
  type InboundReceiptLineReadOut,
} from "../contracts/inboundReceipt";
import { useInboundReceiptDetailPage } from "../model/useInboundReceiptDetailPage";

import { formatDateTimeMinute } from "../../../lib/dateTime";
type WarehouseOption = Awaited<ReturnType<typeof fetchActiveWarehouses>>[number];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function formatDateTime(value: string | null): string {
  return formatDateTimeMinute(value);
}

function formatQty(value: number | string | null | undefined): string {
  if (value == null) return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(6).replace(/\.?0+$/, "");
}

function warehouseLabel(warehouse: WarehouseOption): string {
  const code = typeof warehouse.code === "string" && warehouse.code.trim() ? warehouse.code.trim() : "";
  return code ? `${warehouse.name}（${code}）` : warehouse.name;
}

function supplierLabel(supplier: SupplierBasic): string {
  const code = supplier.code?.trim() || "";
  return code ? `${supplier.name}（${code}）` : supplier.name;
}

function rawUomName(uom: PublicAggregateUom): string {
  return uom.display_name?.trim() ? uom.display_name.trim() : uom.uom;
}

function sortUoms(rows: PublicAggregateUom[]): PublicAggregateUom[] {
  return [...rows].sort((a, b) => {
    const rankA = a.is_inbound_default ? 0 : a.is_base ? 1 : 2;
    const rankB = b.is_inbound_default ? 0 : b.is_base ? 1 : 2;
    if (rankA !== rankB) return rankA - rankB;

    const ratioA = Number(a.ratio_to_base ?? 0);
    const ratioB = Number(b.ratio_to_base ?? 0);
    if (ratioA !== ratioB) return ratioA - ratioB;

    return a.id - b.id;
  });
}

function uomLabel(uom: PublicAggregateUom): string {
  const name = rawUomName(uom);
  if (uom.is_inbound_default) return `${name}（入库默认）`;
  if (uom.is_base) return `${name}（基础包装）`;
  return name;
}

function computeExpectedBaseQty(
  plannedQty: string,
  selectedUom: PublicAggregateUom | null,
): string {
  if (!selectedUom) return "-";
  const qty = Number(plannedQty);
  if (!Number.isFinite(qty) || qty <= 0) return "-";
  return formatQty(qty * Number(selectedUom.ratio_to_base));
}

function computeExpectedBaseQtyFromLine(line: InboundReceiptLineReadOut): string {
  const qty = Number(line.planned_qty);
  const ratio = Number(line.ratio_to_base_snapshot);
  if (!Number.isFinite(qty) || !Number.isFinite(ratio)) return "-";
  return formatQty(qty * ratio);
}

const ManualInboundReceiptSheet: React.FC<{
  receiptId: number;
}> = ({ receiptId }) => {
  const navigate = useNavigate();
  const m = useInboundReceiptDetailPage(String(receiptId));

  if (m.loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        正在加载手动收货单…
      </section>
    );
  }

  if (m.error) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {m.error}
      </section>
    );
  }

  if (!m.detail) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        未找到手动收货单。
      </section>
    );
  }

  const detail = m.detail;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">手动收货单</div>
          <div className="text-xs text-slate-500">
            下方展示当前这一张完整手动收货单。
          </div>
        </div>

        <div className="flex items-center gap-2">
          {detail.status === "RELEASED" ? (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
              onClick={() => navigate(`/receiving/${detail.receipt_no}`)}
            >
              去收货作业
            </button>
          ) : null}

          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white disabled:opacity-60"
            disabled={detail.status !== "DRAFT" || m.releasing}
            onClick={() => {
              if (!window.confirm(`确认发布手动收货单 ${detail.receipt_no}？`)) return;
              void m.release();
            }}
          >
            {m.releasing ? "发布中…" : "发布"}
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="text-xs text-slate-500">收货单号</div>
          <div className="font-mono text-sm text-slate-900">{detail.receipt_no}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">来源</div>
          <div className="text-sm text-slate-900">
            {formatInboundSourceType(detail.source_type)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">仓库</div>
          <div className="text-sm text-slate-900">
            {detail.warehouse_name_snapshot || `仓库 ${detail.warehouse_id}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">状态</div>
          <div className="text-sm text-slate-900">
            {formatInboundStatus(detail.status)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">供应商</div>
          <div className="text-sm text-slate-900">
            {detail.counterparty_name_snapshot || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">发布时间</div>
          <div className="text-sm text-slate-900">{formatDateTime(detail.released_at)}</div>
        </div>
        <div className="md:col-span-2 xl:col-span-2">
          <div className="text-xs text-slate-500">备注</div>
          <div className="text-sm text-slate-900">{detail.remark || "-"}</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-sm font-semibold text-slate-900">收货行</div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">行号</th>
                <th className="px-3 py-2 text-left">商品</th>
                <th className="px-3 py-2 text-left">规格</th>
                <th className="px-3 py-2 text-left">单位</th>
                <th className="px-3 py-2 text-right">任务数量</th>
                <th className="px-3 py-2 text-right">倍率</th>
                <th className="px-3 py-2 text-right">预计base</th>
                <th className="px-3 py-2 text-right">累计已收</th>
                <th className="px-3 py-2 text-right">剩余待收</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detail.lines.map((line: InboundReceiptLineReadOut) => {
                const progress = m.progressByLineNo.get(line.line_no);
                return (
                  <tr key={line.id} className="text-slate-800">
                    <td className="px-3 py-2 font-mono">{line.line_no}</td>
                    <td className="px-3 py-2">
                      {line.item_name_snapshot || `商品 ${line.item_id}`}
                    </td>
                    <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                    <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                    <td className="px-3 py-2 text-right font-mono">{line.planned_qty}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatQty(line.ratio_to_base_snapshot)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {computeExpectedBaseQtyFromLine(line)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {progress?.received_qty ?? "0"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {progress?.remaining_qty ?? line.planned_qty}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

const InboundReceiptsManualPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierBasic[]>([]);
  const [items, setItems] = useState<ItemBasic[]>([]);
  const [bootLoading, setBootLoading] = useState(false);
  const [bootError, setBootError] = useState("");

  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [uoms, setUoms] = useState<PublicAggregateUom[]>([]);
  const [uomsLoading, setUomsLoading] = useState(false);
  const [uomsError, setUomsError] = useState("");
  const [selectedUomId, setSelectedUomId] = useState("");
  const [plannedQty, setPlannedQty] = useState("");
  const [headerRemark, setHeaderRemark] = useState("");
  const [lineRemark, setLineRemark] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [currentReceiptId, setCurrentReceiptId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadBaseOptions() {
      setBootLoading(true);
      setBootError("");

      try {
        const [warehouseRows, supplierRows] = await Promise.all([
          fetchActiveWarehouses(),
          fetchSuppliersBasic({ active: true }),
        ]);

        if (!alive) return;
        setWarehouses(warehouseRows);
        setSuppliers(supplierRows);
      } catch (err) {
        if (!alive) return;
        setWarehouses([]);
        setSuppliers([]);
        setBootError(getErrorMessage(err, "加载手动入库单基础选项失败"));
      } finally {
        if (alive) setBootLoading(false);
      }
    }

    void loadBaseOptions();

    return () => {
      alive = false;
    };
  }, []);

  const selectedWarehouse = useMemo(() => {
    const id = Number(selectedWarehouseId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return warehouses.find((x) => x.id === id) ?? null;
  }, [warehouses, selectedWarehouseId]);

  const selectedSupplier = useMemo(() => {
    const id = Number(selectedSupplierId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return suppliers.find((x) => x.id === id) ?? null;
  }, [suppliers, selectedSupplierId]);

  const selectedItem = useMemo(() => {
    const id = Number(selectedItemId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return items.find((x) => x.id === id) ?? null;
  }, [items, selectedItemId]);

  const selectedUom = useMemo(() => {
    const id = Number(selectedUomId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return uoms.find((x) => x.id === id) ?? null;
  }, [uoms, selectedUomId]);

  const baseUom = useMemo(() => {
    return uoms.find((x) => x.is_base) ?? null;
  }, [uoms]);

  const conversionText = useMemo(() => {
    if (!selectedUom || !baseUom) return "-";
    return `1 ${rawUomName(selectedUom)} = ${formatQty(selectedUom.ratio_to_base)} ${rawUomName(baseUom)}`;
  }, [baseUom, selectedUom]);

  const estimatedBaseText = useMemo(() => {
    const qtyText = computeExpectedBaseQty(plannedQty, selectedUom);
    if (qtyText === "-" || !baseUom) return qtyText;
    return `${qtyText} ${rawUomName(baseUom)}`;
  }, [baseUom, plannedQty, selectedUom]);

  useEffect(() => {
    let alive = true;

    async function loadSupplierItems() {
      setSelectedItemId("");
      setItems([]);
      setItemsError("");
      setUoms([]);
      setSelectedUomId("");
      setUomsError("");

      if (!selectedSupplier) {
        setItemsLoading(false);
        return;
      }

      setItemsLoading(true);

      try {
        const rows = await fetchItemsBasic({
          enabledOnly: true,
          limit: 200,
          supplierId: selectedSupplier.id,
        });
        if (!alive) return;
        setItems(rows);
      } catch (err) {
        if (!alive) return;
        setItems([]);
        setItemsError(getErrorMessage(err, "加载该供应商商品失败"));
      } finally {
        if (alive) setItemsLoading(false);
      }
    }

    void loadSupplierItems();

    return () => {
      alive = false;
    };
  }, [selectedSupplier]);

  useEffect(() => {
    let alive = true;

    async function loadItemAggregate() {
      if (!selectedItem) {
        setUoms([]);
        setSelectedUomId("");
        setUomsError("");
        setUomsLoading(false);
        return;
      }

      setUomsLoading(true);
      setUomsError("");

      try {
        const aggregate = await fetchItemAggregate(selectedItem.id);
        if (!alive) return;

        const rows = sortUoms(Array.isArray(aggregate.uoms) ? aggregate.uoms : []);
        setUoms(rows);

        setSelectedUomId((prev) => {
          if (prev && rows.some((x) => x.id === Number(prev))) return prev;
          const first =
            rows.find((x) => x.is_inbound_default) ??
            rows.find((x) => x.is_base) ??
            rows[0] ??
            null;
          return first ? String(first.id) : "";
        });
      } catch (err) {
        if (!alive) return;
        setUoms([]);
        setSelectedUomId("");
        setUomsError(getErrorMessage(err, "加载商品包装单位失败"));
      } finally {
        if (alive) setUomsLoading(false);
      }
    }

    void loadItemAggregate();

    return () => {
      alive = false;
    };
  }, [selectedItem]);

  const canCreate = useMemo(() => {
    const qty = Number(plannedQty);
    return Boolean(
      selectedWarehouse &&
        selectedSupplier &&
        selectedItem &&
        selectedUom &&
        plannedQty.trim() &&
        Number.isFinite(qty) &&
        qty > 0 &&
        !creating,
    );
  }, [creating, plannedQty, selectedItem, selectedSupplier, selectedUom, selectedWarehouse]);

  async function handleCreate() {
    if (!selectedWarehouse) {
      setCreateError("请选择仓库");
      return;
    }
    if (!selectedSupplier) {
      setCreateError("请先选择供应商");
      return;
    }
    if (!selectedItem) {
      setCreateError("请选择商品");
      return;
    }
    if (!selectedUom) {
      setCreateError("请选择包装单位");
      return;
    }

    const qty = Number(plannedQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setCreateError("请输入大于 0 的任务数量");
      return;
    }

    const payload: InboundReceiptCreateManualIn = {
      warehouse_id: selectedWarehouse.id,
      supplier_id: selectedSupplier.id,
      remark: headerRemark.trim() || null,
      lines: [
        {
          item_id: selectedItem.id,
          item_uom_id: selectedUom.id,
          planned_qty: plannedQty.trim(),
          item_name_snapshot: selectedItem.name,
          item_spec_snapshot: selectedItem.spec,
          uom_name_snapshot: rawUomName(selectedUom),
          remark: lineRemark.trim() || null,
        },
      ],
    };

    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const created = await createInboundReceiptManual(payload);
      setCurrentReceiptId(created.id);
      setCreateSuccess(`已创建手动收货单：${created.receipt_no}`);
    } catch (err) {
      setCreateError(getErrorMessage(err, "创建手动收货单失败"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="手动入库单"
        description="手动收货单页面：先选供应商，再选该供应商下的商品与包装单位；输入单位数量并显示换算关系与预计 base 数量；下方展示当前这一张完整手动收货单。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">手动创建收货单</div>
          <div className="text-xs text-slate-500">
            先选供应商，再从该供应商商品中选择商品；再选包装单位、输入数量，并实时看到换算关系和预计 base 数量。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600">
            <span>仓库</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={selectedWarehouseId}
              disabled={bootLoading}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
            >
              <option value="">{bootLoading ? "仓库加载中…" : "请选择仓库"}</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={String(warehouse.id)}>
                  {warehouseLabel(warehouse)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>供应商</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={selectedSupplierId}
              disabled={bootLoading}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
            >
              <option value="">{bootLoading ? "供应商加载中…" : "请选择供应商"}</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={String(supplier.id)}>
                  {supplierLabel(supplier)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>商品</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={selectedItemId}
              disabled={!selectedSupplier || itemsLoading}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">
                {!selectedSupplier
                  ? "请先选择供应商"
                  : itemsLoading
                    ? "该供应商商品加载中…"
                    : "请选择商品"}
              </option>
              {items.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.sku} · {item.name} {item.spec ? `· ${item.spec}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>规格</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={selectedItem?.spec ?? ""}
              readOnly
              placeholder="选择商品后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>包装单位</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={selectedUomId}
              disabled={!selectedItem || uomsLoading}
              onChange={(e) => setSelectedUomId(e.target.value)}
            >
              <option value="">
                {!selectedItem
                  ? "请先选择商品"
                  : uomsLoading
                    ? "包装单位加载中…"
                    : "请选择包装单位"}
              </option>
              {uoms.map((uom) => {
                const name = rawUomName(uom);
                const baseName = baseUom ? rawUomName(baseUom) : "";
                const relation = baseName
                  ? ` · 1${name}=${formatQty(uom.ratio_to_base)}${baseName}`
                  : "";
                return (
                  <option key={uom.id} value={String(uom.id)}>
                    {uomLabel(uom)}{relation}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>任务数量</span>
            <input
              type="number"
              min="0"
              step="any"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={plannedQty}
              onChange={(e) => setPlannedQty(e.target.value)}
              placeholder="请输入任务数量"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>基础包装单位</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={baseUom ? rawUomName(baseUom) : ""}
              readOnly
              placeholder="选择商品后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>换算关系</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={conversionText === "-" ? "" : conversionText}
              readOnly
              placeholder="选择包装单位后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>预计base</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-900"
              value={estimatedBaseText === "-" ? "" : estimatedBaseText}
              readOnly
              placeholder="输入数量后自动计算"
            />
          </label>
        </div>

        <label className="block space-y-1 text-xs text-slate-600">
          <span>整单备注</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            value={headerRemark}
            onChange={(e) => setHeaderRemark(e.target.value)}
            placeholder="整单备注（可选）"
          />
        </label>

        <label className="block space-y-1 text-xs text-slate-600">
          <span>行备注</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            value={lineRemark}
            onChange={(e) => setLineRemark(e.target.value)}
            placeholder="行备注（可选）"
          />
        </label>

        {bootError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {bootError}
          </div>
        ) : null}

        {itemsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {itemsError}
          </div>
        ) : null}

        {uomsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {uomsError}
          </div>
        ) : null}

        {createSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {createSuccess}
          </div>
        ) : null}

        {createError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {createError}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={!canCreate}
            onClick={() => {
              void handleCreate();
            }}
          >
            {creating ? "创建中…" : "创建手动收货单"}
          </button>
        </div>
      </section>

      {!currentReceiptId ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          请先在上方选择仓库、供应商、该供应商下商品、包装单位并输入数量。系统会同时显示换算关系和预计 base 数量。创建后，下方展示当前这一张完整手动收货单。
        </section>
      ) : (
        <ManualInboundReceiptSheet receiptId={currentReceiptId} />
      )}
    </div>
  );
};

export default InboundReceiptsManualPage;
