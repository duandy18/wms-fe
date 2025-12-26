// src/features/admin/users/panels/users-panel/roleUtils.ts
//
// 角色展示工具（纯函数）

import type { RoleDTO } from "../../types";

export function roleName(roles: RoleDTO[], rid: number | null | undefined) {
  const r = roles.find((x) => Number(x.id) === Number(rid));
  return r?.name ?? (rid ? `#${rid}` : "-");
}
