#!/usr/bin/env bash
set -euo pipefail

domain="$1" # providers|contacts|schemes|zones|surcharges|copy

root="src/features/admin/shipping-providers"
api_ts="$root/api.ts"
old_file="$root/api.${domain}.ts"
new_dir="$root/api/${domain}"
new_index="$new_dir/index.ts"

if [[ ! -f "$api_ts" ]]; then
  echo "ERROR: missing $api_ts"
  exit 1
fi

if [[ ! -d "$new_dir" ]]; then
  echo "ERROR: missing dir $new_dir"
  exit 1
fi

if [[ ! -f "$new_index" ]]; then
  echo "ERROR: missing $new_index"
  exit 1
fi

echo "==> Switch export in $api_ts: api.${domain} -> api/${domain}"
perl -0777 -pi -e "s/export \\* from \\\"\\.\\/api\\.${domain}\\\";\\n/export * from \\\"\\.\\/api\\/${domain}\\\";\\n/g" "$api_ts"

if [[ -f "$old_file" ]]; then
  echo "==> Remove old file: $old_file"
  rm "$old_file"
else
  echo "==> Old file not found (skip): $old_file"
fi

echo "==> Scan for remaining references to api.${domain}"
rg -n --hidden --glob '!**/node_modules/**' "api\\.${domain}" "$root" || true
