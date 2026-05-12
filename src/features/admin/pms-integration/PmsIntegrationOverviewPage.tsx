import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { Button } from "../../../components/ui/button";
import { StandardTable } from "../../../components/wmsdu/StandardTable";
import {
  fetchPmsProjectionIntegrationStatus,
  fetchPmsProjectionSyncRuns,
} from "./api";
import type {
  PmsProjectionIntegrationStatus,
  PmsProjectionSyncRun,
} from "./types";
import {
  PMS_PROJECTION_RESOURCE_MAP,
  PMS_PROJECTION_RESOURCES,
} from "./types";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").replace(/\.\d+/, "").replace(/Z$/, "");
}

function statusBadge(status: PmsProjectionSyncRun["status"] | null): React.ReactNode {
  if (!status) {
    return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">暂无</span>;
  }

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

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "请求失败，请查看浏览器控制台或后端日志。";
}

export default function PmsIntegrationOverviewPage() {
  const [status, setStatus] = useState<PmsProjectionIntegrationStatus | null>(null);
  const [runs, setRuns] = useState<PmsProjectionSyncRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextStatus, nextRuns] = await Promise.all([
        fetchPmsProjectionIntegrationStatus(),
        fetchPmsProjectionSyncRuns({ limit: 10 }),
      ]);

      setStatus(nextStatus);
      setRuns(nextRuns.runs);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resourceRows = useMemo(() => {
    const byResource = new Map(
      (status?.resources ?? []).map((item) => [item.resource, item]),
    );

    return PMS_PROJECTION_RESOURCES.map((config) => {
      const row = byResource.get(config.resource);
      return {
        config,
        status: row ?? null,
      };
    });
  }, [status]);

  return (
    <div className="space-y-5 p-6">
      <PageTitle
        title="PMS 接入管理"
        description="WMS 只消费 PMS projection。本页用于查看 5 张 projection 的同步状态、行数和最近同步运行日志，不提供 PMS 主数据维护入口。"
        actions={
          <Button type="button" onClick={() => void load()} disabled={loading}>
            {loading ? "刷新中…" : "刷新"}
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">PMS API 配置</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">
            {status?.pms_api_base_url_configured ? "已配置" : "未配置"}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            第一阶段不在 WMS 前端展示密钥和授权配置；授权能力后置到 ERP / 平台级授权中心。
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">projection 资源</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">
            {PMS_PROJECTION_RESOURCES.length} 张表
          </div>
          <p className="mt-2 text-xs text-slate-500">
            商品、供应商、包装单位、SKU 编码、条码。
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">最近同步记录</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">
            {runs.length} 条
          </div>
          <p className="mt-2 text-xs text-slate-500">
            每个投影页可以单独同步、检查和查看日志。
          </p>
        </div>
      </section>

      <StandardTable
        title="PMS projection 总览"
        dense
        columns={[
          {
            key: "resource",
            header: "资源",
            render: (row) => (
              <div>
                <div className="font-semibold text-slate-900">{row.config.label}</div>
                <div className="text-xs text-slate-500">{row.config.tableName}</div>
              </div>
            ),
          },
          {
            key: "row_count",
            header: "行数",
            align: "right",
            render: (row) => row.status?.row_count ?? 0,
          },
          {
            key: "max_synced_at",
            header: "最近 synced_at",
            render: (row) => formatDateTime(row.status?.max_synced_at ?? null),
          },
          {
            key: "last_status",
            header: "最近同步状态",
            render: (row) => statusBadge(row.status?.last_sync_run?.status ?? null),
          },
          {
            key: "last_finished_at",
            header: "最近完成时间",
            render: (row) =>
              formatDateTime(row.status?.last_sync_run?.finished_at ?? null),
          },
          {
            key: "action",
            header: "操作",
            render: (row) => (
              <Link
                className="text-sm font-semibold text-sky-700 hover:text-sky-900"
                to={row.config.routePath}
              >
                查看投影
              </Link>
            ),
          },
        ]}
        data={resourceRows}
        getRowKey={(row) => row.config.resource}
        emptyText={loading ? "加载中…" : "暂无 projection 状态"}
      />

      <StandardTable
        title="最近同步日志"
        dense
        columns={[
          {
            key: "resource",
            header: "资源",
            render: (row) =>
              PMS_PROJECTION_RESOURCE_MAP[row.resource as keyof typeof PMS_PROJECTION_RESOURCE_MAP]?.label ??
              row.resource,
          },
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
        data={runs}
        getRowKey={(row) => row.id}
        emptyText={loading ? "加载中…" : "暂无同步日志"}
      />
    </div>
  );
}
