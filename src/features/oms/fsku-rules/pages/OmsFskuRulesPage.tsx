// src/features/oms/fsku-rules/pages/OmsFskuRulesPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { fetchItemListRows } from "../../../pms/items/api/itemListOwnerApi";
import type { ItemListRow } from "../../../pms/items/contracts/itemList";
import {
  createOmsFskuDraft,
  getOmsFskuDetail,
  listOmsFskus,
  patchOmsFskuName,
  publishOmsFsku,
  replaceOmsFskuExpression,
  retireOmsFsku,
} from "../api/fskuApi";
import type { OmsFskuDetail, OmsFskuListItem, OmsFskuStatus } from "../types";

type Banner = { kind: "success" | "error"; text: string } | null;

type DraftComponent = {
  localId: number;
  skuCode: string;
  qty: string;
  allocUnitPrice: string;
};

const inputCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const buttonBase = "rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60";

function toMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function decimalText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return "";
  return trimmed;
}

function buildExpr(rows: DraftComponent[]): string {
  return rows
    .map((row) => {
      const sku = row.skuCode.trim();
      const qty = decimalText(row.qty);
      const price = decimalText(row.allocUnitPrice);
      if (!sku || !qty || !price) return "";
      return `${sku}*${qty}*${price}`;
    })
    .filter(Boolean)
    .join(" + ");
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { hour12: false });
}

function formatDecimal(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return String(n);
}

function statusLabel(status: OmsFskuStatus): string {
  if (status === "draft") return "草稿";
  if (status === "published") return "已发布";
  return "已归档";
}

function statusCls(status: OmsFskuStatus): string {
  if (status === "draft") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "published") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function parseExprToRows(expr: string): DraftComponent[] {
  const rows = expr
    .split("+")
    .map((part, index) => {
      const pieces = part.trim().split("*").map((x) => x.trim());
      if (pieces.length < 3) return null;

      const [skuCode, qty, allocUnitPrice] = pieces;
      if (!skuCode || !qty || !allocUnitPrice) return null;

      return {
        localId: Date.now() + index,
        skuCode,
        qty,
        allocUnitPrice,
      };
    })
    .filter((row): row is DraftComponent => row !== null);

  return rows.length
    ? rows
    : [{ localId: Date.now(), skuCode: "", qty: "1", allocUnitPrice: "1" }];
}

function makeEmptyComponent(): DraftComponent {
  return {
    localId: Date.now(),
    skuCode: "",
    qty: "1",
    allocUnitPrice: "1",
  };
}

