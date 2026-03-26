// src/features/tms/shipment/cockpit/components/ShipmentPackagePlanCard.tsx
//
// 分拆说明：
// - 本组件负责顺序卡 2：订单拆包与报价。
// - 本卡已从“包裹与重量” + “报价与承运商”两张卡合并而来。
// - 当前页面语义收口为：
//   1) 增加包裹
//   2) 每个包裹录入重量
//   3) 每个包裹选择发货仓
//   4) 每个包裹独立算价
//   5) 每个包裹查看候选报价并人工选择承运商
// - 当前已接真实联动：
//   - 新增包裹
//   - 更新重量 / 发货仓
//   - 包裹级算价
//   - 包裹级确认承运商
// - 本轮收口：
//   - 发货仓改为活动仓库下拉，不再手填仓库 ID
//   - 保存按钮完成态绑定真实已保存的重量 + 发货仓
//   - 保存成功 / 选择承运商成功提示改为 controller 真成功后回写
//   - 已选择承运商后，按钮改为“已选择”
// - 维护约束：
//   - 不再使用“1包 / 2包 / 3包”预设按钮
//   - 一个包裹卡就是一个完整处理单元
//   - 包裹保存 与 承运商选择 仍按后端接口边界拆开

import React, { useEffect, useMemo, useState } from "react";
import { fetchActiveWarehouses } from "../../../../admin/warehouses/api";
import type { WarehouseListItem } from "../../../../admin/warehouses/types";
import { UI } from "../ui";
import type {
  ShipmentPackagePlan,
  ShipmentQuoteCandidate,
} from "../useShipmentCockpitController";

type Props = {
  warehouseName: string;
  packageCount: number;
  packages: ShipmentPackagePlan[];
  quoteCandidates: ShipmentQuoteCandidate[];
  creatingPackage: boolean;
  quotingByPackage: Record<number, boolean>;
  confirmingByPackage: Record<number, boolean>;
  savingByPackage: Record<number, boolean>;
  packageActionMessageByPackage: Record<number, string>;
  onCreatePackage: () => void;
  onUpdatePackage: (
    packageNo: number,
    payload: {
      weight_kg?: number;
      warehouse_id?: number;
    },
  ) => void;
  onQuotePackage: (packageNo: number) => void;
  onConfirmQuote: (packageNo: number, providerId: number) => void;
};

type PackageEditorState = {
  weight: string;
  warehouseId: string;
};

function packageStatusBadgeClass(
  status: ShipmentPackagePlan["packageStatus"],
): string {
  if (status === "已就绪") return `${UI.badgeBase} ${UI.badgeGreen}`;
  if (status === "待选承运商") return `${UI.badgeBase} ${UI.badgeAmber}`;
  if (status === "待报价") return `${UI.badgeBase} ${UI.badgeBlue}`;
  return `${UI.badgeBase} ${UI.badgeSlate}`;
}

function quoteStatusText(status: ShipmentPackagePlan["quoteStatus"]): string {
  if (status === "有效") return "有效";
  if (status === "待重新报价") return "待重新报价";
  return "未报价";
}

function groupByPackageNo(
  candidates: ShipmentQuoteCandidate[],
): Record<number, ShipmentQuoteCandidate[]> {
  return candidates.reduce<Record<number, ShipmentQuoteCandidate[]>>(
    (acc, item) => {
      if (!acc[item.packageNo]) {
        acc[item.packageNo] = [];
      }
      acc[item.packageNo].push(item);
      return acc;
    },
    {},
  );
}

function buildWarehouseOptionLabel(item: WarehouseListItem): string {
  const code = (item.code || "").trim();
  return code ? `${item.name}（${code}）` : item.name;
}

function isPersistedWeightAndWarehouseSaved(
  pkg: ShipmentPackagePlan,
  editor: PackageEditorState,
): boolean {
  if (!pkg.actualWeightKg.trim()) {
    return false;
  }
  if (typeof pkg.warehouseId !== "number") {
    return false;
  }

  const editorWeight = editor.weight.trim();
  const editorWarehouseId = editor.warehouseId.trim();

  if (!editorWeight || !editorWarehouseId) {
    return false;
  }

  const persistedWeight = Number(pkg.actualWeightKg);
  const currentWeight = Number(editorWeight);

  if (!Number.isFinite(persistedWeight) || !Number.isFinite(currentWeight)) {
    return false;
  }

  return (
    Math.abs(persistedWeight - currentWeight) < 0.000001 &&
    editorWarehouseId === String(pkg.warehouseId)
  );
}

