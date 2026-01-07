// src/features/admin/items/barcodes-panel/EmptyHint.tsx

import React from "react";

export const EmptyHint: React.FC = () => {
  return (
    <div className="text-lg text-slate-600 leading-relaxed">
      尚未选择商品。你可以：
      <br />
      ① 在上方“商品列表”中点击「管理」按钮；
      <br />
      ② 或在页面顶部的「Items 条码扫描台」扫描一个已绑定条码，系统会自动定位商品。
    </div>
  );
};

export default EmptyHint;
