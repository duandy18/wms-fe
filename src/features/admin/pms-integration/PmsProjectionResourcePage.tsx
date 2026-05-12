import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { Button } from "../../../components/ui/button";
import { StandardTable } from "../../../components/wmsdu/StandardTable";
import {
  checkPmsProjectionResource,
  fetchPmsProjectionRows,
  fetchPmsProjectionSyncRuns,
  syncPmsProjectionResource,
} from "./api";
import type {
  PmsProjectionCheckIssue,
  PmsProjectionCheckResult,
  PmsProjectionList,
  PmsProjectionResource,
  PmsProjectionSyncRun,
} from "./types";
import { PMS_PROJECTION_RESOURCE_MAP } from "./types";

type Props = {
  resource: PmsProjectionResource;
};

const REMOVED_FRONTEND_COLUMNS = new Set([
  "source_hash",
  "derivation_allowed",
  "pms_updated_at",
  "sync_version",
  "synced_at",
]);

const PROJECTION_COLUMN_LABELS: Record<PmsProjectionResource, Record<string, string>> = {
  items: {
    item_id: "商品 ID",
    sku: "SKU",
    name: "商品名称",
    spec: "规格",
    enabled: "商品状态",
    supplier_name: "供应商名称",
    supplier_code: "供应商编码",
    supplier_id: "供应商 ID",
    brand: "品牌",
    category: "分类",
    expiry_policy: "效期策略",
    shelf_life_value: "保质期数值",
    shelf_life_unit: "保质期单位",
    lot_source_policy: "批次策略",
    uom_governance_enabled: "包装治理",
  },
  suppliers: {
    supplier_id: "供应商 ID",
    supplier_code: "供应商编码",
    supplier_name: "供应商名称",
    active: "供应商状态",
    website: "网站",
  },
  uoms: {
    item_uom_id: "包装单位 ID",
    item_id: "商品 ID",
    uom: "单位编码",
    display_name: "显示名称",
    uom_name: "单位名称",
    ratio_to_base: "基础单位换算比",
    net_weight_kg: "净重 kg",
    is_base: "基础单位",
    is_purchase_default: "采购默认",
    is_inbound_default: "入库默认",
    is_outbound_default: "出库默认",
  },
  "sku-codes": {
    sku_code_id: "SKU 编码 ID",
    item_id: "商品 ID",
    sku_code: "SKU 编码",
    code_type: "编码类型",
    is_primary: "主编码",
    is_active: "编码状态",
    effective_from: "生效时间",
    effective_to: "失效时间",
  },
  barcodes: {
    barcode_id: "条码 ID",
    item_id: "商品 ID",
    item_uom_id: "包装单位 ID",
    barcode: "条码",
    symbology: "条码制式",
    active: "条码状态",
    is_primary: "主条码",
  },
};

const EXPIRY_POLICY_LABELS: Record<string, string> = {
  NONE: "无",
  REQUIRED: "有",
};

const SHELF_LIFE_UNIT_LABELS: Record<string, string> = {
  DAY: "天",
  WEEK: "周",
  MONTH: "月",
  YEAR: "年",
};

const LOT_SOURCE_POLICY_LABELS: Record<string, string> = {
  SUPPLIER_ONLY: "供应商",
  INTERNAL_ONLY: "内部",
};

const SKU_CODE_TYPE_LABELS: Record<string, string> = {
  PRIMARY: "主编码",
  ALIAS: "别名编码",
  LEGACY: "历史编码",
  MANUAL: "手工编码",
};

function removeFrontendOnlyColumns(projection: PmsProjectionList): PmsProjectionList {
  const columns = projection.columns.filter(
    (column) => !REMOVED_FRONTEND_COLUMNS.has(column),
  );

  const rows = projection.rows.map((row) => {
    const nextRow: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (!REMOVED_FRONTEND_COLUMNS.has(key)) {
        nextRow[key] = value;
      }
    }

    return nextRow;
  });

  return {
    ...projection,
    columns,
    rows,
  };
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").replace(/\.\d+/, "").replace(/Z$/, "");
}

