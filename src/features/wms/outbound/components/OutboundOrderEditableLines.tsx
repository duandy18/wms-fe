import React from "react";
import type { OrderOutboundViewLineOut } from "../contracts/outbound";
import type { ResolvedOutboundLineInfo } from "../model/useOutboundOrderPage";

type Props = {
  lines: OrderOutboundViewLineOut[];
  barcodeByLineId: Record<number, string>;
  qtyByLineId: Record<number, string>;
  hintByLineId: Record<number, string>;
  resolvedByLineId: Record<number, ResolvedOutboundLineInfo>;
  resolvingLineId: number | null;
  onChangeBarcode: (lineId: number, value: string) => void;
  onResolveBarcode: (lineId: number) => void;
  onChangeQty: (lineId: number, value: string) => void;
};

const OutboundOrderEditableLines: React.FC<Props> = ({
  lines,
  barcodeByLineId,
  qtyByLineId,
  hintByLineId,
  resolvedByLineId,
  resolvingLineId,
  onChangeBarcode,
  onResolveBarcode,
  onChangeQty,
}) => {
  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        当前订单暂无出库行
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line) => {
        const resolved = resolvedByLineId[line.id] ?? null;
        const isResolving = resolvingLineId === line.id;

        return (
          <div
            key={line.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-500">
              订单行参考
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <div className="text-xs text-slate-500">订单行</div>
                <div className="text-sm font-mono text-slate-900">{line.id}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">商品</div>
                <div className="text-sm text-slate-900">
                  {line.item_name || `商品 ${line.item_id}`}
                </div>
                <div className="text-xs text-slate-500">
                  SKU：{line.item_sku || "-"} / item_id：{line.item_id}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">规格</div>
                <div className="text-sm text-slate-900">{line.item_spec || "-"}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">单位</div>
                <div className="text-sm text-slate-900">
                  {line.base_uom_name || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">需求/请求数量</div>
                <div className="text-sm font-mono text-slate-900">{line.req_qty}</div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-3 text-xs font-semibold tracking-wide text-slate-500">
                实际出库录入
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <div className="mb-1 text-xs text-slate-500">扫码条码</div>
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={barcodeByLineId[line.id] ?? ""}
                      onChange={(e) => onChangeBarcode(line.id, e.target.value)}
                      placeholder="请输入或扫码条码"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-60"
                      onClick={() => onResolveBarcode(line.id)}
                      disabled={isResolving}
                    >
                      {isResolving ? "识别中…" : "识别"}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500">实际商品</div>
                  <div className="min-h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {resolved?.itemName || "未扫码识别"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {resolved?.itemSku ? `SKU：${resolved.itemSku}` : "-"}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500">实际规格</div>
                  <div className="min-h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {resolved?.itemSpec || "-"}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500">实际单位</div>
                  <div className="min-h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {resolved?.uomName || "未识别"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {resolved?.ratioToBase != null
                      ? `包装倍率 × ${resolved.ratioToBase}`
                      : "-"}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500">本次出库</div>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-right text-sm"
                    value={qtyByLineId[line.id] ?? ""}
                    onChange={(e) => onChangeQty(line.id, e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {hintByLineId[line.id] || "等待扫码识别。"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OutboundOrderEditableLines;
