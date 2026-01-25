// src/features/admin/shipping-providers/pages/ShippingProviderDetailPage.tsx
//
// 历史兼容页（不再作为入口）
// Phase 6 收尾裁决：唯一入口 = 编辑网点页

import React from "react";
import { Navigate, useParams } from "react-router-dom";

const ShippingProviderDetailPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const pid = (providerId ?? "").trim();
  if (!pid) return <Navigate to="/admin/shipping-providers" replace />;
  return <Navigate to={`/admin/shipping-providers/${pid}/edit`} replace />;
};

export default ShippingProviderDetailPage;
