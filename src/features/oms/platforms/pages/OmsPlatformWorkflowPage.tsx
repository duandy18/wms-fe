import React from "react";

type PlatformKey = "pdd" | "taobao" | "jd";

type StageKey =
  | "import"
  | "platform_order_mirror"
  | "fsku_mapping"
  | "fulfillment_order_conversion";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  pdd: "拼多多",
  taobao: "淘宝",
  jd: "京东",
};

const STAGE_LABELS: Record<StageKey, string> = {
  import: "订单导入",
  platform_order_mirror: "平台订单镜像",
  fsku_mapping: "商品映射",
  fulfillment_order_conversion: "履约订单转化",
};

const STAGE_DESCRIPTIONS: Record<StageKey, string> = {
  import:
    "从 Collector 获取可导入的平台订单事实，写入 OMS 自己的平台订单镜像，不直接读取 Collector 原生表。",
  platform_order_mirror:
    "查看已导入到 OMS 的平台订单镜像，包括订单头、地址、金额、平台商品行和原始引用。",
  fsku_mapping:
    "维护平台 FSKU / 商家编码 / 组合商品到内部 SKU 的映射关系，为履约订单转化做准备。",
  fulfillment_order_conversion:
    "把平台订单镜像与商品映射结果转化为 OMS 履约订单，后续进入 WMS 出库履约。",
};

const FLOW: Array<{ key: StageKey; label: string; note: string }> = [
  { key: "import", label: "订单导入", note: "Collector → OMS" },
  { key: "platform_order_mirror", label: "平台订单镜像", note: "OMS 平台事实镜像" },
  { key: "fsku_mapping", label: "商品映射", note: "FSKU → SKU" },
  {
    key: "fulfillment_order_conversion",
    label: "履约订单转化",
    note: "镜像 → 履约订单",
  },
];

interface OmsPlatformWorkflowPageProps {
  platform: PlatformKey;
  stage: StageKey;
}

export const OmsPlatformWorkflowPage: React.FC<OmsPlatformWorkflowPageProps> = ({
  platform,
  stage,
}) => {
  const platformLabel = PLATFORM_LABELS[platform];
  const stageLabel = STAGE_LABELS[stage];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-6 text-slate-900">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-medium text-slate-500">
            订单管理 / {platformLabel}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            {stageLabel}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {STAGE_DESCRIPTIONS[stage]}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {FLOW.map((item, index) => {
            const active = item.key === stage;

            return (
              <div
                key={item.key}
                className={[
                  "rounded-2xl border bg-white p-4 shadow-sm",
                  active ? "border-slate-900" : "border-slate-200",
                ].join(" ")}
              >
                <div className="text-xs font-semibold text-slate-400">
                  STEP {index + 1}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {item.label}
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-500">
                  {item.note}
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">当前阶段</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            当前页面先作为 OMS 新工作流入口占位。下一步补后端刚性合同、读模型和页面真实表格。
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <div>平台：{platformLabel}</div>
            <div>阶段：{stageLabel}</div>
            <div>边界：不做平台授权、不保存平台 token、不直接拉平台订单。</div>
          </div>
        </section>
      </section>
    </main>
  );
};
