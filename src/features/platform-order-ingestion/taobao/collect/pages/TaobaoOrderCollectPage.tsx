import React from "react";
import { Link } from "react-router-dom";
import { SkeletonCard } from "../../../shared/components/SkeletonCards";
import { poiUi } from "../../../shared/ui";

const TaobaoOrderCollectPage: React.FC = () => {
  return (
    <div className={poiUi.page}>
      <section className={poiUi.hero}>
        <div className={poiUi.pill}>淘宝</div>
        <h1 className={poiUi.heroTitle}>淘宝订单采集</h1>
        <p className={poiUi.heroDesc}>
          本页负责淘宝平台订单采集链路：系统配置、店铺授权、连接状态、模拟联调、
          拉单任务和任务日志。订单拉取后只落到淘宝原生订单表，不创建内部订单。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/platform-order-ingestion/taobao/native-orders"
            className={poiUi.secondaryLink}
          >
            查看淘宝原生订单台账
          </Link>
          <Link to="/platform-order-ingestion" className={poiUi.secondaryLink}>
            返回采集总览
          </Link>
        </div>
      </section>

      <section className={poiUi.grid2}>
        <SkeletonCard
          title="淘宝系统配置"
          description="展示淘宝应用配置是否完整，后续接入应用配置读取和保存。"
          points={[
            {
              title: "应用配置状态",
              description: "展示应用是否启用、密钥是否已保存、接口地址是否完整。",
            },
            {
              title: "配置更新时间",
              description: "展示配置创建时间和最近更新时间。",
            },
          ]}
        />
        <SkeletonCard
          title="店铺授权与连接状态"
          description="展示选择店铺后的授权状态、连接状态和是否具备拉单条件。"
          points={[
            {
              title: "授权状态",
              description: "展示凭证是否存在、是否有效、是否需要重新授权。",
            },
            {
              title: "连接状态",
              description: "展示最近检测结果、阻塞原因和最近拉单任务。",
            },
          ]}
        />
        <SkeletonCard
          title="Mock 联调"
          description="通过通用 mock 接口演练授权、原生订单生成和清理。"
          points={[
            {
              title: "模拟授权",
              description: "让测试店铺进入可拉单状态，不依赖真实平台。",
            },
            {
              title: "模拟订单",
              description: "支持普通、地址缺失、商品异常、组合商品和混合场景。",
            },
          ]}
        />
        <SkeletonCard
          title="拉单任务"
          description="创建并执行淘宝拉单任务，支持单页执行和连续执行。"
          points={[
            {
              title: "创建任务",
              description: "按店铺和时间范围创建平台订单拉取任务。",
            },
            {
              title: "执行任务",
              description: "执行单页或连续页，结果进入任务运行和日志。",
            },
          ]}
        />
      </section>

      <SkeletonCard
        title="任务运行与日志"
        description="后续接入任务运行记录和日志，复盘每一次拉单执行过程。"
        points={[
          {
            title: "运行结果",
            description: "展示成功数量、失败数量、错误信息和执行时间。",
          },
          {
            title: "日志明细",
            description: "展示任务开始、页面成功、页面失败等运行日志。",
          },
        ]}
      />
    </div>
  );
};

export default TaobaoOrderCollectPage;
