// src/app/layout/Topbar.tsx
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  buildPageIndex,
  resolvePageByPath,
  useNavigationRuntime,
  useSessionRuntime,
} from "../../shared/runtime";
import type { NavigationPage } from "../../shared/runtime/types";

function buildBreadcrumbItems(
  activePageCode: string | null,
  pageIndex: Record<string, NavigationPage>,
): string[] {
  const items: string[] = [];

  let currentCode = activePageCode;
  while (currentCode) {
    const page = pageIndex[currentCode];
    if (!page) break;

    items.push(page.name);
    currentCode = page.parent_code ?? null;
  }

  items.reverse();

  if (items.length === 0) {
    return ["首页", "概览"];
  }

  if (items.length === 1) {
    return [items[0], "概览"];
  }

  return items;
}

export function Topbar() {
  const { user, logout } = useSessionRuntime();
  const { pages, routePrefixes } = useNavigationRuntime();
  const location = useLocation();

  const pageIndex = useMemo(() => buildPageIndex(pages), [pages]);

  const resolvedPage = useMemo(
    () => resolvePageByPath(location.pathname, routePrefixes, pageIndex),
    [location.pathname, routePrefixes, pageIndex],
  );

  const breadcrumbItems = useMemo(
    () => buildBreadcrumbItems(resolvedPage?.pageCode ?? null, pageIndex),
    [resolvedPage, pageIndex],
  );

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <React.Fragment key={`${item}-${index}`}>
              <span
                className={[
                  "text-lg",
                  isLast
                    ? "font-semibold text-slate-900"
                    : isFirst
                      ? "font-semibold text-slate-900"
                      : "text-slate-700",
                ].join(" ")}
              >
                {item}
              </span>
              {!isLast ? (
                <span className="text-lg text-slate-400">/</span>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-6 text-slate-800">
        <button title="通知">🔔</button>
        <button title="帮助">❔</button>

        <div className="group relative">
          <button className="flex items-center gap-1 font-semibold text-slate-900">
            <span>{user?.username ?? "未登录"}</span>
            <span className="text-sm">▼</span>
          </button>

          <div className="absolute right-0 z-20 mt-1 hidden rounded border bg-white shadow group-hover:block">
            <button
              className="block w-full px-4 py-2 hover:bg-slate-100"
              onClick={logout}
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
