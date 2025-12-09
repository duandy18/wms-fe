// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./src/App";
import "./index.css";

interface WindowWithMsw extends Window {
  __MSW_ENABLED__?: boolean | "starting";
}

const w = window as WindowWithMsw;

if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === "1") {
  import("./mocks/browser")
    .then(({ worker }) => {
      w.__MSW_ENABLED__ = "starting";
      return worker.start();
    })
    .then(() => {
      w.__MSW_ENABLED__ = true;
    })
    .catch(() => {
      w.__MSW_ENABLED__ = false;
    });
}

const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
