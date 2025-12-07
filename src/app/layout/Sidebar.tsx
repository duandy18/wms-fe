// src/app/layout/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { menuSections } from "../router/menuConfig";

type OpenState = Record<string, boolean>;

/**
 * Sidebar（折叠 + 大字号版）
 *
 * - 一级菜单 = text-xl（20px）
 * - 二级菜单 = text-xl（20px）
 * - 顶部标题 = text-2xl（更稳的层级视觉）
 *
 * 当前版本：仅根据 showInSidebar / devOnly 控制是否显示，不做前端权限过滤。
 * RBAC 由后端接口权限 + 页面内部按钮控制来兜底。
 */
export function Sidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<OpenState>({});

  // 环境：只在 dev 环境显示 devOnly 菜单
  const IS_DEV_ENV =
    import.meta.env.VITE_WMS_ENV === "dev" ||
    import.meta.env.MODE === "development";

  // 过滤掉 devOnly 且当前不是 dev 环境的菜单项
  const visibleSections = useMemo(() => {
    return menuSections
      .map((section) => {
        const visibleItems = section.items.filter((item) => {
          if (item.showInSidebar === false) return false;
          if (item.devOnly && !IS_DEV_ENV) return false;
          return true;
        });
        return { ...section, items: visibleItems };
      })
      .filter((section) => section.items.length > 0);
  }, [IS_DEV_ENV]);

  // 根据当前路由自动展开所在分组
  useEffect(() => {
    const next: OpenState = {};
    for (const section of visibleSections) {
      const matched = section.items.some((item) => {
        return (
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
        );
      });
      next[section.id] = matched;
    }
    setOpenSections((prev) => ({ ...prev, ...next }));
  }, [location.pathname, visibleSections]);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="flex w-72 flex-col bg-slate-900 text-slate-100">
      {/* 顶部 Logo */}
      <div className="border-b border-slate-800 px-5 py-6 text-2xl font-bold">
        WMS-DU
      </div>

      {/* 导航主体 */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {visibleSections.map((section) => {
          const isOpen = openSections[section.id] ?? false;

          return (
            <div key={section.id}>
              {/* 一级分组标题（20px） */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between rounded-md px-3 py-3
                           text-xl font-semibold text-slate-200 hover:bg-slate-800/50"
              >
                <span>{section.label}</span>
                <span className="text-lg">{isOpen ? "▾" : "▸"}</span>
              </button>

              {/* 二级菜单项（20px） */}
              {isOpen && (
                <div className="mb-3 mt-2 space-y-2 pl-4">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "block rounded-lg px-4 py-3 text-xl",
                          isActive
                            ? "bg-slate-800 text-white"
                            : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                        ].join(" ")
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
