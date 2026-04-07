// src/shared/runtime/navigation.ts

import type {
  NavigationPage,
  NavigationResponse,
  NavigationRoutePrefix,
} from "./types";

export type PageIndex = Record<string, NavigationPage>;

export type ResolvedPage = {
  pageCode: string;
  pageName: string;
  parentCode: string | null;
  parentName: string | null;
  level: number;
  domainCode: string | null;
  matchedRoutePrefix: string;
  effectiveReadPermission: string | null;
  effectiveWritePermission: string | null;
  showInTopbar: boolean;
  showInSidebar: boolean;
};

type RoutePrefixRule = {
  routePrefix: string;
  pageCode: string;
  sortOrder: number;
  effectiveReadPermission: string | null;
  effectiveWritePermission: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function pickNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function pickBoolean(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function pickNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function normalizePath(path: string): string {
  const trimmed = (path || "").trim();
  if (!trimmed) return "/";
  if (trimmed === "/") return "/";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, "");
}

export function splitPath(path: string): string[] {
  const normalized = normalizePath(path);
  if (normalized === "/") return [];
  return normalized.split("/").filter(Boolean);
}

export function isStaticRoutePrefix(path: string): boolean {
  return splitPath(path).every((seg) => !seg.startsWith(":"));
}

export function normalizeNavigationPage(raw: unknown): NavigationPage | null {
  if (!isRecord(raw)) return null;

  const code = pickString(raw["code"]).trim();
  const name = pickString(raw["name"]).trim();

  if (!code || !name) return null;

  const rawChildren = Array.isArray(raw["children"]) ? raw["children"] : [];
  const children = rawChildren
    .map((child) => normalizeNavigationPage(child))
    .filter((child): child is NavigationPage => child !== null);

  return {
    code,
    name,
    parent_code: pickNullableString(raw["parent_code"]),
    level: pickNumber(raw["level"], 0),
    domain_code: pickNullableString(raw["domain_code"]),
    show_in_topbar: pickBoolean(raw["show_in_topbar"], false),
    show_in_sidebar: pickBoolean(raw["show_in_sidebar"], false),
    sort_order: pickNumber(raw["sort_order"], 0),
    is_active: pickBoolean(raw["is_active"], false),
    inherit_permissions: pickBoolean(raw["inherit_permissions"], false),
    effective_read_permission: pickNullableString(
      raw["effective_read_permission"],
    ),
    effective_write_permission: pickNullableString(
      raw["effective_write_permission"],
    ),
    children,
  };
}

export function normalizeNavigationRoutePrefix(
  raw: unknown,
): NavigationRoutePrefix | null {
  if (!isRecord(raw)) return null;

  const routePrefix = pickString(raw["route_prefix"]).trim();
  const pageCode = pickString(raw["page_code"]).trim();

  if (!routePrefix || !pageCode) return null;

  return {
    route_prefix: routePrefix,
    page_code: pageCode,
    sort_order: pickNumber(raw["sort_order"], 0),
    is_active: pickBoolean(raw["is_active"], false),
    effective_read_permission: pickNullableString(
      raw["effective_read_permission"],
    ),
    effective_write_permission: pickNullableString(
      raw["effective_write_permission"],
    ),
  };
}

export function normalizeNavigationResponse(
  raw: unknown,
): NavigationResponse {
  if (!isRecord(raw)) {
    return { pages: [], route_prefixes: [] };
  }

  const rawPages = Array.isArray(raw["pages"]) ? raw["pages"] : [];
  const rawRoutePrefixes = Array.isArray(raw["route_prefixes"])
    ? raw["route_prefixes"]
    : [];

  const pages = rawPages
    .map((page) => normalizeNavigationPage(page))
    .filter((page): page is NavigationPage => page !== null);

  const route_prefixes = rawRoutePrefixes
    .map((item) => normalizeNavigationRoutePrefix(item))
    .filter((item): item is NavigationRoutePrefix => item !== null);

  return { pages, route_prefixes };
}

export function buildPageIndex(pages: NavigationPage[]): PageIndex {
  const index: PageIndex = {};

  function walk(nodes: NavigationPage[]) {
    for (const node of nodes) {
      index[node.code] = node;
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  }

  walk(pages);
  return index;
}

function matchesPath(pathname: string, rulePath: string): boolean {
  const currentSegs = splitPath(pathname);
  const ruleSegs = splitPath(rulePath);

  if (ruleSegs.length === 0) {
    return currentSegs.length === 0;
  }

  if (currentSegs.length < ruleSegs.length) {
    return false;
  }

  for (let i = 0; i < ruleSegs.length; i += 1) {
    const ruleSeg = ruleSegs[i];
    const currentSeg = currentSegs[i];

    if (!currentSeg) return false;

    if (ruleSeg.startsWith(":")) {
      continue;
    }

    if (ruleSeg !== currentSeg) {
      return false;
    }
  }

  return true;
}

function buildScore(rulePath: string): number {
  const segs = splitPath(rulePath);
  const staticCount = segs.filter((seg) => !seg.startsWith(":")).length;
  const dynamicCount = segs.length - staticCount;
  return staticCount * 1000 + segs.length * 10 - dynamicCount;
}

function buildRouteRules(
  routePrefixes: NavigationRoutePrefix[],
): RoutePrefixRule[] {
  return routePrefixes
    .filter(
      (item) =>
        item.is_active === true &&
        item.page_code.trim() !== "" &&
        item.route_prefix.trim() !== "",
    )
    .map((item) => ({
      routePrefix: normalizePath(item.route_prefix),
      pageCode: item.page_code,
      sortOrder: item.sort_order,
      effectiveReadPermission: item.effective_read_permission,
      effectiveWritePermission: item.effective_write_permission,
    }));
}

export function resolvePageByPath(
  pathname: string,
  routePrefixes: NavigationRoutePrefix[],
  pageIndex: PageIndex,
): ResolvedPage | null {
  const normalizedPath = normalizePath(pathname);
  const rules = buildRouteRules(routePrefixes);

  const matches = rules.filter((rule) =>
    matchesPath(normalizedPath, rule.routePrefix),
  );

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => {
    const scoreDiff = buildScore(b.routePrefix) - buildScore(a.routePrefix);
    if (scoreDiff !== 0) return scoreDiff;

    const sortDiff = a.sortOrder - b.sortOrder;
    if (sortDiff !== 0) return sortDiff;

    return b.routePrefix.length - a.routePrefix.length;
  });

  const matched = matches[0];
  if (!matched) return null;

  const page = pageIndex[matched.pageCode];
  if (!page) return null;

  const parent = page.parent_code ? pageIndex[page.parent_code] : null;

  return {
    pageCode: page.code,
    pageName: page.name,
    parentCode: page.parent_code,
    parentName: parent?.name ?? null,
    level: page.level,
    domainCode: page.domain_code,
    matchedRoutePrefix: matched.routePrefix,
    effectiveReadPermission:
      matched.effectiveReadPermission ?? page.effective_read_permission,
    effectiveWritePermission:
      matched.effectiveWritePermission ?? page.effective_write_permission,
    showInTopbar: page.show_in_topbar,
    showInSidebar: page.show_in_sidebar,
  };
}

export function buildPrimaryPathByPageCode(
  routePrefixes: NavigationRoutePrefix[],
): Record<string, string> {
  const grouped = new Map<string, NavigationRoutePrefix[]>();

  for (const item of routePrefixes) {
    if (!item.is_active) continue;
    const key = item.page_code.trim();
    const routePrefix = item.route_prefix.trim();
    if (!key || !routePrefix) continue;

    const arr = grouped.get(key) ?? [];
    arr.push(item);
    grouped.set(key, arr);
  }

  const result: Record<string, string> = {};

  for (const [pageCode, items] of grouped.entries()) {
    items.sort((a, b) => {
      const aStatic = isStaticRoutePrefix(a.route_prefix) ? 0 : 1;
      const bStatic = isStaticRoutePrefix(b.route_prefix) ? 0 : 1;
      if (aStatic !== bStatic) return aStatic - bStatic;

      const sortDiff = a.sort_order - b.sort_order;
      if (sortDiff !== 0) return sortDiff;

      return a.route_prefix.length - b.route_prefix.length;
    });

    const picked = items[0];
    if (picked) {
      result[pageCode] = normalizePath(picked.route_prefix);
    }
  }

  return result;
}

export function canViewPage(
  page: NavigationPage,
  canFn: (perm: string) => boolean,
): boolean {
  const readPerm = page.effective_read_permission?.trim() ?? "";
  const writePerm = page.effective_write_permission?.trim() ?? "";

  if (!readPerm && !writePerm) return true;

  return (readPerm ? canFn(readPerm) : false) || (writePerm ? canFn(writePerm) : false);
}
