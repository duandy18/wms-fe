// src/shared/runtime/permissions.ts

import type { Permission } from "./types";

export function can(permissions: Permission[], perm: Permission): boolean {
  return permissions.includes(perm);
}

export function canAny(
  permissions: Permission[],
  perms: Permission[],
): boolean {
  return perms.some((p) => permissions.includes(p));
}

export function canAll(
  permissions: Permission[],
  perms: Permission[],
): boolean {
  return perms.every((p) => permissions.includes(p));
}
