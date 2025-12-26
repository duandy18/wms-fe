// src/features/admin/stores/detail/StoreDetailHeader.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import { UI } from "./ui";

export const StoreDetailHeader: React.FC<{
  onBack: () => void;

  presenterError: string | null;

  metaError: string | null;
  metaJustSaved: boolean;
}> = ({ onBack, presenterError, metaError, metaJustSaved }) => {
  return (
    <>
      <PageTitle title="商铺详情" description="平台商铺 · 仓库绑定关系" />

      <button type="button" className={UI.backLink} onClick={onBack}>
        ← 返回商铺管理
      </button>

      {presenterError ? <div className={UI.bannerErr}>{presenterError}</div> : null}

      {metaError ? <div className={UI.bannerErr}>{metaError}</div> : null}

      {metaJustSaved && !metaError ? <div className={UI.bannerOk}>店铺基础信息已保存。</div> : null}
    </>
  );
};

export default StoreDetailHeader;
