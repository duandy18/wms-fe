import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mockAuthorizePlatformStore, mockClearPlatformOrders, mockIngestPlatformOrders } from "../../../shared/api/mockApi";
import { createPlatformOrderPullJob, fetchPlatformOrderPullJobDetail, fetchPlatformOrderPullJobs, runPlatformOrderPullJobOnce, runPlatformOrderPullJobPages } from "../../../shared/api/pullJobsApi";
import { fetchPlatformOrderIngestionStoreStatus } from "../../../shared/api/statusApi";
import { fetchPlatformOrderIngestionStores, type PlatformOrderIngestionStoreOption } from "../../../shared/api/storesApi";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import type { MockScenario } from "../../../shared/contracts/common";
import type { PullJob, PullJobRun, PullJobRunLog } from "../../../shared/contracts/pullJobs";
import type { PlatformOrderIngestionStoreStatus } from "../../../shared/contracts/status";
import { poiUi } from "../../../shared/ui";
import { fetchCurrentPddAppConfig } from "../api/pddCollectApi";
import type { PddAppConfigCurrent } from "../contracts/appConfig";

const SCENARIOS: { value: MockScenario; label: string }[] = [
  { value: "normal", label: "普通订单" },
  { value: "address_missing", label: "地址缺失" },
  { value: "item_abnormal", label: "商品异常" },
  { value: "combo", label: "组合商品" },
  { value: "mixed", label: "混合场景" },
];

function displayValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function toOptionalNumber(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function FieldView(props: {
  label: string;
  value: string | number | boolean | null | undefined;
  badge?: boolean;
}) {
  return (
    <div>
      <div className={poiUi.label}>{props.label}</div>
      <div className={poiUi.value}>
        {props.badge ? <StatusBadge value={props.value} /> : displayValue(props.value)}
      </div>
    </div>
  );
}

const PddOrderCollectPage: React.FC = () => {
  const [stores, setStores] = useState<PlatformOrderIngestionStoreOption[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [appConfig, setAppConfig] = useState<PddAppConfigCurrent | null>(null);
  const [status, setStatus] = useState<PlatformOrderIngestionStoreStatus | null>(null);
  const [jobs, setJobs] = useState<PullJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [runs, setRuns] = useState<PullJobRun[]>([]);
  const [logs, setLogs] = useState<PullJobRunLog[]>([]);

  const [scenario, setScenario] = useState<MockScenario>("mixed");
  const [mockCount, setMockCount] = useState("6");
  const [clearConnection, setClearConnection] = useState(false);
  const [clearCredential, setClearCredential] = useState(false);

  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [orderStatus, setOrderStatus] = useState("1");
  const [pageSize, setPageSize] = useState("50");
  const [runPage, setRunPage] = useState("");
  const [maxPages, setMaxPages] = useState("5");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedStore = useMemo(
    () => stores.find((item) => item.id === storeId) ?? null,
    [storeId, stores],
  );

  async function refreshJobs(nextStoreId: number | null = storeId) {
    const data = await fetchPlatformOrderPullJobs({
      platform: "pdd",
      storeId: nextStoreId,
      limit: 50,
      offset: 0,
    });
    setJobs(data.rows);
    if (!selectedJobId && data.rows.length > 0) {
      setSelectedJobId(data.rows[0].id);
    }
  }

  async function refreshStatus(nextStoreId: number | null = storeId) {
    if (!nextStoreId) {
      setStatus(null);
      return;
    }

    const data = await fetchPlatformOrderIngestionStoreStatus(nextStoreId);
    setStatus(data);
  }

  async function refreshSelectedJobDetail(nextJobId: number | null = selectedJobId) {
    if (!nextJobId) {
      setRuns([]);
      setLogs([]);
      return;
    }

    const data = await fetchPlatformOrderPullJobDetail(nextJobId);
    setRuns(data.runs);
    setLogs(data.logs);
  }

  async function loadInitial() {
    setLoading(true);
    setError(null);
    try {
      const [storeRows, config] = await Promise.all([
        fetchPlatformOrderIngestionStores("pdd"),
        fetchCurrentPddAppConfig(),
      ]);

      setStores(storeRows);
      setAppConfig(config);

      const firstStoreId = storeRows[0]?.id ?? null;
      setStoreId(firstStoreId);

      await Promise.all([refreshJobs(firstStoreId), refreshStatus(firstStoreId)]);
    } catch (err) {
      console.error("load pdd collect page failed", err);
      setError(err instanceof Error ? err.message : "加载拼多多订单采集页失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refreshSelectedJobDetail(selectedJobId).catch((err) => {
      console.error("load pull job detail failed", err);
      setError(err instanceof Error ? err.message : "加载任务详情失败");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId]);

  async function runAction(actionName: string, fn: () => Promise<string>) {
    setActionLoading(actionName);
    setError(null);
    setNotice(null);
    try {
      const message = await fn();
      setNotice(message);
      await Promise.all([refreshStatus(), refreshJobs()]);
      await refreshSelectedJobDetail();
    } catch (err) {
      console.error(`${actionName} failed`, err);
      setError(err instanceof Error ? err.message : `${actionName}失败`);
    } finally {
      setActionLoading(null);
    }
  }

  const canOperate = Boolean(storeId) && !actionLoading;

  return (
    <div className={poiUi.page}>
      <section className={poiUi.hero}>
        <div className={poiUi.pill}>拼多多</div>
        <h1 className={poiUi.heroTitle}>拼多多订单采集</h1>
        <p className={poiUi.heroDesc}>
          本页负责拼多多平台订单采集链路：系统配置、店铺授权、连接状态、模拟联调、
          拉单任务和任务日志。订单拉取后只落到拼多多原生订单表，不创建内部订单。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/platform-order-ingestion/pdd/native-orders"
            className={poiUi.secondaryLink}
          >
            查看拼多多原生订单台账
          </Link>
          <Link to="/platform-order-ingestion" className={poiUi.secondaryLink}>
            返回采集总览
          </Link>
          <button
            type="button"
            className={poiUi.secondaryButton}
            disabled={loading}
            onClick={() => void loadInitial()}
          >
            刷新页面
          </button>
        </div>
      </section>

      {error ? <div className={poiUi.error}>{error}</div> : null}
      {notice ? <div className={poiUi.success}>{notice}</div> : null}

      <section className={poiUi.card}>
        <h2 className={poiUi.cardTitle}>店铺选择</h2>
        <p className={poiUi.cardDesc}>
          选择一个拼多多店铺后，页面会读取该店铺的采集状态、拉单任务和 mock 操作结果。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label>
            <div className={poiUi.label}>拼多多店铺</div>
            <select
              className={poiUi.select}
              value={storeId ?? ""}
              onChange={(event) => {
                const nextStoreId = toOptionalNumber(event.target.value);
                setStoreId(nextStoreId);
                setSelectedJobId(null);
                void Promise.all([refreshStatus(nextStoreId), refreshJobs(nextStoreId)]).catch(
                  (err) => setError(err instanceof Error ? err.message : "切换店铺失败"),
                );
              }}
            >
              <option value="">请选择店铺</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} / {store.shop_id} / #{store.id}
                </option>
              ))}
            </select>
          </label>
          <FieldView label="当前店铺" value={selectedStore?.name ?? null} />
          <FieldView label="店铺状态" value={selectedStore?.active ?? null} badge />
        </div>
      </section>

      <section className={poiUi.grid2}>
        <section className={poiUi.card}>
          <h2 className={poiUi.cardTitle}>PDD 系统配置</h2>
          <p className={poiUi.cardDesc}>读取当前启用中的拼多多系统配置。</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldView label="配置ID" value={appConfig?.id ?? null} />
            <FieldView label="是否启用" value={appConfig?.is_enabled ?? null} badge />
            <FieldView label="Client ID" value={appConfig?.client_id ?? null} />
            <FieldView label="密钥已保存" value={appConfig?.client_secret_present ?? null} badge />
            <FieldView label="密钥掩码" value={appConfig?.client_secret_masked ?? null} />
            <FieldView label="签名方式" value={appConfig?.sign_method ?? null} />
            <FieldView label="接口地址" value={appConfig?.api_base_url ?? null} />
            <FieldView label="回调地址" value={appConfig?.redirect_uri ?? null} />
            <FieldView label="创建时间" value={appConfig?.created_at ?? null} />
            <FieldView label="更新时间" value={appConfig?.updated_at ?? null} />
          </div>
        </section>

        <section className={poiUi.card}>
          <h2 className={poiUi.cardTitle}>店铺授权与连接状态</h2>
          <p className={poiUi.cardDesc}>读取店铺级平台订单采集状态。</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldView label="平台" value={status?.platform ?? null} />
            <FieldView label="可拉单" value={status?.pull_ready ?? null} badge />
            <FieldView label="应用配置" value={status?.app.status ?? null} badge />
            <FieldView label="启用配置数" value={status?.app.enabled_count ?? null} />
            <FieldView label="凭证存在" value={status?.credential.present ?? null} badge />
            <FieldView label="凭证状态" value={status?.credential.credential_status ?? null} badge />
            <FieldView label="连接存在" value={status?.connection.present ?? null} badge />
            <FieldView label="连接状态" value={status?.connection.connection_status ?? null} badge />
            <FieldView label="需要重新授权" value={status?.connection.reauth_required ?? null} badge />
            <FieldView label="最近检测" value={status?.connection.last_pull_checked_at ?? null} />
          </div>

          {status?.blocked_reasons.length ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-xs font-semibold text-amber-800">阻塞原因</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {status.blocked_reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </section>

      <section className={poiUi.grid2}>
        <section className={poiUi.card}>
          <h2 className={poiUi.cardTitle}>Mock 联调</h2>
          <p className={poiUi.cardDesc}>
            通过通用 mock 接口演练授权、原生订单生成和清理。
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label>
              <div className={poiUi.label}>场景</div>
              <select
                className={poiUi.select}
                value={scenario}
                onChange={(event) => setScenario(event.target.value as MockScenario)}
              >
                {SCENARIOS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <div className={poiUi.label}>生成数量</div>
              <input
                className={poiUi.input}
                value={mockCount}
                onChange={(event) => setMockCount(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className={poiUi.checkbox}
                checked={clearConnection}
                onChange={(event) => setClearConnection(event.target.checked)}
              />
              同时清理连接状态
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className={poiUi.checkbox}
                checked={clearCredential}
                onChange={(event) => setClearCredential(event.target.checked)}
              />
              同时清理授权凭证
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={poiUi.button}
              disabled={!canOperate}
              onClick={() =>
                void runAction("mock authorize", async () => {
                  if (!storeId) throw new Error("请先选择店铺");
                  const result = await mockAuthorizePlatformStore(storeId, {
                    platform: "pdd",
                    expires_in_days: 365,
                    pull_ready: true,
                  });
                  return `Mock 授权完成：${result.status}`;
                })
              }
            >
              Mock 授权
            </button>
            <button
              type="button"
              className={poiUi.button}
              disabled={!canOperate}
              onClick={() =>
                void runAction("mock ingest", async () => {
                  if (!storeId) throw new Error("请先选择店铺");
                  const count = toOptionalNumber(mockCount) ?? 1;
                  const result = await mockIngestPlatformOrders(storeId, {
                    platform: "pdd",
                    scenario,
                    count,
                  });
                  return `Mock 原生订单生成完成：${result.rows.length} 行`;
                })
              }
            >
              生成 Mock 原生订单
            </button>
            <button
              type="button"
              className={poiUi.dangerButton}
              disabled={!canOperate}
              onClick={() =>
                void runAction("mock clear", async () => {
                  if (!storeId) throw new Error("请先选择店铺");
                  const result = await mockClearPlatformOrders(storeId, {
                    platform: "pdd",
                    clear_connection: clearConnection,
                    clear_credential: clearCredential,
                  });
                  return `Mock 清理完成：订单 ${result.deleted_orders}，明细 ${result.deleted_items}`;
                })
              }
            >
              清理 Mock 订单
            </button>
          </div>
        </section>

        <section className={poiUi.card}>
          <h2 className={poiUi.cardTitle}>拉单任务</h2>
          <p className={poiUi.cardDesc}>
            创建并执行拼多多拉单任务。真实拉单是否成功取决于授权、连接状态和平台接口。
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label>
              <div className={poiUi.label}>开始时间</div>
              <input
                type="datetime-local"
                className={poiUi.input}
                value={timeFrom}
                onChange={(event) => setTimeFrom(event.target.value)}
              />
            </label>
            <label>
              <div className={poiUi.label}>结束时间</div>
              <input
                type="datetime-local"
                className={poiUi.input}
                value={timeTo}
                onChange={(event) => setTimeTo(event.target.value)}
              />
            </label>
            <label>
              <div className={poiUi.label}>订单状态</div>
              <input
                className={poiUi.input}
                value={orderStatus}
                onChange={(event) => setOrderStatus(event.target.value)}
              />
            </label>
            <label>
              <div className={poiUi.label}>每页数量</div>
              <input
                className={poiUi.input}
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={poiUi.button}
              disabled={!canOperate}
              onClick={() =>
                void runAction("create pull job", async () => {
                  if (!storeId) throw new Error("请先选择店铺");
                  const job = await createPlatformOrderPullJob({
                    platform: "pdd",
                    store_id: storeId,
                    job_type: "manual",
                    time_from: timeFrom || null,
                    time_to: timeTo || null,
                    order_status: toOptionalNumber(orderStatus),
                    page_size: toOptionalNumber(pageSize) ?? 50,
                    request_payload: null,
                  });
                  setSelectedJobId(job.id);
                  return `拉单任务已创建：#${job.id}`;
                })
              }
            >
              创建任务
            </button>
            <button
              type="button"
              className={poiUi.secondaryButton}
              disabled={!selectedJobId || Boolean(actionLoading)}
              onClick={() =>
                void runAction("run once", async () => {
                  if (!selectedJobId) throw new Error("请先选择任务");
                  const result = await runPlatformOrderPullJobOnce(selectedJobId, {
                    page: toOptionalNumber(runPage),
                  });
                  return `执行完成：${result.run.status}，成功 ${result.run.success_count}，失败 ${result.run.failed_count}`;
                })
              }
            >
              执行单页
            </button>
            <button
              type="button"
              className={poiUi.secondaryButton}
              disabled={!selectedJobId || Boolean(actionLoading)}
              onClick={() =>
                void runAction("run pages", async () => {
                  if (!selectedJobId) throw new Error("请先选择任务");
                  const result = await runPlatformOrderPullJobPages(selectedJobId, {
                    max_pages: toOptionalNumber(maxPages) ?? 5,
                  });
                  return `连续执行完成：${result.pages_executed} 页，停止原因 ${result.stopped_reason}`;
                })
              }
            >
              连续执行
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label>
              <div className={poiUi.label}>单页页码</div>
              <input
                className={poiUi.input}
                placeholder="为空则使用任务游标"
                value={runPage}
                onChange={(event) => setRunPage(event.target.value)}
              />
            </label>
            <label>
              <div className={poiUi.label}>连续最大页数</div>
              <input
                className={poiUi.input}
                value={maxPages}
                onChange={(event) => setMaxPages(event.target.value)}
              />
            </label>
          </div>
        </section>
      </section>

      <section className={poiUi.card}>
        <h2 className={poiUi.cardTitle}>任务运行与日志</h2>
        <p className={poiUi.cardDesc}>
          这里展示当前店铺最近的拼多多拉单任务、运行记录和日志。
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className={poiUi.label}>任务列表</div>
            <select
              className={poiUi.select}
              value={selectedJobId ?? ""}
              onChange={(event) => setSelectedJobId(toOptionalNumber(event.target.value))}
            >
              <option value="">请选择任务</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  #{job.id} / {job.status} / 店铺 {job.store_id}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <div className={poiUi.tableWrap}>
              <table className={poiUi.table}>
                <thead>
                  <tr>
                    <th className={poiUi.th}>运行ID</th>
                    <th className={poiUi.th}>状态</th>
                    <th className={poiUi.th}>页码</th>
                    <th className={poiUi.th}>成功</th>
                    <th className={poiUi.th}>失败</th>
                    <th className={poiUi.th}>结束时间</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id}>
                      <td className={poiUi.td}>{run.id}</td>
                      <td className={poiUi.td}><StatusBadge value={run.status} /></td>
                      <td className={poiUi.td}>{run.page}</td>
                      <td className={poiUi.td}>{run.success_count}</td>
                      <td className={poiUi.td}>{run.failed_count}</td>
                      <td className={poiUi.td}>{displayValue(run.finished_at)}</td>
                    </tr>
                  ))}
                  {!runs.length ? (
                    <tr>
                      <td className={poiUi.td} colSpan={6}>暂无运行记录。</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-80 overflow-auto rounded-2xl border border-slate-200">
          <table className={poiUi.table}>
            <thead>
              <tr>
                <th className={poiUi.th}>时间</th>
                <th className={poiUi.th}>级别</th>
                <th className={poiUi.th}>事件</th>
                <th className={poiUi.th}>平台单号</th>
                <th className={poiUi.th}>消息</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={poiUi.td}>{displayValue(log.created_at)}</td>
                  <td className={poiUi.td}><StatusBadge value={log.level} /></td>
                  <td className={poiUi.td}>{log.event_type}</td>
                  <td className={poiUi.td}>{displayValue(log.platform_order_no)}</td>
                  <td className={poiUi.td}>{displayValue(log.message)}</td>
                </tr>
              ))}
              {!logs.length ? (
                <tr>
                  <td className={poiUi.td} colSpan={5}>暂无任务日志。</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PddOrderCollectPage;
