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
import type { NavigationPage } from "../../shared/runtime/types";

type OpenState = Record<string, boolean>;

type SidebarNodeVM = {
  code: string;
  label: string;
  path: string | null;
  children: SidebarNodeVM[];
};

type SidebarSectionVM = {
  code: string;
  label: string;
  items: SidebarNodeVM[];
};

function sortPages(
  a: { sort_order: number; name: string },
  b: { sort_order: number; name: string },
): number {
  const sortDiff = a.sort_order - b.sort_order;
  if (sortDiff !== 0) return sortDiff;
  return a.name.localeCompare(b.name, "zh-CN");
}

function buildSidebarNodes(
  nodes: NavigationPage[],
  primaryPathByPageCode: Record<string, string>,
  canFn: (perm: string) => boolean,
): SidebarNodeVM[] {
  const mapped: Array<SidebarNodeVM | null> = [...nodes]
    .filter(
      (page) =>
        page.is_active &&
        page.show_in_sidebar &&
        canViewPage(page, canFn),
    )
    .sort(sortPages)
    .map((page): SidebarNodeVM | null => {
      const children = buildSidebarNodes(
        page.children,
        primaryPathByPageCode,
        canFn,
      );
      const path: string | null = primaryPathByPageCode[page.code] ?? null;

      if (!path && children.length === 0) {
        return null;
      }

      return {
        code: page.code,
        label: page.name,
        path,
        children,
      };
    });

  return mapped.filter((node): node is SidebarNodeVM => node !== null);
}

function buildActiveCodeSet(
  activePageCode: string | null,
  pageIndex: Record<string, NavigationPage>,
): Set<string> {
  const codes = new Set<string>();

  let currentCode = activePageCode;
  while (currentCode) {
    codes.add(currentCode);
    currentCode = pageIndex[currentCode]?.parent_code ?? null;
  }

  return codes;
}

function resolveRootSectionCode(
  activePageCode: string | null,
  pageIndex: Record<string, NavigationPage>,
): string | null {
  let currentCode = activePageCode;
  let rootCode: string | null = null;

  while (currentCode) {
    rootCode = currentCode;
    currentCode = pageIndex[currentCode]?.parent_code ?? null;
  }

  return rootCode;
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

  const resolvedPage = useMemo(
    () => resolvePageByPath(location.pathname, routePrefixes, pageIndex),
    [location.pathname, routePrefixes, pageIndex],
  );

  const activeCodeSet = useMemo(
    () => buildActiveCodeSet(resolvedPage?.pageCode ?? null, pageIndex),
    [resolvedPage, pageIndex],
  );

  const visibleSections = useMemo<SidebarSectionVM[]>(() => {
    return [...pages]
      .filter((page) => page.is_active)
      .sort(sortPages)
      .map((section): SidebarSectionVM | null => {
        const items = buildSidebarNodes(
          section.children,
          primaryPathByPageCode,
          can,
        );

        if (items.length > 0) {
          return {
            code: section.code,
            label: section.name,
            items,
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
                children: [],
              },
            ],
          };
        }

        return null;
      })
      .filter((section): section is SidebarSectionVM => section !== null)
      .filter((section) => section.items.length > 0);
  }, [pages, primaryPathByPageCode, can]);

  useEffect(() => {
    const activeSectionCode = resolveRootSectionCode(
      resolvedPage?.pageCode ?? null,
      pageIndex,
    );
    if (!activeSectionCode) return;

    setOpenSections((prev) => ({
      ...prev,
      [activeSectionCode]: true,
    }));
  }, [resolvedPage, pageIndex]);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  function renderNode(node: SidebarNodeVM, depth = 0): React.ReactNode {
    const isActive = activeCodeSet.has(node.code);
    const linkClass = [
      "block rounded-lg px-4 py-3",
      depth === 0 ? "text-xl" : "text-lg",
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
    ].join(" ");

    const groupClass = [
      "block rounded-md px-4 py-2",
      depth === 0 ? "text-xl font-semibold" : "text-lg font-semibold",
      isActive ? "bg-slate-800/40 text-white" : "text-slate-200",
    ].join(" ");

    if (node.children.length === 0) {
      if (!node.path) return null;

      return (
        <NavLink key={node.code} to={node.path} className={linkClass}>
          {node.label}
        </NavLink>
      );
    }

    return (
      <div key={node.code}>
        {node.path ? (
          <NavLink to={node.path} className={groupClass}>
            {node.label}
          </NavLink>
        ) : (
          <div className={groupClass}>{node.label}</div>
        )}

        <div className="mt-2 space-y-2 border-l border-slate-800 pl-4">
          {node.children.map((child) => renderNode(child, depth + 1))}
        </div>
      </div>
    );
  }

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
                  {section.items.map((item) => renderNode(item))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
