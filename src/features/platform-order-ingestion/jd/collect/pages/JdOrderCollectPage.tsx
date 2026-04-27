import React from "react";
import { PlatformOrderCollectWorkspace } from "../../../shared/components/PlatformOrderCollectWorkspace";
import { fetchCurrentJdAppConfig } from "../api/jdCollectApi";
import type { JdAppConfigCurrent } from "../contracts/appConfig";

const JdOrderCollectPage: React.FC = () => {
  return (
    <PlatformOrderCollectWorkspace<JdAppConfigCurrent>
      platform="jd"
      platformLabel="京东"
      nativeOrdersPath="/platform-order-ingestion/jd/native-orders"
      fetchAppConfig={fetchCurrentJdAppConfig}
      renderAppConfigFields={(appConfig) => [
        { label: "配置ID", value: appConfig?.id ?? null },
        { label: "是否启用", value: appConfig?.is_enabled ?? null, badge: true },
        { label: "Client ID", value: appConfig?.client_id ?? null },
        {
          label: "密钥已保存",
          value: appConfig?.client_secret_present ?? null,
          badge: true,
        },
        { label: "密钥掩码", value: appConfig?.client_secret_masked ?? null },
        { label: "签名方式", value: appConfig?.sign_method ?? null },
        { label: "接口地址", value: appConfig?.gateway_url ?? null },
        { label: "回调地址", value: appConfig?.callback_url ?? null },
        { label: "创建时间", value: appConfig?.created_at ?? null },
        { label: "更新时间", value: appConfig?.updated_at ?? null },
      ]}
      defaultPageSize="20"
    />
  );
};

export default JdOrderCollectPage;
