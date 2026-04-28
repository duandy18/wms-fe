import React, { useEffect, useMemo, useState } from "react";

import { FskuMappingStage } from "../components/FskuMappingStage";
import { FulfillmentConversionStage } from "../components/FulfillmentConversionStage";

import {
  getPlatformOrderMirrorDetail,
  importPlatformOrderMirrorFromCollector,
  listPlatformOrderMirrors,
  syncPlatformOrderMirrorsFromCollector,
  type OmsPlatformKey,
  type PlatformOrderMirror,
} from "../api/platformOrderMirrors";

type PlatformKey = OmsPlatformKey;

type StageKey =
  | "platform_order_mirror"
  | "fsku_mapping"
  | "fulfillment_order_conversion";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  pdd: "拼多多",
  taobao: "淘宝",
  jd: "京东",
};

interface OmsPlatformWorkflowPageProps {
  platform: PlatformKey;
  stage: StageKey;
}

function formatOptional(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "{}";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function nextDateText(dateText: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const next = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    next.getUTCFullYear(),
    formatDatePart(next.getUTCMonth() + 1),
    formatDatePart(next.getUTCDate()),
  ].join("-");
}

function toShanghaiDayStart(dateText: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;
  return `${dateText}T00:00:00+08:00`;
}

function toShanghaiExclusiveDayEnd(dateText: string): string | null {
  const next = nextDateText(dateText);
  if (!next) return null;
  return `${next}T00:00:00+08:00`;
}