const ShipmentPackagePlanCard: React.FC<Props> = ({
  warehouseName,
  packageCount,
  packages,
  quoteCandidates,
  creatingPackage,
  quotingByPackage,
  confirmingByPackage,
  savingByPackage,
  packageActionMessageByPackage,
  onCreatePackage,
  onUpdatePackage,
  onQuotePackage,
  onConfirmQuote,
}) => {
  const grouped = useMemo(() => groupByPackageNo(quoteCandidates), [quoteCandidates]);

  const [editors, setEditors] = useState<Record<number, PackageEditorState>>({});
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadWarehouses() {
      setWarehousesLoading(true);
      setWarehousesError("");

      try {
        const rows = await fetchActiveWarehouses();
        if (!cancelled) {
          setWarehouses(Array.isArray(rows) ? rows : []);
        }
      } catch (err) {
        if (!cancelled) {
          setWarehouses([]);
          setWarehousesError(
            err instanceof Error ? err.message : "加载活动仓库失败",
          );
        }
      } finally {
        if (!cancelled) {
          setWarehousesLoading(false);
        }
      }
    }

    void loadWarehouses();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setEditors((prev) => {
      const next = { ...prev };
      for (const pkg of packages) {
        next[pkg.packageNo] = {
          weight: pkg.actualWeightKg || "",
          warehouseId:
            typeof pkg.warehouseId === "number" ? String(pkg.warehouseId) : "",
        };
      }
      return next;
    });
  }, [packages]);

  const warehouseMap = useMemo(() => {
    return new Map(warehouses.map((item) => [item.id, item]));
  }, [warehouses]);

  function updateEditor(
    packageNo: number,
    patch: Partial<PackageEditorState>,
  ): void {
    setEditors((prev) => ({
      ...prev,
      [packageNo]: {
        ...(prev[packageNo] || { weight: "", warehouseId: "" }),
        ...patch,
      },
    }));
  }

  function handleSave(pkg: ShipmentPackagePlan): void {
    const editor = editors[pkg.packageNo] || { weight: "", warehouseId: "" };
    const weightText = editor.weight.trim();
    const warehouseText = editor.warehouseId.trim();

    const payload: {
      weight_kg?: number;
      warehouse_id?: number;
    } = {};

    if (weightText) {
      const weight = Number(weightText);
      if (Number.isFinite(weight) && weight > 0) {
        payload.weight_kg = weight;
      }
    }

    if (warehouseText) {
      const warehouseId = Number(warehouseText);
      if (Number.isInteger(warehouseId) && warehouseId >= 1) {
        payload.warehouse_id = warehouseId;
      }
    }

    onUpdatePackage(pkg.packageNo, payload);
  }

  function renderWarehouseDisplay(warehouseId: number | null): string {
    if (typeof warehouseId !== "number") {
      return "未选择";
    }
    const hit = warehouseMap.get(warehouseId);
    if (!hit) {
      return `仓库ID:${warehouseId}`;
    }
    return buildWarehouseOptionLabel(hit);
  }

  return (
    <section className={UI.card}>
      <div className={UI.cardHeader}>
        <div className={UI.cardTitleWrap}>
          <span className={UI.stageNo}>2</span>
          <div>
            <h2 className={UI.h2}>订单拆包与报价</h2>
            <div className={UI.helper}>
              逐个包裹完成重量、发货仓、算价和承运商选择
            </div>
          </div>
        </div>

        <div className={UI.btnGroup}>
          <button
            type="button"
            className={UI.btnPrimary}
            onClick={onCreatePackage}
            disabled={creatingPackage}
          >
            {creatingPackage ? "增加中..." : "增加包裹"}
          </button>
        </div>
      </div>

      <div className={UI.summaryBox}>
        <div className={UI.kvRow}>
          <span className={UI.kvLabel}>当前包裹数</span>
          <span className={`${UI.kvValue} ${UI.mono}`}>{packageCount}</span>
        </div>
        <div className={UI.kvRow}>
          <span className={UI.kvLabel}>仓库展示</span>
          <span className={UI.kvValue}>{warehouseName || "待分配"}</span>
        </div>
      </div>

      {warehousesError ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
          {warehousesError}
        </div>
      ) : null}

      <div className={`${UI.packageList} mt-4`}>
        {packages.map((pkg) => {
          const candidates = grouped[pkg.packageNo] ?? [];
          const editor = editors[pkg.packageNo] || { weight: "", warehouseId: "" };
          const saving = Boolean(savingByPackage[pkg.packageNo]);
          const quoting = Boolean(quotingByPackage[pkg.packageNo]);
          const confirming = Boolean(confirmingByPackage[pkg.packageNo]);
          const saveCompleted = isPersistedWeightAndWarehouseSaved(pkg, editor);
          const actionMessage = packageActionMessageByPackage[pkg.packageNo] || "";

          return (
            <div key={pkg.packageNo} className={UI.packageCard}>
              <div className={UI.packageHeader}>
                <div className="flex items-center gap-3">
                  <h3 className={UI.h3}>包裹 {pkg.packageNo}</h3>
                  <span className={packageStatusBadgeClass(pkg.packageStatus)}>
                    {pkg.packageStatus}
                  </span>
                </div>
              </div>

              {actionMessage ? (
                <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {actionMessage}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div>
                  <label className={UI.label}>重量(kg)</label>
                  <input
                    className={UI.inputMono}
                    value={editor.weight}
                    onChange={(e) =>
                      updateEditor(pkg.packageNo, { weight: e.target.value })
                    }
                    placeholder="例如 1.25"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className={UI.label}>发货仓</label>
                  <select
                    className={UI.input}
                    value={editor.warehouseId}
                    onChange={(e) =>
                      updateEditor(pkg.packageNo, {
                        warehouseId: e.target.value,
                      })
                    }
                    disabled={saving || warehousesLoading}
                  >
                    <option value="">
                      {warehousesLoading ? "仓库加载中..." : "请选择发货仓"}
                    </option>
                    {warehouses.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {buildWarehouseOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={UI.btnSecondary}
                  onClick={() => handleSave(pkg)}
                  disabled={saving || saveCompleted}
                >
                  {saving
                    ? "保存中..."
                    : saveCompleted
                      ? "重量和发货仓已保存"
                      : "保存重量与发货仓"}
                </button>

                <button
                  type="button"
                  className={UI.btnSecondary}
                  onClick={() => onQuotePackage(pkg.packageNo)}
                  disabled={quoting}
                >
                  {quoting ? "算价中..." : "算价"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                <div className={UI.summaryBox}>
                  <div className={UI.summaryList}>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>报价状态</span>
                      <span className={UI.kvValue}>
                        {quoteStatusText(pkg.quoteStatus)}
                      </span>
                    </div>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>当前报价</span>
                      <span className={`${UI.kvValue} ${UI.mono}`}>
                        {pkg.quoteAmount ? `￥${pkg.quoteAmount}` : "—"}
                      </span>
                    </div>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>承运商</span>
                      <span className={UI.kvValue}>{pkg.carrierName || "未选择"}</span>
                    </div>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>发货仓</span>
                      <span className={UI.kvValue}>
                        {renderWarehouseDisplay(pkg.warehouseId)}
                      </span>
                    </div>
                    <div className={UI.kvRow}>
                      <span className={UI.kvLabel}>已选承运商ID</span>
                      <span className={`${UI.kvValue} ${UI.mono}`}>
                        {pkg.selectedProviderId ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={UI.tableWrap}>
                  <div className={UI.tableScroll}>
                    <table className={`${UI.table} table-fixed`}>
                      <thead className={UI.thead}>
                        <tr>
                          <th className={`${UI.th} w-1/2 text-left`}>承运商</th>
                          <th className={`${UI.th} w-1/4 text-right`}>价格</th>
                          <th className={`${UI.th} w-1/4 text-center`}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.length > 0 ? (
                          candidates.map((item, idx) => {
                            const isSelected =
                              pkg.selectedProviderId === item.providerId;

                            return (
                              <tr
                                key={`${item.packageNo}-${item.providerId}-${idx}`}
                                className={UI.tr}
                              >
                                <td className={`${UI.td} text-left`}>
                                  {item.carrierName}
                                </td>
                                <td className={`${UI.td} ${UI.mono} text-right`}>
                                  {item.amount ? `￥${item.amount}` : "—"}
                                </td>
                                <td className={`${UI.td} text-center`}>
                                  <button
                                    type="button"
                                    className={
                                      isSelected ? UI.btnPrimary : UI.btnSecondary
                                    }
                                    onClick={() =>
                                      onConfirmQuote(pkg.packageNo, item.providerId)
                                    }
                                    disabled={isSelected || confirming}
                                  >
                                    {isSelected
                                      ? "已选择"
                                      : confirming
                                        ? "确认中..."
                                        : "选择"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr className={UI.tr}>
                            <td
                              colSpan={3}
                              className={`${UI.td} text-center text-slate-500`}
                            >
                              暂无候选报价
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {packages.length === 0 ? (
          <div className={UI.summaryBox}>
            <div className={UI.helper}>当前暂无包裹，请先增加包裹。</div>
          </div>
        ) : null}
      </div>

      <div className={UI.sectionNote}>
        当前已接真实链路：新增包裹、保存重量/仓库、包裹级算价、人工确认承运商。
      </div>
    </section>
  );
};

export default ShipmentPackagePlanCard;
