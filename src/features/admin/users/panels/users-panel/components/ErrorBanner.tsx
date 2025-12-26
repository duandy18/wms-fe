// src/features/admin/users/panels/users-panel/components/ErrorBanner.tsx

import React from "react";
import { UI } from "../ui";

export const ErrorBanner: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  return <div className={UI.errorBanner}>{error}</div>;
};

export default ErrorBanner;
