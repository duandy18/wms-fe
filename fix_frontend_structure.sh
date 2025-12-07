#!/usr/bin/env bash

set -e

echo "=== 修复 useAuth：shared → app/auth ==="

# shared/useAuth.tsx 替换为 re-export
if [ -f "src/shared/useAuth.tsx" ]; then
  cat > src/shared/useAuth.tsx <<EOF
export * from "../app/auth/useAuth";
EOF
  echo "✔ 重写 src/shared/useAuth.tsx 为 re-export"
else
  echo "跳过：src/shared/useAuth.tsx 不存在"
fi


echo "=== 修复 Sidebar / Topbar 的 useAuth 引用 ==="

# 替换 Sidebar.tsx
SIDEBAR="src/app/layout/Sidebar.tsx"
if [ -f "$SIDEBAR" ]; then
  sed -i '' 's@from "..\/shared\/useAuth"@from "..\/auth\/useAuth"@g' "$SIDEBAR" || true
  sed -i '' 's@from "..\/..\/shared\/useAuth"@from "..\/auth\/useAuth"@g' "$SIDEBAR" || true
  sed -i '' 's@from "..\/..\/features\/auth\/useAuth"@from "..\/auth\/useAuth"@g' "$SIDEBAR" || true
  echo "✔ 修复 Sidebar.tsx useAuth 引用"
else
  echo "跳过：Sidebar.tsx 不存在"
fi

# 替换 Topbar.tsx
TOPBAR="src/app/layout/Topbar.tsx"
if [ -f "$TOPBAR" ]; then
  sed -i '' 's@from "..\/shared\/useAuth"@from "..\/auth\/useAuth"@g' "$TOPBAR" || true
  sed -i '' 's@from "..\/..\/shared\/useAuth"@from "..\/auth\/useAuth"@g' "$TOPBAR" || true
  sed -i '' 's@from "..\/..\/features\/auth\/useAuth"@from "..\/auth\/useAuth"@g' "$TOPBAR" || true
  echo "✔ 修复 Topbar.tsx useAuth 引用"
else
  echo "跳过：Topbar.tsx 不存在"
fi


echo "=== 修复 App.tsx 的 Router 引用 ==="

APP="src/App.tsx"
if [ -f "$APP" ]; then
  sed -i '' 's@from "./router"@from "./app/router"@g' "$APP" || true
  sed -i '' 's@from "\./router"@from "./app/router"@g' "$APP" || true
  sed -i '' 's@from "../router"@from "../app/router"@g' "$APP" || true
  echo "✔ 修复 App.tsx Router 引用"
else
  echo "跳过：App.tsx 不存在"
fi


echo "=== 修复 app/router/index.tsx 的页面 import 路径 ==="

ROUTER="src/app/router/index.tsx"

if [ -f "$ROUTER" ]; then

  sed -i '' 's@from "\.\./pages/InboundPage"@from "../features/operations/inbound/InboundPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/OutboundPickPage"@from "../features/operations/outbound-pick/OutboundPickPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/SnapshotPage"@from "../features/inventory/snapshot/SnapshotPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/ChannelInventoryPage"@from "../features/inventory/channel-inventory/ChannelInventoryPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/OutboundMetricsPage"@from "../features/inventory/outbound-metrics/OutboundMetricsPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/TracePage"@from "../features/diagnostics/trace/TracePage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/tools/StockToolPage"@from "../features/diagnostics/stock-tool/StockToolPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./pages/tools/LedgerToolPage"@from "../features/diagnostics/ledger-tool/LedgerToolPage"@g' "$ROUTER" || true

  # 商店/仓库管理
  sed -i '' 's@from "\.\./features/stores/StoresListPage"@from "../features/admin/stores/StoresListPage"@g' "$ROUTER" || true
  sed -i '' 's@from "\.\./features/stores/StoreDetailPage"@from "../features/admin/stores/StoreDetailPage"@g' "$ROUTER" || true

  echo "✔ 修复 Router 页面 import 路径"

else
  echo "跳过：Router index.tsx 不存在"
fi


echo "=== 全部修复完成 ==="
