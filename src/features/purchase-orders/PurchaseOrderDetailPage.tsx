// src/features/purchase-orders/PurchaseOrderDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { fetchPurchaseOrderV2, type PurchaseOrderWithLines } from "./api";

import { PurchaseOrderHeaderCard } from "./PurchaseOrderHeaderCard";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";

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
        <PageTitle title="采购单详情" />
        <button
          type="button"
          className="mb-2 text-xs text-slate-600 hover:text-slate-900"
          onClick={() => navigate("/purchase-orders")}
        >
          ← 返回采购单列表
        </button>
        <div className="text-sm text-red-600">无效的采购单 ID（URL 中的 :poId 不是数字）。</div>
      </div>
    );
  }

  const poRef = `PO-${idNum}`;

  return (
    <div className="p-6 space-y-6">
      <PageTitle title={`采购单详情 #${poId}`} description="采购单是计划层（期望），收货事实以 Receipt 为唯一口径。" />

      <button
        type="button"
        className="mb-2 text-xs text-slate-600 hover:text-slate-900"
        onClick={() => navigate("/purchase-orders")}
      >
        ← 返回采购单列表
      </button>

      {loading && <div className="text-sm text-slate-500">加载中…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {po && (
        <>
          {/* 头部信息 */}
          <PurchaseOrderHeaderCard
            po={po}
            poRef={poRef}
            totalQtyOrdered={totalQtyOrdered}
            totalQtyReceived={totalQtyReceived}
          />

          {/* 行明细表 */}
          <PurchaseOrderLinesTable po={po} selectedLineId={selectedLineId} onSelectLine={setSelectedLineId} />
        </>
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
