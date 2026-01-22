// src/features/operations/ship/components/ShipInputPanel.tsx

import React, { useMemo } from "react";
import HidScalePanel from "../HidScalePanel";
import { UI } from "../ui";
import type { CandidateWarehouse, FulfillmentScanWarehouse, FulfillmentMissingLine } from "../api";

type Props = {
  orderRef: string;
  onOrderRefChange: (v: string) => void;

  preparing: boolean;
  onPrepare: () => void;

  candidateWarehouses: CandidateWarehouse[];
  scanRows: FulfillmentScanWarehouse[];
  fulfillmentStatus: string | null;
  warehouseReason: string | null;

  selectedWarehouseId: number | null;
  onSelectWarehouseId: (v: number | null) => void;

  weightKg: string;
  onWeightChange: (v: string) => void;

  packagingWeightKg: string;
  onPackagingWeightChange: (v: string) => void;

  province: string;
  city: string;
  district: string;
  onProvinceChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onDistrictChange: (v: string) => void;

  loadingCalc: boolean;
  canCalc: boolean;
  onCalc: () => void;
};

function safeText(v: unknown): string {
  if (v == null) return "—";
  const s = String(v).trim();
  return s ? s : "—";
}

function findMissing(scan: FulfillmentScanWarehouse | undefined | null): FulfillmentMissingLine[] {
  const m = scan?.missing;
  return Array.isArray(m) ? m : [];
}

