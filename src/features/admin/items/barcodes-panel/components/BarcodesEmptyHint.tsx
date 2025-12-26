// src/features/admin/items/barcodes-panel/components/BarcodesEmptyHint.tsx

import React from "react";
import { UI } from "../ui";

export const BarcodesEmptyHint: React.FC<{ selected: boolean }> = ({ selected }) => {
  if (!selected) {
    return (
      <div className={UI.hint}>
        尚未选择商品。你可以：
        <br />
        ① 在上方“商品列表”中点击「管理条码」按钮；<br />
        ② 或在页面顶部的「Items 条码扫描台」扫描一个已绑定条码，系统会自动定位商品。
      </div>
    );
  }

  return <div className={UI.hint}>当前商品尚未配置任何条码，可通过下方表单新增。</div>;
};

export default BarcodesEmptyHint;
