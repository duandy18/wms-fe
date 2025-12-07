// src/components/layout/Topbar.tsx
import { useLocation } from "react-router-dom";
import { flatRoutes } from "../../app/router/menuConfig";
import { useAuth } from "../../app/auth/useAuth";

export function Topbar() {
  const location = useLocation();
  const { user } = useAuth();

  const currentRoute = flatRoutes.find((r) =>
    location.pathname.startsWith(r.path),
  );

  return (
    <header className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        {/* 简易面包屑：先不做多级，只展示当前页面 */}
        <span className="font-medium">作业台 / 库存 / 管理 …</span>
        <span className="text-slate-400">/</span>
        <span>{currentRoute?.label ?? "首页"}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span className="text-slate-400">当前用户</span>
        <span className="font-medium">{user.username}</span>
      </div>
    </header>
  );
}
