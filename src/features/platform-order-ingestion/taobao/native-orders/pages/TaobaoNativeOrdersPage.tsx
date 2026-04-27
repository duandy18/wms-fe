import React from "react";
import { Link } from "react-router-dom";
import { SkeletonCard } from "../../../shared/components/SkeletonCards";
import { poiUi } from "../../../shared/ui";

const TaobaoNativeOrdersPage: React.FC = () => {
  return (
    <div className={poiUi.page}>
      <section className={poiUi.hero}>
        <div className={poiUi.pill}>淘宝</div>
        <h1 className={poiUi.heroTitle}>淘宝原生订单台账</h1>
        <p className={poiUi.heroDesc}>
          本页只核对淘宝原生订单事实，展示已经落库的平台订单头、子订单行、原始载荷和组合商品信息。
          不做内部订单创建，不做商品映射，不接财务事实表。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/platform-order-ingestion/taobao/collect"
            className={poiUi.secondaryLink}
          >
            返回淘宝订单采集
          </Link>
          <Link to="/platform-order-ingestion" className={poiUi.secondaryLink}>
            返回采集总览
          </Link>
        </div>
      </section>

      <section className={poiUi.grid2}>
        <SkeletonCard
          title="原生订单列表"
          description="下一刀接入淘宝原生订单列表，展示平台单号、交易状态、创建时间、付款时间、金额和同步时间。"
          points={[
            {
              title: "订单头事实",
              description: "来自淘宝原生订单表，只展示平台原始事实。",
            },
            {
              title: "筛选与刷新",
              description: "按店铺、平台单号和时间范围筛选，并支持刷新。",
            },
          ]}
        />
        <SkeletonCard
          title="订单详情抽屉"
          description="点击订单行后打开详情抽屉，展示订单头、地址、子订单明细和原始载荷。"
          points={[
            {
              title: "子订单明细",
              description: "展示平台商品、平台规格、外部编码、数量和金额。",
            },
            {
              title: "组合商品",
              description: "展示平台原生组合成分，提示尚未映射到内部商品。",
            },
          ]}
        />
      </section>
    </div>
  );
};

export default TaobaoNativeOrdersPage;
