// src/features/oms/platforms/PlatformIntegrationsListPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlatformIntegrations } from "./api";
import type { PlatformIntegrationListItem } from "./types";

function formatExpiry(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}

function authBadgeClass(source: PlatformIntegrationListItem["auth_source"]): string {
  if (source === "OAUTH") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (source === "MANUAL") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }
  return "bg-slate-50 text-slate-600 border border-slate-200";
}

function authLabel(source: PlatformIntegrationListItem["auth_source"]): string {
  if (source === "OAUTH") return "OAuth 已授权";
  if (source === "MANUAL") return "手工凭据";
  return "未接入";
}

export default function PlatformIntegrationsListPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<PlatformIntegrationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlatformIntegrations();
        if (!alive) return;
        setRows(data);
      } catch (err) {
        console.error("load platform integrations failed", err);
        if (!alive) return;
        setError("加载平台接入列表失败。");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const platformOptions = useMemo(() => {
    const values = Array.from(new Set(rows.map((row) => String(row.platform).toUpperCase())));
    return ["ALL", ...values];
  }, [rows]);

  const visibleRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      if (platformFilter !== "ALL" && String(row.platform).toUpperCase() !== platformFilter) {
        return false;
      }
      if (!q) return true;
      return [row.platform, row.shop_id, row.store_name, row.mall_id ?? "", row.auth_source]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, keyword, platformFilter]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">平台接入</h1>
          <p className="mt-1 text-sm text-slate-600">
            统一查看平台店铺接入状态，重点关注授权、token、平台身份与拉单前置状态。
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="搜索平台 / 店铺 / 内部店铺 / 平台身份"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              {platformOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "全部平台" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-500">
            共 {visibleRows.length} 条 / 总计 {rows.length} 条
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">加载中…</div>
        ) : visibleRows.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">暂无平台接入记录。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">平台</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">内部店铺</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">平台店铺号</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">授权状态</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">平台身份</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">到期时间</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.store_id} className="text-sm text-slate-800">
                    <td className="border-b border-slate-100 px-4 py-3 align-middle font-medium">
                      {String(row.platform).toUpperCase()}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 align-middle">
                      <div className="font-medium">{row.store_name || "未命名店铺"}</div>
                      <div className="text-xs text-slate-500">
                        store_id={row.store_id} · {row.shop_type}
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 align-middle">
                      {row.shop_id}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${authBadgeClass(
                          row.auth_source,
                        )}`}
                      >
                        {authLabel(row.auth_source)}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 align-middle">
                      {row.mall_id || "—"}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 align-middle">
                      {formatExpiry(row.expires_at)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 align-middle">
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => navigate(`/platforms/${row.store_id}`)}
                      >
                        查看接入详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
