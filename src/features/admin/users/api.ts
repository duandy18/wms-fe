// src/features/admin/users/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type { UserDTO, RoleDTO, PermissionDTO } from "./types";

// ---------- Users ----------
export async function fetchUsers(): Promise<UserDTO[]> {
  return apiGet<UserDTO[]>("/users");
}

export async function createUser(payload: {
  username: string;
  password: string;
  role_id: number;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
}): Promise<void> {
  await apiPost("/users/register", payload);
}

export async function updateUser(
  userId: number,
  payload: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    role_id?: number | null;
    is_active?: boolean;
  },
): Promise<UserDTO> {
  return apiPatch<UserDTO>(`/users/${userId}`, payload);
}

export async function resetUserPassword(userId: number): Promise<void> {
  await apiPost(`/users/${userId}/reset-password`, {});
}

// ---------- Roles ----------
export async function fetchRoles(): Promise<RoleDTO[]> {
  return apiGet<RoleDTO[]>("/roles");
}

export async function createRole(payload: {
  name: string;
  description: string | null;
}): Promise<RoleDTO> {
  return apiPost<RoleDTO>("/roles", payload);
}

export async function setRolePermissions(
  roleId: string,
  ids: string[],
): Promise<RoleDTO> {
  return apiPatch<RoleDTO>(`/roles/${roleId}/permissions`, {
    permission_ids: ids,
  });
}

// ---------- Permissions ----------
export async function fetchPermissions(): Promise<PermissionDTO[]> {
  return apiGet<PermissionDTO[]>("/permissions");
}

export async function createPermission(payload: {
  name: string;
  description: string | null;
}): Promise<PermissionDTO> {
  return apiPost<PermissionDTO>("/permissions", payload);
}
