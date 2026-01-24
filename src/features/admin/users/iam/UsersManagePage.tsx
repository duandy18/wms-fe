// src/features/admin/users/iam/UsersManagePage.tsx
import React from "react";
import { UsersAdminPage } from "../UsersAdminPage";

/**
 * IAM / 用户管理
 * Phase 5：Tab → Page
 * 当前复用 UsersAdminPage（users tab）
 */
const UsersManagePage: React.FC = () => {
  return <UsersAdminPage initialTab="users" />;
};

export default UsersManagePage;
