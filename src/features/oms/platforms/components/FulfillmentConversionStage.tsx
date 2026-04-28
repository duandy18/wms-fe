import React, { useMemo, useState } from "react";

import {
  convertPlatformMirrorToFulfillmentOrder,
  type FulfillmentOrderConversionResult,
} from "../api/fulfillmentConversion";
import type { OmsPlatformKey } from "../api/platformOrderMirrors";

const PLATFORM_LABELS: Record<OmsPlatformKey, string> = {
  pdd: "拼多多",
  taobao: "淘宝",
  jd: "京东",
};

function formatOptional(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "-";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

interface FulfillmentConversionStageProps {
  platform: OmsPlatformKey;
}

export const FulfillmentConversionStage: React.FC<FulfillmentConversionStageProps> = ({
  platform,
}) => {
  const [mirrorIdText, setMirrorIdText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FulfillmentOrderConversionResult | null>(null);
  const [error, setError] = useState("");

  const mirrorId = useMemo(() => {
    const n = Number(mirrorIdText);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [mirrorIdText]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (mirrorId === null) {
      setError("请输入有效的 mirror_id。");
      return;
    }

    setSubmitting(true);

    try {
      const data = await convertPlatformMirrorToFulfillmentOrder(platform, mirrorId);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "履约订单转化失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-950">
          {PLATFORM_LABELS[platform]}履约订单转化
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          输入 OMS 平台订单镜像 mirror_id，后端会按平台读取镜像行、校验
          merchant_code → published FSKU 绑定，并展开 FSKU components 生成 OMS 可出库订单。
        </p>

        <form className="mt-5 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <input
            value={mirrorIdText}
            onChange={(event) => setMirrorIdText(event.target.value)}
            placeholder="mirror_id，例如 1"
            className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "转化中..." : "转化为履约订单"}
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-base font-semibold text-slate-950">转化结果</h3>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">OMS order_id</div>
              <div className="mt-1 font-mono text-lg font-semibold text-slate-950">
                {formatOptional(result.order_id)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">状态</div>
              <div className="mt-1 font-semibold text-slate-950">{result.status}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">引用</div>
              <div className="mt-1 break-all font-mono text-sm text-slate-950">
                {result.ref}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">平台订单号</div>
              <div className="mt-1 break-all font-mono text-sm text-slate-950">
                {result.ext_order_no}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">store_code</div>
              <div className="mt-1 font-mono text-sm text-slate-950">
                {result.store_code}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">行数</div>
              <div className="mt-1 text-sm text-slate-950">
                镜像行 {result.lines_count} / 商品行 {result.item_lines_count}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-semibold text-slate-700">
                fulfillment_status
              </div>
              <div className="text-sm text-slate-600">
                {formatOptional(result.fulfillment_status)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-semibold text-slate-700">
                blocked_reasons
              </div>
              <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600">
                {formatJson(result.blocked_reasons)}
              </pre>
            </div>
          </div>

          {result.order_id ? (
            <div className="mt-5 text-sm text-slate-600">
              后续 WMS 出库页可通过 OMS 订单选择器读取该订单；本页不直接创建 WMS 出库单。
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
