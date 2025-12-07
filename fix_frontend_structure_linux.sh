#!/usr/bin/env bash
set -e

echo "=== [1] 重写 src/shared/useAuth.tsx 为 re-export ==="

mkdir -p src/shared

cat > src/shared/useAuth.tsx << 'EOF'
export * from "../app/auth/useAuth";
EOF

echo "✔ src/shared/useAuth.tsx -> export * from \"../app/auth/useAuth\""


echo "=== [2] 修复 Sidebar / Topbar 的 useAuth 引用 ==="

SIDEBAR="src/app/layout/Sidebar.tsx"
if [ -f "$SIDEBAR" ]; then
  sed -i -e 's@from "../shared/useAuth"@from "../auth/useAuth"@g' \
         -e 's@from "../../shared/useAuth"@from "../auth/useAuth"@g' \
         -e 's@from "../../features/auth/useAuth"@from "../auth/useAuth"@g' \
         "$SIDEBAR"
  echo "✔ 修复 $SIDEBAR 中的 useAuth 引用"
else
  echo "跳过：$SIDEBAR 不存在"
fi

TOPBAR="src/app/layout/Topbar.tsx"
if [ -f "$TOPBAR" ]; then
  sed -i -e 's@from "../shared/useAuth"@from "../auth/useAuth"@g' \
         -e 's@from "../../shared/useAuth"@from "../auth/useAuth"@g' \
         -e 's@from "../../features/auth/useAuth"@from "../auth/useAuth"@g' \
         "$TOPBAR"
  echo "✔ 修复 $TOPBAR 中的 useAuth 引用"
else
  echo "跳过：$TOPBAR 不存在"
fi


echo "=== [3] 修复 App.tsx 中的 Router 引用 ==="

APP="src/App.tsx"
if [ -f "$APP" ]; then
  sed -i -e 's@from "./router"@from "./app/router"@g' \
         -e 's@from "../router"@from "../app/router"@g' \
         "$APP"
  echo "✔ 修复 $APP 中的 Router 引用"
else
  echo "跳过：$APP 不存在"
fi


echo "=== [4] 修复 app/router/index.tsx 的页面 import 路径 ==="

ROUTER="src/app/router/index.tsx"
if [ -f "$ROUTER" ]; then
  sed -i -e 's@from "../pages/InboundPage"@from "../features/operations/inbound/InboundPage"@g' \
         -e 's@from "./pages/InboundPage"@from "../features/operations/inbound/InboundPage"@g' \
         -e 's@from "../pages/OutboundPickPage"@from "../features/operations/outbound-pick/OutboundPickPage"@g' \
         -e 's@from "./pages/OutboundPickPage"@from "../features/operations/outbound-pick/OutboundPickPage"@g' \
         -e 's@from "../pages/SnapshotPage"@from "../features/inventory/snapshot/SnapshotPage"@g' \
         -e 's@from "./pages/SnapshotPage"@from "../features/inventory/snapshot/SnapshotPage"@g' \
         -e 's@from "../pages/ChannelInventoryPage"@from "../features/inventory/channel-inventory/ChannelInventoryPage"@g' \
         -e 's@from "./pages/ChannelInventoryPage"@from "../features/inventory/channel-inventory/ChannelInventoryPage"@g' \
         -e 's@from "../pages/OutboundMetricsPage"@from "../features/inventory/outbound-metrics/OutboundMetricsPage"@g' \
         -e 's@from "./pages/OutboundMetricsPage"@from "../features/inventory/outbound-metrics/OutboundMetricsPage"@g' \
         -e 's@from "../pages/TracePage"@from "../features/diagnostics/trace/TracePage"@g' \
         -e 's@from "./pages/TracePage"@from "../features/diagnostics/trace/TracePage"@g' \
         -e 's@from "../pages/tools/StockToolPage"@from "../features/diagnostics/stock-tool/StockToolPage"@g' \
         -e 's@from "./pages/tools/StockToolPage"@from "../features/diagnostics/stock-tool/StockToolPage"@g' \
         -e 's@from "../pages/tools/LedgerToolPage"@from "../features/diagnostics/ledger-tool/LedgerToolPage"@g' \
         -e 's@from "./pages/tools/LedgerToolPage"@from "../features/diagnostics/ledger-tool/LedgerToolPage"@g' \
         -e 's@from "../features/stores/StoresListPage"@from "../features/admin/stores/StoresListPage"@g' \
         -e 's@from "./features/stores/StoresListPage"@from "../features/admin/stores/StoresListPage"@g' \
         -e 's@from "../features/stores/StoreDetailPage"@from "../features/admin/stores/StoreDetailPage"@g' \
         -e 's@from "./features/stores/StoreDetailPage"@from "../features/admin/stores/StoreDetailPage"@g' \
         "$ROUTER"
  echo "✔ 修复 $ROUTER 中的页面 import 路径"
else
  echo "跳过：$ROUTER 不存在"
fi

echo "=== 完成：1-4 步自动处理结束 ==="
