import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchPurchaseOrdersCompletion,
  type PurchaseOrderCompletionListItem,
} from "../../purchase-orders/api";
import {
  createInboundReceiptFromPurchase,
  fetchInboundReceipts,
} from "../api/inboundReceiptsApi";
import {
  formatInboundSourceType,
  formatInboundStatus,
  type InboundReceiptLineReadOut,
  type InboundReceiptListItemOut,
} from "../contracts/inboundReceipt";
import { useInboundReceiptDetailPage } from "../model/useInboundReceiptDetailPage";

type PurchaseOption = {
  poId: number;
  poNo: string;
  warehouseId: number;
  warehouseLabel: string;
  supplierName: string | null;
  label: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function buildPurchaseOptions(rows: PurchaseOrderCompletionListItem[]): PurchaseOption[] {
  const map = new Map<number, PurchaseOption>();

  for (const row of rows) {
    if (map.has(row.po_id)) continue;
    const warehouseId = Number(row.warehouse_id ?? 0);
    map.set(row.po_id, {
      poId: row.po_id,
      poNo: row.po_no,
      warehouseId,
      warehouseLabel: warehouseId > 0 ? `仓库 ${warehouseId}` : "-",
      supplierName: row.supplier_name ?? null,
      label: `${row.po_no} · ${row.supplier_name ?? "未知供应商"} · 仓库 ${warehouseId || "-"}`,
    });
  }

  return Array.from(map.values());
}

function tryParseExistingReceiptNo(message: string): string | null {
  const m = message.match(/inbound_receipt_already_exists:([A-Za-z0-9\\-]+)/);
  return m?.[1] ?? null;
}

function findExistingPurchaseReceipt(
  receipts: InboundReceiptListItemOut[],
  poNo: string,
): InboundReceiptListItemOut | null {
  const matches = receipts.filter(
    (item) =>
      item.source_type === "PURCHASE_ORDER" &&
      item.source_doc_no_snapshot === poNo,
  );
  if (matches.length === 0) return null;
  return matches[0] ?? null;
}

const PurchaseInboundReceiptSheet: React.FC<{
  receiptId: number;
}> = ({ receiptId }) => {
  const navigate = useNavigate();
  const m = useInboundReceiptDetailPage(String(receiptId));

  if (m.loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        正在加载采购收货单…
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
        未找到采购收货单。
      </section>
    );
  }

  const detail = m.detail;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">采购收货单</div>
          <div className="text-xs text-slate-500">
            当前页只展示一张基于采购单生成的完整收货单，从标题到收货行。
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
              if (!window.confirm(`确认发布采购收货单 ${detail.receipt_no}？`)) return;
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
          <div className="text-xs text-slate-500">来源采购单号</div>
          <div className="text-sm text-slate-900">{detail.source_doc_no_snapshot || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">状态</div>
          <div className="text-sm text-slate-900">
            {formatInboundStatus(detail.status)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">仓库</div>
          <div className="text-sm text-slate-900">
            {detail.warehouse_name_snapshot || `仓库 ${detail.warehouse_id}`}
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
        <div>
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

const InboundReceiptsPurchasePage: React.FC = () => {
  const [options, setOptions] = useState<PurchaseOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [selectedPoId, setSelectedPoId] = useState("");
  const [remark, setRemark] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [receipts, setReceipts] = useState<InboundReceiptListItemOut[]>([]);
  const [receiptsReloadToken, setReceiptsReloadToken] = useState(0);
  const [currentReceiptId, setCurrentReceiptId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadOptions() {
      setOptionsLoading(true);
      setOptionsError("");

      try {
        const rows = await fetchPurchaseOrdersCompletion({ limit: 200, skip: 0 });
        if (!alive) return;
        setOptions(buildPurchaseOptions(rows));
      } catch (err) {
        if (!alive) return;
        setOptions([]);
        setOptionsError(getErrorMessage(err, "加载采购单选项失败"));
      } finally {
        if (alive) setOptionsLoading(false);
      }
    }

    void loadOptions();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadReceipts() {
      try {
        const data = await fetchInboundReceipts();
        if (!alive) return;
        setReceipts(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!alive) return;
        setReceipts([]);
      }
    }

    void loadReceipts();

    return () => {
      alive = false;
    };
  }, [receiptsReloadToken]);

  const selectedOption = useMemo(() => {
    const id = Number(selectedPoId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return options.find((item) => item.poId === id) ?? null;
  }, [options, selectedPoId]);

  useEffect(() => {
    if (!selectedOption) {
      setCurrentReceiptId(null);
      return;
    }
    const matched = findExistingPurchaseReceipt(receipts, selectedOption.poNo);
    setCurrentReceiptId(matched?.id ?? null);
  }, [receipts, selectedOption]);

  async function handleCreate() {
    if (!selectedOption) {
      setCreateError("请先选择采购单");
      return;
    }

    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const created = await createInboundReceiptFromPurchase({
        source_doc_id: selectedOption.poId,
        warehouse_id: selectedOption.warehouseId,
        remark: remark.trim() || null,
      });
      setCurrentReceiptId(created.id);
      setCreateSuccess(`已生成采购收货单：${created.receipt_no}`);
      setReceiptsReloadToken((v) => v + 1);
    } catch (err) {
      const msg = getErrorMessage(err, "基于采购单生成收货单失败");
      const existingReceiptNo = tryParseExistingReceiptNo(msg);

      if (existingReceiptNo) {
        const matched = receipts.find((item) => item.receipt_no === existingReceiptNo) ?? null;
        if (matched) {
          setCurrentReceiptId(matched.id);
          setCreateError("");
          setCreateSuccess(`采购收货单已存在，已为你定位：${matched.receipt_no}`);
          setCreating(false);
          return;
        }
      }

      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="采购入库单"
        description="采购收货单页面：读取采购单，创建新的收货表头与行表；下方只显示一张完整的采购收货单。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">基于采购单生成收货单</div>
          <div className="text-xs text-slate-500">
            当前后端合同是：选择采购单后，系统读取采购单头和采购行，写入新的收货表头与收货行表；行不是在此页手输。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>采购单</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={selectedPoId}
              disabled={optionsLoading}
              onChange={(e) => setSelectedPoId(e.target.value)}
            >
              <option value="">{optionsLoading ? "采购单加载中…" : "请选择采购单"}</option>
              {options.map((option) => (
                <option key={option.poId} value={String(option.poId)}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>仓库</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={selectedOption?.warehouseLabel ?? ""}
              readOnly
              placeholder="选择采购单后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>供应商</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={selectedOption?.supplierName ?? ""}
              readOnly
              placeholder="选择采购单后自动带出"
            />
          </label>
        </div>

        <label className="block space-y-1 text-xs text-slate-600">
          <span>备注</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="头备注（可选）"
          />
        </label>

        {optionsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {optionsError}
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
            disabled={creating || !selectedOption}
            onClick={() => {
              void handleCreate();
            }}
          >
            {creating ? "生成中…" : "生成采购收货单"}
          </button>
        </div>
      </section>

      {!selectedOption ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          请先在上方选择采购单。下方将显示该采购单对应的一张完整采购收货单。
        </section>
      ) : currentReceiptId ? (
        <PurchaseInboundReceiptSheet receiptId={currentReceiptId} />
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          当前采购单尚未生成采购收货单。点击上方“生成采购收货单”后，下方会展示完整收货单。
        </section>
      )}
    </div>
  );
};

export default InboundReceiptsPurchasePage;
