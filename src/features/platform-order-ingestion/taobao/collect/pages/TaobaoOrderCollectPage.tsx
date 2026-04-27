import React from "react";
import { PlatformOrderCollectWorkspace } from "../../../shared/components/PlatformOrderCollectWorkspace";
import { fetchCurrentTaobaoAppConfig } from "../api/taobaoCollectApi";
import type { TaobaoAppConfigCurrent } from "../contracts/appConfig";

const TaobaoOrderCollectPage: React.FC = () => {
  return (
    <PlatformOrderCollectWorkspace<TaobaoAppConfigCurrent>
      platform="taobao"
      platformLabel="淘宝"
      nativeOrdersPath="/platform-order-ingestion/taobao/native-orders"
      fetchAppConfig={fetchCurrentTaobaoAppConfig}
      renderAppConfigFields={(appConfig) => [
        { label: "配置ID", value: appConfig?.id ?? null },
        { label: "是否启用", value: appConfig?.is_enabled ?? null, badge: true },
        { label: "App Key", value: appConfig?.app_key ?? null },
        {
          label: "密钥已保存",
          value: appConfig?.app_secret_present ?? null,
          badge: true,
        },
        { label: "密钥掩码", value: appConfig?.app_secret_masked ?? null },
        { label: "签名方式", value: appConfig?.sign_method ?? null },
        { label: "接口地址", value: appConfig?.api_base_url ?? null },
        { label: "回调地址", value: appConfig?.callback_url ?? null },
        { label: "创建时间", value: appConfig?.created_at ?? null },
        { label: "更新时间", value: appConfig?.updated_at ?? null },
      ]}
    />
  );
};

export default TaobaoOrderCollectPage;
