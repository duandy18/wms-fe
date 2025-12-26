// src/features/admin/items/page/components/ItemsScanSection.tsx

import React from "react";
import { ScanConsole } from "../../../../../components/scan/ScanConsole";
import { UI } from "../ui";

export const ItemsScanSection: React.FC<{
  onScan: (barcode: string) => void;
}> = ({ onScan }) => {
  return (
    <section className={UI.card}>
      <h2 className={UI.h2}>Items 条码扫描台</h2>
      <p className={UI.hint11}>
        扫描任意条码，系统会调用 /scan(mode=pick, probe=true) 做一次条码体检，并在下方展示主数据绑定情况。你可以在条码管理卡片中完成绑定或调整。
      </p>
      <ScanConsole title="条码扫描（barcode → item）" modeLabel="items-page" scanMode="auto" onScan={onScan} />
    </section>
  );
};

export default ItemsScanSection;
