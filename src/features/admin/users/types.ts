// src/features/admin/users/types.ts

export type UserDTO = {
  id: number;
  username: string;
  is_active: boolean;

  full_name?: string | null;
  phone?: string | null;
  email?: string | null;

  /**
   * 后端当前仍会返回用户直配权限列表。
   * 前端矩阵页不再直接消费它，但保留类型以兼容现有 admin/users 基础接口。
   */
  permissions: string[];
};

export type PermissionDTO = {
  id: number;
  name: string;
};

export type PermissionMatrixCellDTO = {
  read: boolean;
  write: boolean;
};

export type PermissionMatrixPagesDTO = Record<string, PermissionMatrixCellDTO>;

export type PermissionMatrixPageDTO = {
  page_code: string;
  page_name: string;
  sort_order: number;
};

export type PermissionMatrixRowDTO = {
  user_id: number;
  username: string;
  full_name?: string | null;
  is_active: boolean;
  pages: PermissionMatrixPagesDTO;
};

export type UserPermissionMatrixDTO = {
  pages: PermissionMatrixPageDTO[];
  rows: PermissionMatrixRowDTO[];
};
