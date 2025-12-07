// src/main.tsx
/* eslint-disable react-refresh/only-export-components */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import AppRouter from "./app/router";
import { AuthProvider } from "./app/auth/useAuth";

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[RootErrorBoundary]", error, errorInfo);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
          <div className="max-w-2xl bg-white shadow rounded-xl p-6">
            <h1 className="text-lg font-semibold text-red-700 mb-3">
              前端渲染出错了
            </h1>
            <p className="text-sm text-slate-700 mb-2">错误信息：</p>
            <pre className="text-xs text-red-700 whitespace-pre-wrap max-h-[320px] overflow-auto">
              {error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const RootApp: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <RootApp />
    </RootErrorBoundary>
  </React.StrictMode>,
);
