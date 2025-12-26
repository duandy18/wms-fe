// src/features/admin/items/ItemsPage.tsx
//
// 商品主数据首页（Barcode Hub + 列表上方，条码管理下方布局）
//
// - 顶部：主条码覆盖率统计
// - 中部：Items 条码扫描台 + /scan probe 条码体检
// - 下部：新建商品表单
// - 底部：商品列表（上） + 当前商品条码管理（下）
//
// 本页的扫码逻辑：
// - 扫码台使用 useScanProbe("items") 调用 /scan(mode=pick, probe=true) 做条码体检
// - ItemsStore 中的 barcodeIndex 用于条码 → item_id 唯一反查
// - 若条码唯一绑定：自动选中商品行 + 滚动定位 + 展开条码管理面板

import React from "react";
import ItemsFormSection from "./ItemsFormSection";

import { UI } from "./page/ui";
import { useItemsPage } from "./page/useItemsPage";

import ItemsHeader from "./page/components/ItemsHeader";
import ItemsStatsGrid from "./page/components/ItemsStatsGrid";
import ItemsScanSection from "./page/components/ItemsScanSection";
import BarcodeProbeSection from "./page/components/BarcodeProbeSection";
import ItemsListCard from "./page/components/ItemsListCard";
import ItemBarcodesCard from "./page/components/ItemBarcodesCard";

const ItemsPage: React.FC = () => {
  const vm = useItemsPage();

  return (
    <div className={UI.page}>
      <ItemsHeader />

      <ItemsStatsGrid
        total={vm.stats.total}
        withPrimary={vm.stats.withPrimary}
        withoutPrimary={vm.stats.withoutPrimary}
      />

      <ItemsScanSection onScan={vm.handleScan} />

      {vm.scannedBarcode ? (
        <BarcodeProbeSection
          scannedBarcode={vm.scannedBarcode}
          owners={vm.owners}
          bindInfo={vm.bindInfo}
          probeLoading={vm.probeLoading}
          probeError={vm.probeError}
          probeResult={vm.probeResult}
          probeInfo={vm.probeInfo}
        />
      ) : null}

      {vm.error ? <div className={UI.errorBanner}>{vm.error}</div> : null}

      <ItemsFormSection />

      <ItemsListCard filter={vm.filter} onSetFilter={vm.setFilter} />

      <ItemBarcodesCard />
    </div>
  );
};

export default ItemsPage;