export default function OmsFskuRulesPage() {
  const [skuRows, setSkuRows] = useState<ItemListRow[]>([]);
  const [fskuRows, setFskuRows] = useState<OmsFskuListItem[]>([]);
  const [detailByFskuId, setDetailByFskuId] = useState<Record<number, OmsFskuDetail>>({});
  const [expandedFskuId, setExpandedFskuId] = useState<number | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState<OmsFskuStatus | "all">("all");
  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [components, setComponents] = useState<DraftComponent[]>([makeEmptyComponent()]);
  const [selectedFskuId, setSelectedFskuId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const expr = useMemo(() => buildExpr(components), [components]);
  const selectedFsku = useMemo(
    () => fskuRows.find((row) => row.id === selectedFskuId) ?? null,
    [fskuRows, selectedFskuId],
  );

  const activeSkuRows = useMemo(
    () =>
      skuRows
        .filter((row) => row.enabled && row.sku.trim())
        .sort((a, b) => a.sku.localeCompare(b.sku)),
    [skuRows],
  );

  const shape = components.filter((row) => row.skuCode.trim()).length > 1 ? "bundle" : "single";
  const canEditExpression = selectedFsku == null || selectedFsku.status === "draft";

  const loadReference = useCallback(async () => {
    const rows = await fetchItemListRows({ limit: 500 });
    setSkuRows(rows);
  }, []);

  const loadFskus = useCallback(async () => {
    setLoading(true);
    setBanner(null);

    try {
      const data = await listOmsFskus({
        query,
        status: statusFilter,
        limit: 200,
        offset: 0,
      });
      setFskuRows(data.items);
      setTotal(data.total);
      setDetailByFskuId({});
      setExpandedFskuId(null);
    } catch (err) {
      setFskuRows([]);
      setTotal(0);
      setBanner({ kind: "error", text: toMessage(err, "加载 FSKU 组合规则失败") });
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);

  useEffect(() => {
    void loadReference();
  }, [loadReference]);

  useEffect(() => {
    void loadFskus();
  }, [loadFskus]);

  function resetEditor(): void {
    setSelectedFskuId(null);
    setName("");
    setCode("");
    setComponents([makeEmptyComponent()]);
  }

  function selectFsku(row: OmsFskuListItem): void {
    setSelectedFskuId(row.id);
    setName(row.name);
    setCode(row.code);
    setComponents(parseExprToRows(row.fsku_expr));
    setBanner(null);
  }

  async function toggleFskuDetail(row: OmsFskuListItem): Promise<void> {
    if (expandedFskuId === row.id) {
      setExpandedFskuId(null);
      return;
    }

    setExpandedFskuId(row.id);

    if (detailByFskuId[row.id]) {
      return;
    }

    setDetailLoadingId(row.id);
    setBanner(null);

    try {
      const detail = await getOmsFskuDetail(row.id);
      setDetailByFskuId((prev) => ({
        ...prev,
        [row.id]: detail,
      }));
    } catch (err) {
      setBanner({ kind: "error", text: toMessage(err, "加载 FSKU 组件明细失败") });
    } finally {
      setDetailLoadingId(null);
    }
  }

  function updateComponent(localId: number, patch: Partial<DraftComponent>): void {
    setComponents((prev) =>
      prev.map((row) => (row.localId === localId ? { ...row, ...patch } : row)),
    );
  }

  function addComponent(): void {
    setComponents((prev) => [...prev, makeEmptyComponent()]);
  }

  function removeComponent(localId: number): void {
    setComponents((prev) => {
      const next = prev.filter((row) => row.localId !== localId);
      return next.length ? next : [makeEmptyComponent()];
    });
  }

  async function saveDraft(): Promise<void> {
    const nm = name.trim();
    if (!nm) {
      setBanner({ kind: "error", text: "请填写 FSKU 名称。" });
      return;
    }
    if (!expr) {
      setBanner({ kind: "error", text: "请至少选择一个 SKU，并填写有效数量与分摊单价。" });
      return;
    }
    if (!canEditExpression) {
      setBanner({ kind: "error", text: "已发布或已归档的 FSKU 不允许修改表达式；请新建 FSKU。" });
      return;
    }

    setSaving(true);
    setBanner(null);

    try {
      if (selectedFsku && selectedFsku.status === "draft") {
        await replaceOmsFskuExpression(selectedFsku.id, { fsku_expr: expr });
        if (nm !== selectedFsku.name) {
          await patchOmsFskuName(selectedFsku.id, nm);
        }
        setBanner({ kind: "success", text: `草稿已更新：#${selectedFsku.id}` });
      } else {
        const created = await createOmsFskuDraft({
          name: nm,
          code: code.trim() || null,
          shape,
          fsku_expr: expr,
        });
        setSelectedFskuId(created.id);
        setBanner({ kind: "success", text: `草稿已创建：#${created.id}` });
      }

      await loadFskus();
    } catch (err) {
      setBanner({ kind: "error", text: toMessage(err, "保存 FSKU 草稿失败") });
    } finally {
      setSaving(false);
    }
  }

  async function publishRow(row: OmsFskuListItem): Promise<void> {
    if (row.status !== "draft") return;

    setSaving(true);
    setBanner(null);

    try {
      await publishOmsFsku(row.id);
      setBanner({ kind: "success", text: `FSKU 已发布：#${row.id}` });
      await loadFskus();
    } catch (err) {
      setBanner({ kind: "error", text: toMessage(err, "发布 FSKU 失败") });
    } finally {
      setSaving(false);
    }
  }

  async function retireRow(row: OmsFskuListItem): Promise<void> {
    if (row.status !== "published") return;

    const ok = window.confirm(`确认归档 FSKU「${row.code}」？已绑定店铺商品代码时后端会拒绝。`);
    if (!ok) return;

    setSaving(true);
    setBanner(null);

    try {
      await retireOmsFsku(row.id);
      setBanner({ kind: "success", text: `FSKU 已归档：#${row.id}` });
      await loadFskus();
    } catch (err) {
      setBanner({ kind: "error", text: toMessage(err, "归档 FSKU 失败") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">FSKU 组合规则</h1>
        <p className="mt-1 text-sm text-slate-500">
          FSKU 属于 OMS 销售规格主数据；组件引用 PMS 商品 / SKU / 包装单位。页面只维护表达式：仓库 SKU × 数量 × 分摊单价；后端负责解析表达式并生成组件快照。
        </p>
      </header>

      {banner ? (
        <div
          className={
            banner.kind === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {banner.text}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">编辑区：选择仓库 SKU 生成 FSKU</h2>
            <p className="mt-1 text-xs text-slate-500">
              示例：SKU123*2*0.15 + SKU456*3*0.20。0.15 / 0.20 表示该 SKU 在 FSKU 中的分摊单价。
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={resetEditor}
            disabled={saving}
          >
            新建空白草稿
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">FSKU 名称</span>
            <input
              className={`${inputCls} w-full`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：鸡肉冻干猫粮 40g×6 + 三文鱼冻干猫粮 40g×3"
              disabled={!canEditExpression || saving}
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">FSKU code（可选）</span>
            <input
              className={`${inputCls} w-full font-mono`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="不填则由后端兜底"
              disabled={selectedFsku != null || saving}
            />
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[46%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">仓库 SKU</th>
                <th className="px-3 py-2">数量</th>
                <th className="px-3 py-2">分摊单价</th>
                <th className="px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {components.map((row) => (
                <tr key={row.localId} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <select
                      className={`${inputCls} w-full font-mono`}
                      value={row.skuCode}
                      onChange={(e) => updateComponent(row.localId, { skuCode: e.target.value })}
                      disabled={!canEditExpression || saving}
                    >
                      <option value="">选择 SKU</option>
                      {activeSkuRows.map((skuRow) => (
                        <option key={`${skuRow.item_id}-${skuRow.sku}`} value={skuRow.sku}>
                          {skuRow.sku} · {skuRow.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={`${inputCls} w-full`}
                      value={row.qty}
                      onChange={(e) => updateComponent(row.localId, { qty: e.target.value })}
                      disabled={!canEditExpression || saving}
                      placeholder="例如 2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={`${inputCls} w-full`}
                      value={row.allocUnitPrice}
                      onChange={(e) => updateComponent(row.localId, { allocUnitPrice: e.target.value })}
                      disabled={!canEditExpression || saving}
                      placeholder="例如 0.15"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => removeComponent(row.localId)}
                      disabled={!canEditExpression || saving}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={addComponent}
            disabled={!canEditExpression || saving}
          >
            增加 SKU
          </button>

          <button
            type="button"
            className={`${buttonBase} bg-sky-600 text-white hover:bg-sky-700`}
            onClick={() => void saveDraft()}
            disabled={saving || !canEditExpression}
          >
            {selectedFsku?.status === "draft" ? "保存草稿修改" : "保存为草稿"}
          </button>

        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-500">当前 fsku_expr</div>
          <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
            {expr || "请选择 SKU 并填写数量、分摊单价"}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">列表区：销售规格 FSKU → 仓库 SKU 组合</h2>
            <p className="mt-1 text-xs text-slate-500">草稿可继续编辑表达式；已发布可被订单解析引用，只能归档；已归档只读。</p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label>
              <span className="mb-1 block text-xs text-slate-500">状态</span>
              <select
                className={inputCls}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OmsFskuStatus | "all")}
              >
                <option value="all">全部</option>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="retired">已归档</option>
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs text-slate-500">搜索</span>
              <input
                className={inputCls}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="FSKU code / 名称"
              />
            </label>

            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => void loadFskus()}
              disabled={loading}
            >
              {loading ? "刷新中..." : "刷新"}
            </button>
          </div>
        </div>

        <div className="mb-3 text-xs text-slate-500">总数：{total}</div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">FSKU code</th>
                <th className="px-3 py-2">名称</th>
                <th className="px-3 py-2">状态</th>
                <th className="px-3 py-2">组件数</th>
                <th className="px-3 py-2">fsku_expr</th>
                <th className="px-3 py-2">更新时间</th>
                <th className="px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {fskuRows.map((row) => {
                const detail = detailByFskuId[row.id] ?? null;
                const expanded = expandedFskuId === row.id;
                const loadingDetail = detailLoadingId === row.id;
                const canPublishRow = row.status === "draft" && row.component_count > 0;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={
                        selectedFskuId === row.id
                          ? "border-t border-slate-100 bg-sky-50/60"
                          : "border-t border-slate-100"
                      }
                    >
                      <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusCls(row.status)}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">{row.component_count}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.fsku_expr}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{formatDateTime(row.updated_at)}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={() => void toggleFskuDetail(row)}
                          >
                            {expanded ? "收起" : "展开"}
                          </button>
                          <button
                            type="button"
                            className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => selectFsku(row)}
                            disabled={saving || row.status !== "draft"}
                            title={row.status === "draft" ? "回填到上方编辑区" : "仅草稿可编辑"}
                          >
                            草稿
                          </button>
                          <button
                            type="button"
                            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => void publishRow(row)}
                            disabled={saving || !canPublishRow}
                            title={
                              row.status !== "draft"
                                ? "仅草稿可发布"
                                : row.component_count <= 0
                                  ? "请先配置至少 1 个 SKU 组件"
                                  : "发布 FSKU"
                            }
                          >
                            发布
                          </button>
                          <button
                            type="button"
                            className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => void retireRow(row)}
                            disabled={saving || row.status !== "published"}
                          >
                            归档
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded ? (
                      <tr className="border-t border-slate-100 bg-slate-50/70">
                        <td colSpan={7} className="px-3 py-3">
                          {loadingDetail ? (
                            <div className="text-xs text-slate-500">加载组件明细中...</div>
                          ) : detail ? (
                            detail.components.length ? (
                              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                <table className="min-w-[900px] w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                      <th className="px-3 py-2">序号</th>
                                      <th className="px-3 py-2">组件 SKU</th>
                                      <th className="px-3 py-2">数量</th>
                                      <th className="px-3 py-2">分摊单价</th>
                                      <th className="px-3 py-2">商品</th>
                                      <th className="px-3 py-2">单位</th>
                                      <th className="px-3 py-2">item_id</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detail.components.map((component) => (
                                      <tr
                                        key={`${row.id}-${component.sort_order}-${component.component_sku_code}`}
                                        className="border-t border-slate-100"
                                      >
                                        <td className="px-3 py-2">{component.sort_order}</td>
                                        <td className="px-3 py-2 font-mono">{component.component_sku_code}</td>
                                        <td className="px-3 py-2">{formatDecimal(component.qty_per_fsku)}</td>
                                        <td className="px-3 py-2">{formatDecimal(component.alloc_unit_price)}</td>
                                        <td className="px-3 py-2">{component.item_name_snapshot}</td>
                                        <td className="px-3 py-2">{component.uom_snapshot}</td>
                                        <td className="px-3 py-2 font-mono">{component.resolved_item_id}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">暂无组件明细。</div>
                            )
                          ) : (
                            <div className="text-xs text-slate-500">未加载组件明细。</div>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {!loading && fskuRows.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">暂无 FSKU 组合规则。</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