function formatGenericValue(value: unknown): React.ReactNode {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return formatDateTime(value);
    }
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatProjectionValue(
  resource: PmsProjectionResource,
  columnKey: string,
  value: unknown,
): React.ReactNode {
  if (value == null || value === "") return "—";

  if (resource === "items" && columnKey === "enabled") {
    return value === true ? "有效" : "无效";
  }

  if (resource === "suppliers" && columnKey === "active") {
    return value === true ? "有效" : "无效";
  }

  if (resource === "sku-codes" && columnKey === "is_active") {
    return value === true ? "有效" : "无效";
  }

  if (resource === "barcodes" && columnKey === "active") {
    return value === true ? "有效" : "无效";
  }

  if (columnKey === "lot_source_policy") {
    return typeof value === "string"
      ? LOT_SOURCE_POLICY_LABELS[value] ?? "未配置"
      : "未配置";
  }

  if (columnKey === "expiry_policy") {
    return typeof value === "string" ? EXPIRY_POLICY_LABELS[value] ?? value : "—";
  }

  if (columnKey === "shelf_life_unit") {
    return typeof value === "string" ? SHELF_LIFE_UNIT_LABELS[value] ?? value : "—";
  }

  if (columnKey === "code_type") {
    return typeof value === "string" ? SKU_CODE_TYPE_LABELS[value] ?? value : "—";
  }

  return formatGenericValue(value);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "请求失败，请查看浏览器控制台或后端日志。";
}

