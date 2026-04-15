import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { fetchPurchaseOrderV2, type PurchaseOrderDetail } from "./api";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";
import { PurchaseOrderReceiptsPanel } from "./PurchaseOrderReceiptsPanel";

function formatTs(ts: string | null | undefined): string {
  return ts ? ts.replace("T", " ").replace("Z", "") : "-";
}

function formatMoney(v: string | null | undefined): string {
  if (v == null) return "-";
  const s = String(v).trim();
  return s || "-";
}

const PurchaseOrderViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { poId } = useParams();

  const [po, setPo] = useState<PurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <PageTitle
            title="查看采购单"
            description="采购列表页只负责搜索与完成情况浏览；进入本页后查看采购计划头表、行明细与正式收货事实。"
          />
          {po ? (
            <p className="mt-2 text-sm text-slate-600">
              当前采购单：<span className="font-mono">{po.po_no || `PO-${po.id}`}</span>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          返回采购列表
        </button>
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

      {!loading && !error && po ? (
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

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              当前入口为“查看”。采购列表不再承载编辑语义；后续是否允许修改，将统一收口到采购单页面内部判定。
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
    </div>
  );
};

export default PurchaseOrderViewPage;
