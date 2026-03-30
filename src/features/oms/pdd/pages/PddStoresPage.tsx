import React from "react";
import PddIntegrationConfigSection from "../components/PddIntegrationConfigSection";
import PddConnectionStatusSection from "../components/PddConnectionStatusSection";
import PddMockToolsCard from "../components/PddMockToolsCard";

const PddStoresPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">拼多多店铺接入</h1>
        <p className="text-sm text-slate-500">拼多多平台店铺接入、系统配置与模拟联调。</p>
      </div>
      <PddIntegrationConfigSection />
      <PddConnectionStatusSection />
      <PddMockToolsCard />
    </div>
  );
};

export default PddStoresPage;
