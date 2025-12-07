// src/features/admin/users/types.ts

export type UserDTO = {
  id: number;
  username: string;
  role_id: number | null;
  is_active: boolean;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type RoleDTO = {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionDTO[];
};

export type PermissionDTO = {
  id: string;
  name: string;
  description: string | null;
};
