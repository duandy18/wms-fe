#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import sys

TARGET = Path("src/contracts/generated/api.ts")

# 1) Zod v4: z.record(keyType, valueType)
# openapi-zod-client 常生成 Zod v3 风格：z.record(valueType) 或 .record(valueType)
# 我们把所有单参数的 record(...) 统一补上 keyType = z.string()
RECORD_CALL = re.compile(r"(\bz\.record|\.\s*record)\(\s*(?!z\.string\(\)\s*,)")

# 2) 生成物里常出现 `{}` 空对象类型，触发 @typescript-eslint/no-empty-object-type
# 生成物不应手改，所以在文件头插入 eslint-disable（幂等）
ESLINT_BANNER = "/* eslint-disable @typescript-eslint/no-empty-object-type */\n"

def main() -> int:
    if not TARGET.exists():
        print(f"missing: {TARGET}", file=sys.stderr)
        return 2

    s = TARGET.read_text(encoding="utf-8")
    orig = s

    # 插入 eslint banner（幂等）
    if not s.startswith(ESLINT_BANNER):
        s = ESLINT_BANNER + s

    # record 修补
    s = RECORD_CALL.sub(r"\1(z.string(), ", s)

    if s != orig:
        TARGET.write_text(s, encoding="utf-8")
        print("patched:", TARGET)
    else:
        print("no changes:", TARGET)

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
