# ==============================
#   WMS-FE Makefile（前端专用）
# ==============================

SHELL := /bin/bash
PNPM  := pnpm

# ==============================
#  基础命令
# ==============================

# 安装依赖
.PHONY: install
install:
	$(PNPM) install

# 本地开发（Vite dev server）
.PHONY: dev
dev:
	$(PNPM) dev

# 构建生产包
.PHONY: build
build:
	$(PNPM) build

# 预览构建结果
.PHONY: preview
preview:
	$(PNPM) preview

# 单元测试（Vitest）
.PHONY: test
test:
	$(PNPM) test

# ==============================
#  Lint & Format
# ==============================

# 全量 Lint（若 package.json 已有 "lint" 脚本，则直接复用）
.PHONY: lint
lint:
	$(PNPM) lint

# ⭐ 关键路径 Lint（中试前重点检查的 FE 核心模块）
.PHONY: lint-core
lint-core:
	@echo "[lint-core] running ESLint on FE core modules..."
	$(PNPM) eslint \
		src/features/operations \
		src/features/diagnostics \
		src/features/dev \
		src/app \
		--ext .ts,.tsx

# 自动修复（可选）
.PHONY: lint-fix
lint-fix:
	$(PNPM) eslint . --ext .ts,.tsx --fix

# ==============================
#  清理构建缓存
# ==============================
.PHONY: clean
clean:
	rm -rf node_modules/.vite
	rm -rf dist

# 一键：安装 + Lint + Test（本地自检）
.PHONY: check
check: install lint-core test
	@echo "[check] wms-fe install + lint-core + test OK"