export const ShipInputPanel: React.FC<Props> = ({
  orderRef,
  onOrderRefChange,

  preparing,
  onPrepare,

  candidateWarehouses,
  scanRows,
  fulfillmentStatus,
  warehouseReason,

  selectedWarehouseId,
  onSelectWarehouseId,

  weightKg,
  onWeightChange,
  packagingWeightKg,
  onPackagingWeightChange,

  province,
  city,
  district,
  onProvinceChange,
  onCityChange,
  onDistrictChange,

  loadingCalc,
  canCalc,
  onCalc,
}) => {
  const candidates = useMemo(() => {
    const list = Array.isArray(candidateWarehouses) ? candidateWarehouses : [];
    return [...list].sort((a, b) => {
      const pa = Number(a.priority ?? 100);
      const pb = Number(b.priority ?? 100);
      if (pa !== pb) return pa - pb;
      return Number(a.warehouse_id) - Number(b.warehouse_id);
    });
  }, [candidateWarehouses]);

  const scanMap = useMemo(() => {
    const m = new Map<number, FulfillmentScanWarehouse>();
    for (const r of scanRows ?? []) {
      m.set(Number(r.warehouse_id), r);
    }
    return m;
  }, [scanRows]);

  const okCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const r = scanMap.get(Number(c.warehouse_id));
      return r && String(r.status) === "OK";
    });
  }, [candidates, scanMap]);

  const blocked = String(fulfillmentStatus || "").toUpperCase() === "FULFILLMENT_BLOCKED";

  function labelOf(c: CandidateWarehouse): string {
    const idLabel = `WH-${c.warehouse_id}`;
    const name = safeText(c.warehouse_name);
    const code = (c.warehouse_code || "").trim();
    const suffix = code ? `（${code}）` : "";
    return `${idLabel} · ${name}${suffix}`.trim();
  }

  function statusText(s: string): string {
    const t = String(s || "").toUpperCase();
    if (t === "OK") return "可履约";
    if (t === "INSUFFICIENT") return "缺货";
    return t || "—";
  }

  return (
    <section className={UI.card}>
      <h2 className={UI.h2}>订单 / 重量</h2>

      <div className="mt-3 space-y-3">
        <div className="flex flex-col">
          <label className={UI.label}>订单号 / 平台单号</label>
          <input
            className={UI.input}
            placeholder="ORD:PDD:1:EXT123"
            value={orderRef}
            onChange={(e) => onOrderRefChange(e.target.value)}
            disabled={preparing || loadingCalc}
          />
        </div>

        <button
          type="button"
          className={UI.btnSecondary}
          disabled={preparing || !orderRef.trim()}
          onClick={onPrepare}
          title="根据订单省份路由找到候选仓，并扫描整单同仓是否可履约（不预设、不兜底）"
        >
          {preparing ? "准备中…" : "准备订单（候选仓扫描）"}
        </button>

        {warehouseReason ? <div className="text-xs text-slate-500">提示：{warehouseReason}</div> : null}

        {/* 扫描结果总提示 */}
        {blocked ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            当前订单在所有候选仓均无法整单同仓履约：建议退货/取消（不自动兜底）。
          </div>
        ) : null}

        {/* 候选仓扫描表 */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span>候选仓扫描（整单同仓）</span>
            <span className="text-xs text-slate-500">
              候选 {candidates.length} 个 / 可履约 {okCandidates.length} 个
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="px-3 py-4 text-sm text-slate-500">暂无候选仓（省级路由未命中或仓不可用）。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left w-12">序</th>
                    <th className="px-3 py-2 text-left">仓库</th>
                    <th className="px-3 py-2 text-left w-20">优先级</th>
                    <th className="px-3 py-2 text-left w-20">结果</th>
                    <th className="px-3 py-2 text-left">缺口</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c, idx) => {
                    const scan = scanMap.get(Number(c.warehouse_id));
                    const status = scan ? String(scan.status) : "—";
                    const miss = findMissing(scan);

                    const missingText =
                      miss.length === 0
                        ? "—"
                        : miss
                            .slice(0, 3)
                            .map((m) => `item=${m.item_id} need=${m.need} have=${m.available}`)
                            .join("；") + (miss.length > 3 ? ` … +${miss.length - 3}` : "");

                    return (
                      <tr key={c.warehouse_id} className="text-slate-800">
                        <td className="px-3 py-2 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2">{labelOf(c)}</td>
                        <td className="px-3 py-2 font-mono">{Number(c.priority ?? 100)}</td>
                        <td className="px-3 py-2">
                          {status === "OK" ? (
                            <span className="text-emerald-700 font-semibold">{statusText(status)}</span>
                          ) : (
                            <span className="text-rose-700 font-semibold">{statusText(status)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">{missingText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 仅允许选择 OK 仓 */}
        <div className="flex flex-col">
          <label className={UI.label}>选择起运仓（仅可选择“可履约”仓）*</label>
          <select
            className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base disabled:opacity-60"
            value={selectedWarehouseId == null ? "" : String(selectedWarehouseId)}
            disabled={preparing || loadingCalc || okCandidates.length === 0}
            onChange={(e) => {
              const v = e.target.value;
              onSelectWarehouseId(v ? Number(v) : null);
            }}
          >
            <option value="">
              {okCandidates.length > 0 ? "请选择可履约仓…" : blocked ? "无可履约仓（建议退货/取消）" : "暂无可履约仓"}
            </option>
            {okCandidates.map((c) => (
              <option key={c.warehouse_id} value={c.warehouse_id}>
                {labelOf(c)}
              </option>
            ))}
          </select>

          {!selectedWarehouseId ? (
            <div className="mt-1 text-sm text-amber-700">未选择起运仓时，禁止算价与发货。</div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className={UI.label}>包裹毛重(kg)</label>
            <input
              className={UI.inputMono}
              value={weightKg}
              onChange={(e) => onWeightChange(e.target.value)}
              disabled={preparing || loadingCalc}
            />
          </div>

          <div className="flex flex-col">
            <label className={UI.label}>包材重量(kg)</label>
            <input
              className={UI.inputMono}
              value={packagingWeightKg}
              onChange={(e) => onPackagingWeightChange(e.target.value)}
              disabled={preparing || loadingCalc}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className={UI.label}>省份</label>
            <input className={UI.input} value={province} onChange={(e) => onProvinceChange(e.target.value)} disabled={preparing || loadingCalc} />
          </div>

          <div className="flex flex-col">
            <label className={UI.label}>城市 / 区县</label>
            <div className="mt-1 flex gap-2">
              <input
                className="w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-base"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                disabled={preparing || loadingCalc}
              />
              <input
                className="w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-base"
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
                disabled={preparing || loadingCalc}
              />
            </div>
          </div>
        </div>

        <button type="button" className={UI.btnPrimary} disabled={!canCalc} onClick={onCalc}>
          {loadingCalc ? "计算中…" : "计算运费"}
        </button>

        <HidScalePanel onWeightLocked={(w) => onWeightChange(w.toFixed(3))} />

        <p className="text-sm text-slate-500">
          · 本流程不预设仓库、不兜底：先扫描候选仓可履约性，再由作业员选择起运仓。<br />
          · 若所有候选仓均缺货：建议退货/取消（不自动拆单、不自动跨仓）。<br />
          · 修改重量或地址将使旧报价失效，需要重新算价。
        </p>
      </div>
    </section>
  );
};

export default ShipInputPanel;
