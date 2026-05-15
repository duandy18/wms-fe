# WMS-FE · Frontend

这是 WMS-DU 的前端仓库，基于 React + TypeScript + Vite 构建。

后端服务在独立仓库：

https://github.com/duandy18/wms-api

## Local dev ports

| Component | Port | Purpose |
| --- | ---: | --- |
| wms-web | 5173 | Vite dev server |
| wms-api | 8000 | FastAPI / Uvicorn HTTP service |
| wms-db | 5433 | Shared local PostgreSQL host port, not a browser API |

See `docs/dev-ports.md` for the full local port contract.

## 开发

    pnpm install
    pnpm run dev

## 构建

    pnpm run build

## 测试

    pnpm run test

## CI

GitHub Actions 自动执行：

- pnpm install
- pnpm run lint
- pnpm run test
- pnpm run build
