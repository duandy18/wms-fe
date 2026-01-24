// src/features/admin/users/iam/RolesManagePage.tsx
import React from "react";
import { UsersAdminPage } from "../UsersAdminPage";

/**
 * IAM / 角色管理
 */
const RolesManagePage: React.FC = () => {
  return <UsersAdminPage initialTab="roles" />;
};

export default RolesManagePage;
