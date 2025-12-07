# WMS-FE · Frontend

这是 WMS-DU 的前端仓库，基于 React + TypeScript + Vite 构建。

后端服务在独立仓库：
https://github.com/duandy18/wms-du

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
- pnpm run lint (如存在)
- pnpm run test (如存在)
- pnpm run build

