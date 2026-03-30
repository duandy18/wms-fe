import React from "react";
import TaobaoIntegrationConfigSection from "../components/TaobaoIntegrationConfigSection";
import TaobaoConnectionStatusSection from "../components/TaobaoConnectionStatusSection";

const TaobaoStoresPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">淘宝店铺接入</h1>
        <p className="text-sm text-slate-500">淘宝平台店铺接入与系统配置。</p>
      </div>
      <TaobaoIntegrationConfigSection />
      <TaobaoConnectionStatusSection />
    </div>
  );
};

export default TaobaoStoresPage;