function statusBadge(status: PmsProjectionSyncRun["status"]): React.ReactNode {
  const className =
    status === "SUCCESS"
      ? "bg-emerald-100 text-emerald-800"
      : status === "FAILED"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-900";

  const label =
    status === "SUCCESS" ? "成功" : status === "FAILED" ? "失败" : "运行中";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function projectionColumnLabel(
  resource: PmsProjectionResource,
  columnKey: string,
): string {
  return PROJECTION_COLUMN_LABELS[resource][columnKey] ?? columnKey;
}

export default function PmsProjectionResourcePage({ resource }: Props) {
  const config = PMS_PROJECTION_RESOURCE_MAP[resource];

  const [projection, setProjection] = useState<PmsProjectionList | null>(null);
  const [syncRuns, setSyncRuns] = useState<PmsProjectionSyncRun[]>([]);
  const [checkResult, setCheckResult] = useState<PmsProjectionCheckResult | null>(null);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [rows, runs] = await Promise.all([
        fetchPmsProjectionRows({
          resource,
          limit,
          offset,
          q: query,
        }),
        fetchPmsProjectionSyncRuns({
          resource,
          limit: 10,
        }),
      ]);

      setProjection(removeFrontendOnlyColumns(rows));
      setSyncRuns(runs.runs);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit, offset, query, resource]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo(() => {
    const keys = projection?.columns ?? [];

    return keys.map((key) => ({
      key,
      header: projectionColumnLabel(resource, key),
      align: "center" as const,
      render: (row: Record<string, unknown>) =>
        formatProjectionValue(resource, key, row[key]),
    }));
  }, [projection?.columns, resource]);

  const rows = projection?.rows ?? [];
  const total = projection?.total ?? 0;
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    setError(null);

    try {
      const result = await syncPmsProjectionResource(resource);
      setMessage(
        `同步完成：读取 ${result.run.fetched} 行，写入 ${result.run.upserted} 行，页数 ${result.run.pages}。`,
      );
      await load();
    } catch (err) {
      setError(errorMessage(err));
      await load();
    } finally {
      setSyncing(false);
    }
  }

  async function handleCheck() {
    setChecking(true);
    setMessage(null);
    setError(null);

    try {
      const result = await checkPmsProjectionResource(resource);
      setCheckResult(result);
      setMessage(
        result.ok
          ? "检查通过：当前 projection 未发现异常。"
          : `检查完成：发现 ${result.issue_count} 个问题。`,
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  function applyQuery() {
    setOffset(0);
    setQuery(queryDraft.trim());
  }

  return (
    <div className="space-y-5 p-6">
      <PageTitle
        title={config.label}
        description={config.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              to="/admin/pms-integration"
            >
              返回总览
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => void load()}
              disabled={loading || syncing || checking}
            >
              {loading ? "刷新中…" : "刷新"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCheck()}
              disabled={loading || syncing || checking}
            >
              {checking ? "检查中…" : "检查当前投影"}
            </Button>
            <Button
              type="button"
              onClick={() => void handleSync()}
              disabled={loading || syncing || checking}
            >
              {syncing ? "同步中…" : "同步当前投影"}
            </Button>
          </div>
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-xs text-slate-500">资源</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{resource}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">projection 表</div>
            <div className="mt-1 font-mono text-sm text-slate-900">{config.tableName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">总行数</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{total}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">当前页</div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {total === 0 ? 0 : Math.floor(offset / limit) + 1}
            </div>
          </div>
        </div>
      </section>

      {(error || message) && (
        <div
          className={
            error
              ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          }
        >
          {error || message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={queryDraft}
            onChange={(event) => setQueryDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyQuery();
            }}
            className="h-10 min-w-72 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-sky-500"
            placeholder="按当前 projection 可搜索字段查询"
          />
          <Button type="button" variant="outline" onClick={applyQuery} disabled={loading}>
            查询
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setQueryDraft("");
              setQuery("");
              setOffset(0);
            }}
            disabled={loading}
          >
            重置
          </Button>
        </div>
      </section>

      <StandardTable<Record<string, unknown>>
        title="只读 projection 数据"
        dense
        columns={columns}
        data={rows}
        getRowKey={(row, index) => {
          const value = row[config.primaryColumn];
          return typeof value === "string" || typeof value === "number"
            ? value
            : index;
        }}
        emptyText={loading ? "加载中…" : "暂无 projection 数据"}
        footer={
          <div className="flex items-center justify-between">
            <span>
              共 {total} 行，当前显示 {rows.length} 行。
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={!canPrev || loading}
              >
                上一页
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOffset(offset + limit)}
                disabled={!canNext || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        }
      />

      <StandardTable<PmsProjectionSyncRun>
        title="最近同步日志"
        dense
        columns={[
          {
            key: "status",
            header: "状态",
            render: (row) => statusBadge(row.status),
          },
          {
            key: "fetched",
            header: "读取",
            align: "right",
          },
          {
            key: "upserted",
            header: "写入",
            align: "right",
          },
          {
            key: "pages",
            header: "页数",
            align: "right",
          },
          {
            key: "duration_ms",
            header: "耗时",
            render: (row) => (row.duration_ms == null ? "—" : `${row.duration_ms} ms`),
          },
          {
            key: "finished_at",
            header: "完成时间",
            render: (row) => formatDateTime(row.finished_at),
          },
          {
            key: "error_message",
            header: "错误",
            render: (row) => row.error_message || "—",
          },
        ]}
        data={syncRuns}
        getRowKey={(row) => row.id}
        emptyText="暂无同步日志"
      />

      {checkResult && (
        <StandardTable<PmsProjectionCheckIssue>
          title={`一致性检查结果：${checkResult.ok ? "通过" : `${checkResult.issue_count} 个问题`}`}
          dense
          columns={[
            {
              key: "issue_type",
              header: "问题类型",
            },
            {
              key: "source_id",
              header: "来源 ID",
            },
            {
              key: "message",
              header: "说明",
            },
            {
              key: "item_id",
              header: "商品 ID",
              render: (row) => formatGenericValue(row.item_id),
            },
            {
              key: "item_uom_id",
              header: "包装单位 ID",
              render: (row) => formatGenericValue(row.item_uom_id),
            },
            {
              key: "supplier_id",
              header: "供应商 ID",
              render: (row) => formatGenericValue(row.supplier_id),
            },
            {
              key: "projection_item_id",
              header: "投影商品 ID",
              render: (row) => formatGenericValue(row.projection_item_id),
            },
          ]}
          data={checkResult.issues}
          getRowKey={(row, index) => `${row.issue_type}:${row.source_id}:${index}`}
          emptyText="未发现异常"
        />
      )}
    </div>
  );
}
