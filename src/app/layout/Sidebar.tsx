// src/app/layout/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { menuSections } from "../router/menuConfig";
import { useAuth } from "../../shared/useAuth";
import { resolvePermissionCodes } from "../auth/permissions";

type OpenState = Record<string, boolean>;

export function Sidebar() {
  const location = useLocation();
  const { can } = useAuth();
  const [openSections, setOpenSections] = useState<OpenState>({});

  const IS_DEV_ENV =
    import.meta.env.VITE_WMS_ENV === "dev" ||
    import.meta.env.MODE === "development";

  const visibleSections = useMemo(() => {
    return menuSections
      .map((section) => {
        const visibleItems = section.items.filter((item) => {
          if (item.showInSidebar === false) return false;
          if (item.devOnly && !IS_DEV_ENV) return false;

          if (item.requiredPermissions && item.requiredPermissions.length > 0) {
            // ✅ 直接使用后端权限名
            const perms = resolvePermissionCodes(item.requiredPermissions);
            const hasAny = perms.some((p) => can(p));
            if (!hasAny) return false;
          }

          return true;
        });
        return { ...section, items: visibleItems };
      })
      .filter((section) => section.items.length > 0);
  }, [IS_DEV_ENV, can]);

  useEffect(() => {
    const next: OpenState = {};
    for (const section of visibleSections) {
      const matched = section.items.some(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/"),
      );
      next[section.id] = matched;
    }
    setOpenSections((prev) => ({ ...prev, ...next }));
  }, [location.pathname, visibleSections]);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="flex w-72 flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-6 text-2xl font-bold">
        WMS-DU
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {visibleSections.map((section) => {
          const isOpen = openSections[section.id] ?? false;

          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between rounded-md px-3 py-3
                           text-xl font-semibold text-slate-200 hover:bg-slate-800/50"
              >
                <span>{section.label}</span>
                <span className="text-lg">{isOpen ? "▾" : "▸"}</span>
              </button>

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
