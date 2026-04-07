// src/app/layout/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  buildPageIndex,
  buildPrimaryPathByPageCode,
  canViewPage,
  resolvePageByPath,
  useNavigationRuntime,
  usePermissionRuntime,
} from "../../shared/runtime";

type OpenState = Record<string, boolean>;

type SidebarItemVM = {
  code: string;
  label: string;
  path: string;
};

type SidebarSectionVM = {
  code: string;
  label: string;
  items: SidebarItemVM[];
};

function sortPages(
  a: { sort_order: number; name: string },
  b: { sort_order: number; name: string },
): number {
  const sortDiff = a.sort_order - b.sort_order;
  if (sortDiff !== 0) return sortDiff;
  return a.name.localeCompare(b.name, "zh-CN");
}

export function Sidebar() {
  const location = useLocation();
  const { can } = usePermissionRuntime();
  const { pages, routePrefixes, navigationError } = useNavigationRuntime();
  const [openSections, setOpenSections] = useState<OpenState>({});

  const pageIndex = useMemo(() => buildPageIndex(pages), [pages]);

  const primaryPathByPageCode = useMemo(
    () => buildPrimaryPathByPageCode(routePrefixes),
    [routePrefixes],
  );

  const visibleSections = useMemo<SidebarSectionVM[]>(() => {
    return [...pages]
      .filter((page) => page.is_active)
      .sort(sortPages)
      .map((section) => {
        const visibleChildren = [...section.children]
          .filter(
            (child) =>
              child.is_active &&
              child.show_in_sidebar &&
              canViewPage(child, can),
          )
          .sort(sortPages)
          .map((child) => {
            const path = primaryPathByPageCode[child.code];
            if (!path) return null;

            return {
              code: child.code,
              label: child.name,
              path,
            };
          })
          .filter((item): item is SidebarItemVM => item !== null);

        if (visibleChildren.length > 0) {
          return {
            code: section.code,
            label: section.name,
            items: visibleChildren,
          };
        }

        const sectionPath = primaryPathByPageCode[section.code];
        if (
          section.show_in_sidebar &&
          sectionPath &&
          canViewPage(section, can)
        ) {
          return {
            code: section.code,
            label: section.name,
            items: [
              {
                code: section.code,
                label: section.name,
                path: sectionPath,
              },
            ],
          };
        }

        return null;
      })
      .filter((section): section is SidebarSectionVM => section !== null)
      .filter((section) => section.items.length > 0);
  }, [pages, primaryPathByPageCode, can]);

  const resolvedPage = useMemo(
    () => resolvePageByPath(location.pathname, routePrefixes, pageIndex),
    [location.pathname, routePrefixes, pageIndex],
  );

  useEffect(() => {
    const activeSectionCode = resolvedPage?.parentCode ?? resolvedPage?.pageCode ?? null;
    if (!activeSectionCode) return;

    setOpenSections((prev) => ({
      ...prev,
      [activeSectionCode]: true,
    }));
  }, [resolvedPage]);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="flex w-72 flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-6 text-2xl font-bold">
        WMS-DU
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {navigationError && visibleSections.length === 0 ? (
          <div className="rounded-lg border border-amber-700/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-200">
            导航加载失败：{navigationError}
          </div>
        ) : null}

        {visibleSections.map((section) => {
          const isOpen = openSections[section.code] ?? false;

          return (
            <div key={section.code}>
              <button
                type="button"
                onClick={() => toggleSection(section.code)}
                className="flex w-full items-center justify-between rounded-md px-3 py-3 text-xl font-semibold text-slate-200 hover:bg-slate-800/50"
              >
                <span>{section.label}</span>
                <span className="text-lg">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div className="mb-3 mt-2 space-y-2 pl-4">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.code}
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
