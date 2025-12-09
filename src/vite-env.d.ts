/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL?: string;
  readonly VITE_WMS_ENV?: "dev" | "test" | "prod";
  readonly MODE?: string;
  // 有新的 ENV 在这里继续加
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
