import React from "react";
import { RouteEntryCard, SkeletonCard } from "../../shared/components/SkeletonCards";
import { poiUi } from "../../shared/ui";

const PlatformOrderIngestionOverviewPage: React.FC = () => {
  return (
    <div className={poiUi.page}>
      <section className={poiUi.hero}>
        <div className={poiUi.pill}>平台订单采集</div>
        <h1 className={poiUi.heroTitle}>采集总览</h1>
        <p className={poiUi.heroDesc}>
          这里是平台订单采集模块的入口页，只展示采集健康状态、最近任务和平台入口。
          第一版不展示跨平台订单明细，不做内部订单创建，不做商品映射，不接财务和仓配业务。
        </p>
      </section>

      <section className={poiUi.grid3}>
        <RouteEntryCard
          title="拼多多"
          description="进入拼多多订单采集与拼多多原生订单台账。"
          primaryTo="/platform-order-ingestion/pdd/collect"
          primaryText="拼多多订单采集"
          secondaryTo="/platform-order-ingestion/pdd/native-orders"
          secondaryText="原生订单台账"
        />
        <RouteEntryCard
          title="淘宝"
          description="进入淘宝订单采集与淘宝原生订单台账。"
          primaryTo="/platform-order-ingestion/taobao/collect"
          primaryText="淘宝订单采集"
          secondaryTo="/platform-order-ingestion/taobao/native-orders"
          secondaryText="原生订单台账"
        />
        <RouteEntryCard
          title="京东"
          description="进入京东订单采集与京东原生订单台账。"
          primaryTo="/platform-order-ingestion/jd/collect"
          primaryText="京东订单采集"
          secondaryTo="/platform-order-ingestion/jd/native-orders"
          secondaryText="原生订单台账"
        />
      </section>

      <section className={poiUi.grid2}>
        <SkeletonCard
          title="平台状态总览"
          description="下一刀接入三平台应用配置、授权状态、连接状态和是否具备拉单条件。"
          points={[
            {
              title: "采集健康状态",
              description: "展示每个平台是否已配置、是否已授权、是否可拉单。",
            },
            {
              title: "阻塞原因",
              description: "展示缺少授权、凭证过期、连接失败等阻塞信息。",
            },
          ]}
        />
        <SkeletonCard
          title="最近拉单任务"
          description="下一刀接入统一拉单任务，展示最近任务、执行结果和失败原因。"
          points={[
            {
              title: "任务运行",
              description: "展示最近任务的成功数量、失败数量和运行日志入口。",
            },
            {
              title: "平台入口",
              description: "从总览页快速跳转到对应平台的订单采集页。",
            },
          ]}
        />
      </section>
    </div>
  );
};

export default PlatformOrderIngestionOverviewPage;
