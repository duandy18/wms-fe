import React from "react";
import JdIntegrationConfigSection from "../components/JdIntegrationConfigSection";

const JdStoresPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">京东店铺接入</h1>
        <p className="text-sm text-slate-500">京东平台店铺接入与系统配置。</p>
      </div>
      <JdIntegrationConfigSection />
    </div>
  );
};

export default JdStoresPage;
