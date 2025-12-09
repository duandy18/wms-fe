// src/App.tsx
import React, { Suspense } from "react";
import AppRouter from "./app/router";

const App: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          前端加载中，请稍候…
        </div>
      }
    >
      <AppRouter />
    </Suspense>
  );
};

export default App;