const JsonBlock: React.FC<{ title: string; value: unknown }> = ({
  title,
  value,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
    <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600">
      {formatJson(value)}
    </pre>
  </div>
);

const MirrorListStage: React.FC<{ platform: PlatformKey }> = ({ platform }) => {
  const [items, setItems] = useState<PlatformOrderMirror[]>([]);
  const [selected, setSelected] = useState<PlatformOrderMirror | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const [syncLimit, setSyncLimit] = useState("50");
  const [syncSince, setSyncSince] = useState("");
  const [syncUntil, setSyncUntil] = useState("");
  const [syncSubmitting, setSyncSubmitting] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [syncError, setSyncError] = useState("");

  const [collectorOrderId, setCollectorOrderId] = useState("");
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importResult, setImportResult] = useState("");
  const [importError, setImportError] = useState("");

  const platformLabel = PLATFORM_LABELS[platform];

  const parsedSyncLimit = useMemo(() => {
    const n = Number(syncLimit);
    return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : null;
  }, [syncLimit]);

  const parsedCollectorOrderId = useMemo(() => {
    const n = Number(collectorOrderId);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [collectorOrderId]);

  const syncSinceDate = syncSince.trim();
  const syncUntilDate = syncUntil.trim();
  const syncSinceValue = syncSinceDate ? toShanghaiDayStart(syncSinceDate) : "";
  const syncUntilValue = syncUntilDate ? toShanghaiExclusiveDayEnd(syncUntilDate) : "";
  const hasTimeWindow = syncSinceDate !== "" || syncUntilDate !== "";

  async function loadList(preferMirrorId?: number) {
    setLoading(true);
    setError("");

    try {
      const rows = await listPlatformOrderMirrors(platform);
      setItems(rows);

      const targetMirrorId = preferMirrorId ?? rows[0]?.id;
      if (targetMirrorId) {
        const detail = await getPlatformOrderMirrorDetail(platform, targetMirrorId);
        setSelected(detail);
      } else {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载平台订单镜像失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(mirrorId: number) {
    setDetailLoading(true);
    setError("");

    try {
      const detail = await getPlatformOrderMirrorDetail(platform, mirrorId);
      setSelected(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载镜像详情失败");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSync(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSyncResult("");
    setSyncError("");
    setImportResult("");
    setImportError("");

    if (parsedSyncLimit === null) {
      setSyncError("请输入 1 到 1000 之间的同步数量。");
      return;
    }

    if (syncSinceDate && !syncSinceValue) {
      setSyncError("请输入有效的开始日期。");
      return;
    }

    if (syncUntilDate && !syncUntilValue) {
      setSyncError("请输入有效的结束日期。");
      return;
    }

    if (syncSinceValue && syncUntilValue && syncSinceValue >= syncUntilValue) {
      setSyncError("结束日期不能早于开始日期。");
      return;
    }

    setSyncSubmitting(true);

    try {
      const data = await syncPlatformOrderMirrorsFromCollector(platform, {
        limit: parsedSyncLimit,
        since: syncSinceValue || undefined,
        until: syncUntilValue || undefined,
      });

      const rangeText = hasTimeWindow
        ? ` 日期范围：${syncSinceDate || "未设置"} 至 ${syncUntilDate || "未设置"}。`
        : "";

      setSyncResult(
        `同步完成：拉取 ${data.fetched_count} 张，写入 ${data.imported_count} 张，失败 ${data.failed_count} 张。${rangeText}`,
      );

      await loadList(data.items[0]?.mirror_id);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "同步失败");
    } finally {
      setSyncSubmitting(false);
    }
  }

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImportResult("");
    setImportError("");
    setSyncResult("");
    setSyncError("");

    if (parsedCollectorOrderId === null) {
      setImportError("请输入有效的 collector_order_id。");
      return;
    }

    setImportSubmitting(true);

    try {
      const data = await importPlatformOrderMirrorFromCollector(
        platform,
        parsedCollectorOrderId,
      );

      setImportResult(
        `补拉成功：collector_order_id=${data.collector_order_id}，mirror_id=${data.mirror_id}`,
      );

      await loadList(data.mirror_id);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "补拉失败");
    } finally {
      setImportSubmitting(false);
    }
  }

  useEffect(() => {
    void loadList();
    // platform 变化时重新加载；loadList 内部只依赖 platform。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            从 Collector 同步{platformLabel}订单
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            日常拉单使用批量同步。WMS 会按平台调用 Collector Export 列表合同，
            并逐单写入 OMS 平台订单镜像；单票 collector_order_id 仅用于运维补拉。
          </p>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleSync}>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-500">同步数量</div>
            <input
              value={syncLimit}
              onChange={(event) => setSyncLimit(event.target.value)}
              placeholder="50"
              className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900"
            />
          </label>

          <button
            type="submit"
            disabled={syncSubmitting}
            className="min-h-11 self-end rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {syncSubmitting ? "同步中..." : hasTimeWindow ? "按时间范围同步" : "同步最近订单"}
          </button>
        </form>

        {syncResult ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {syncResult}
          </div>
        ) : null}

        {syncError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {syncError}
          </div>
        ) : null}

        <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            高级同步选项
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-xs font-medium text-slate-500">开始日期</div>
              <input
                type="date"
                value={syncSince}
                onChange={(event) => setSyncSince(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-medium text-slate-500">结束日期（含当天）</div>
              <input
                type="date"
                value={syncUntil}
                onChange={(event) => setSyncUntil(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
              />
            </label>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            日期范围用于批量同步 Collector Export 列表；开始日期包含当天，结束日期也包含当天。留空则同步最近订单。
          </p>

          <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleImport}>
            <input
              value={collectorOrderId}
              onChange={(event) => setCollectorOrderId(event.target.value)}
              placeholder="collector_order_id，例如 1"
              className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
            />
            <button
              type="submit"
              disabled={importSubmitting}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {importSubmitting ? "补拉中..." : "单票补拉并查看"}
            </button>
          </form>

          {importResult ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {importResult}
            </div>
          ) : null}

          {importError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {importError}
            </div>
          ) : null}
        </details>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {PLATFORM_LABELS[platform]}平台订单镜像
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                来自 OMS 自有镜像表，不直接读取 Collector 原生表。
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadList()}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {loading ? "刷新中..." : "刷新"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">镜像ID</th>
                  <th className="px-3 py-3">平台订单号</th>
                  <th className="px-3 py-3">平台状态</th>
                  <th className="px-3 py-3">Collector店铺</th>
                  <th className="px-3 py-3">WMS店铺</th>
                  <th className="px-3 py-3">同步时间</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const active = selected?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={[
                        "cursor-pointer border-b border-slate-100 hover:bg-slate-50",
                        active ? "bg-slate-50" : "",
                      ].join(" ")}
                      onClick={() => void loadDetail(item.id)}
                    >
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {item.id}
                      </td>
                      <td className="px-3 py-3">{item.platform_order_no}</td>
                      <td className="px-3 py-3">{formatOptional(item.platform_status)}</td>
                      <td className="px-3 py-3">{item.collector_store_code}</td>
                      <td className="px-3 py-3">{formatOptional(item.wms_store_id)}</td>
                      <td className="px-3 py-3">{formatOptional(item.last_synced_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && items.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                暂无平台订单镜像。
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-base font-semibold text-slate-950">镜像详情</h3>
          {detailLoading ? (
            <p className="mt-4 text-sm text-slate-500">加载详情中...</p>
          ) : null}

          {selected ? (
            <div className="mt-4 space-y-5">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div>
                  <div className="text-xs text-slate-400">平台订单号</div>
                  <div className="font-medium text-slate-900">
                    {selected.platform_order_no}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Collector订单ID</div>
                  <div className="font-medium text-slate-900">
                    {selected.collector_order_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">导入状态</div>
                  <div className="font-medium text-slate-900">
                    {selected.import_status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">镜像状态</div>
                  <div className="font-medium text-slate-900">
                    {selected.mirror_status}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">订单行</div>
                <div className="space-y-2">
                  {selected.lines.map((line: PlatformOrderMirror["lines"][number]) => (
                    <div
                      key={line.id}
                      className="rounded-xl border border-slate-200 p-3 text-sm"
                    >
                      <div className="font-medium text-slate-900">
                        {formatOptional(line.title)}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        merchant_sku={formatOptional(line.merchant_sku)}，
                        platform_sku_id={formatOptional(line.platform_sku_id)}，
                        quantity={line.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <JsonBlock title="收件信息" value={selected.receiver} />
              <JsonBlock title="金额信息" value={selected.amounts} />
              <JsonBlock title="平台字段" value={selected.platform_fields} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">请选择一条镜像记录。</p>
          )}
        </aside>
      </section>
    </section>
  );
};

export const OmsPlatformWorkflowPage: React.FC<OmsPlatformWorkflowPageProps> = ({
  platform,
  stage,
}) => {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-6 text-slate-900">
      <section className="mx-auto max-w-7xl space-y-6">
        {stage === "platform_order_mirror" ? (
          <MirrorListStage platform={platform} />
        ) : null}
        {stage === "fsku_mapping" ? <FskuMappingStage platform={platform} /> : null}
        {stage === "fulfillment_order_conversion" ? (
          <FulfillmentConversionStage platform={platform} />
        ) : null}
      </section>
    </main>
  );
};
