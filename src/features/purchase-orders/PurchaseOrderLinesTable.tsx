// src/features/purchase-orders/PurchaseOrderLinesTable.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrderWithLines, PurchaseOrderLine } from "./api";
import { StandardTable, type ColumnDef } from "../../components/wmsdu/StandardTable";
import { fetchItemsBasic, type ItemBasic } from "../../master-data/itemsApi";

interface PurchaseOrderLinesTableProps {
  po: PurchaseOrderWithLines;
  selectedLineId: number | null;
  onSelectLine: (lineId: number) => void;

  mode?: "default" | "inbound";
}

const formatUnitExpr = (line: PurchaseOrderLine) => {
  if (!line.purchase_uom || !line.base_uom || !line.units_per_case) return "-";
  return `1${line.purchase_uom} = ${line.units_per_case}${line.base_uom}`;
};

function computeWorkStatus(line: PurchaseOrderLine): { text: string; className: string } {
  const ordered = Number(line.qty_ordered ?? 0);
  const received = Number(line.qty_received ?? 0);

  if (received <= 0) return { text: "未收", className: "text-slate-500" };
  if (received < ordered) return { text: "收货中", className: "text-amber-700" };
  return { text: "已收完", className: "text-emerald-700" };
}

function clean(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return s ? s : "—";
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const PurchaseOrderLinesTable: React.FC<PurchaseOrderLinesTableProps> = ({
  po,
  selectedLineId,
  onSelectLine,
  mode = "default",
}) => {
  const isInbound = mode === "inbound";

  const [items, setItems] = useState<ItemBasic[]>([]);
  const [itemsErr, setItemsErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setItemsErr(null);
      try {
        const data = await fetchItemsBasic();
        if (!alive) return;
        setItems(data);
      } catch (e) {
         
        console.error("fetchItemsBasic failed in PurchaseOrderLinesTable", e);
        if (!alive) return;
        setItems([]);
        setItemsErr("加载商品主数据失败（条码/品牌/分类可能为空）");
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const itemMap = useMemo(() => {
    const m = new Map<number, ItemBasic>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  const columns: ColumnDef<PurchaseOrderLine>[] = [
    {
      key: "line_no",
      header: "行号",
      render: (line) => (
        <span className={`font-mono ${isInbound ? "text-[12px]" : "text-[11px]"}`}>
          {line.line_no}
        </span>
      ),
    },
    {
      key: "item",
      header: "商品",
      render: (line) => {
        const it = itemMap.get(line.item_id);
        const name = it?.name?.trim()
          ? it!.name
          : (line.item_name ?? `（未知商品：${line.item_id}）`);
        return (
          <div>
            <div className="font-medium text-slate-900">{name}</div>
            <div className="mt-0.5 text-[11px] text-slate-400 font-mono">ID：{line.item_id}</div>
          </div>
        );
      },
    },
    {
      key: "barcode",
      header: "条码",
      render: (line) => {
        const it = itemMap.get(line.item_id);
        return <span className="font-mono text-[12px]">{clean(it?.barcode)}</span>;
      },
    },
    {
      key: "brand",
      header: "品牌",
      render: (line) => clean(itemMap.get(line.item_id)?.brand_name),
    },
    {
      key: "category",
      header: "分类",
      render: (line) => clean(itemMap.get(line.item_id)?.category_name),
    },
    {
      key: "spec_text",
      header: "规格",
      render: (line) => line.spec_text ?? "-",
    },
    {
      key: "base_uom",
      header: "最小单位",
      render: (line) => line.base_uom ?? "-",
    },
    {
      key: "purchase_uom",
      header: "采购单位",
      render: (line) => line.purchase_uom ?? "-",
    },
    {
      key: "units_per_case",
      header: "每件数量",
      align: "right",
      render: (line) => (line.units_per_case ?? "-"),
    },
    {
      key: "qty_ordered",
      header: "订购件数",
      align: "right",
      render: (line) => line.qty_ordered,
    },
    {
      key: "qty_base",
      header: "数量(最小单位)",
      align: "right",
      render: (line) => {
        const qtyCases = num(line.qty_cases ?? line.qty_ordered, 0);
        const units = num(line.units_per_case, 1);
        return qtyCases * units;
      },
    },
    {
      key: "supply_price",
      header: "单价(每最小单位)",
      align: "right",
      render: (line) => (line.supply_price ?? "-"),
    },
    {
      key: "line_amount",
      header: "行金额",
      align: "right",
      render: (line) => (line.line_amount ?? "-"),
    },
    {
      key: "unit_expr",
      header: "单位换算",
      render: (line) => formatUnitExpr(line),
    },
    {
      key: "qty_received",
      header: "已收数量",
      align: "right",
      render: (line) => line.qty_received,
    },
    {
      key: "remaining",
      header: "剩余",
      align: "right",
      render: (line) => line.qty_ordered - line.qty_received,
    },
    {
      key: "work_status",
      header: "作业状态",
      render: (line) => {
        const s = computeWorkStatus(line);
        return <span className={s.className}>{s.text}</span>;
      },
    },
  ];

  const cardCls = isInbound
    ? "bg-white border border-slate-200 rounded-xl p-5 space-y-4"
    : "bg-white border border-slate-200 rounded-xl p-4 space-y-3";

  const titleCls = isInbound ? "text-base font-semibold text-slate-800" : "text-sm font-semibold text-slate-800";

  return (
    <section className={cardCls}>
      <div className="flex items-center justify-between">
        <h2 className={titleCls}>行明细</h2>
        {itemsErr ? <div className="text-xs text-amber-700">{itemsErr}</div> : null}
      </div>

      <StandardTable<PurchaseOrderLine>
        columns={columns}
        data={po.lines}
        dense={!isInbound}
        getRowKey={(line) => line.id}
        emptyText="暂无行数据"
        selectedKey={selectedLineId}
        onRowClick={(line) => onSelectLine(line.id)}
        footer={
          <span className={isInbound ? "text-sm text-slate-500" : "text-xs text-slate-500"}>
            共 {po.lines.length} 行
          </span>
        }
      />
    </section>
  );
};
