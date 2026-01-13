// src/features/purchase-orders/PurchaseOrderDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { fetchPurchaseOrderV2, type PurchaseOrderWithLines } from "./api";

import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";

function formatTs(ts: string | null | undefined) {
  return ts ? ts.replace("T", " ").replace("Z", "") : "-";
}

function formatMoney(v: string | null | undefined) {
  return v == null ? "-" : v;
}

function statusText(s: string) {
  switch (s) {
    case "CREATED":
      return "新建";
    case "PARTIAL":
      return "部分收货";
    case "RECEIVED":
      return "已收货";
    case "CLOSED":
      return "已关闭";
    default:
      return s || "-";
  }
}

function statusBadge(s: string) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
  switch (s) {
    case "CREATED":
      return <span className={`${base} bg-slate-100 text-slate-700`}>新建</span>;
    case "PARTIAL":
      return <span className={`${base} bg-amber-100 text-amber-800`}>部分收货</span>;
    case "RECEIVED":
      return <span className={`${base} bg-emerald-100 text-emerald-800`}>已收货</span>;
    case "CLOSED":
      return <span className={`${base} bg-slate-200 text-slate-800`}>已关闭</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-700`}>{s}</span>;
  }
}

const PurchaseOrderDetailPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();

  const [po, setPo] = useState<PurchaseOrderWithLines | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 行表选中状态（纯展示）
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  const idNum = poId ? Number(poId) : NaN;
  const isIdValid = poId && Number.isFinite(idNum);

  async function loadPo() {
    if (!poId || !Number.isFinite(idNum)) {
      setError("无效的采购单 ID。");
      setPo(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPurchaseOrderV2(idNum);
      setPo(data);

      if (data.lines && data.lines.length > 0) {
        setSelectedLineId(data.lines[0].id);
      } else {
        setSelectedLineId(null);
      }
    } catch (err: unknown) {
       
      console.error("fetchPurchaseOrderV2 failed", err);
      const msg = err instanceof Error ? err.message : "加载采购单失败";
      setError(msg);
      setPo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId]);

  const totalQtyOrdered = useMemo(() => {
    if (!po) return 0;
    return po.lines.reduce((sum, l) => sum + l.qty_ordered, 0);
  }, [po]);

  const totalQtyReceived = useMemo(() => {
    if (!po) return 0;
    return po.lines.reduce((sum, l) => sum + l.qty_received, 0);
  }, [po]);

  if (!isIdValid) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PageTitle title="采购单详情" />
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            ← 返回采购单列表
          </button>
        </div>

        <div className="text-sm text-red-600">无效的采购单 ID（URL 中的 :poId 不是数字）。</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题栏 + 返回键（强可见） */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <PageTitle
          title={`采购单详情 #${poId}`}
          description="多行采购单 → 收货任务 → 扫码/录入 → commit → 库存 & 台账联动。"
        />
        <button
          type="button"
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          ← 返回采购单列表
        </button>
      </div>

      {loading && <div className="text-sm text-slate-500">加载中…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {po && (
        <>
          {/* 与列表列口径一致的摘要卡 */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">基本信息（与列表口径一致）</h2>
              <div className="text-xs text-slate-500">状态：{statusBadge(po.status)}</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="text-sm">
                <div className="text-xs text-slate-500">ID</div>
                <div className="font-mono">{po.id}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">供应商</div>
                <div>{po.supplier_name ?? po.supplier ?? "-"}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">采购人</div>
                <div>{po.purchaser ?? "-"}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">采购时间</div>
                <div className="font-mono text-[12px]">{formatTs(po.purchase_time)}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">仓库</div>
                <div className="font-mono">{po.warehouse_id ?? "-"}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">行数</div>
                <div className="font-mono">{po.lines.length}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">订购数量</div>
                <div className="font-mono">{totalQtyOrdered}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">已收数量</div>
                <div className="font-mono">{totalQtyReceived}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">汇总金额</div>
                <div className="font-mono">{formatMoney(po.total_amount)}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">创建时间</div>
                <div className="font-mono text-[12px]">{formatTs(po.created_at)}</div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-slate-500">状态文本</div>
                <div>{statusText(po.status)}</div>
              </div>
            </div>
          </section>

          {/* 行明细（与采购单/报告口径对齐） */}
          <PurchaseOrderLinesTable
            po={po}
            selectedLineId={selectedLineId}
            onSelectLine={setSelectedLineId}
          />
        </>
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
