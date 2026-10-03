#!/usr/bin/env bash
# IndexNow：向 Bing/Yandex/Naver/Seznam 即时通知 URL 更新（静态站点内容更新后运行）。
# 依赖：根目录 indexnow.key（内含 key），以及同名公钥文件 <key>.txt 已随站点发布（GitHub Pages 根目录）。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY="$(tr -d '\n\r' < "$ROOT/indexnow.key")"
HOST="tools.xugtek.com"
KEY_LOC="https://${HOST}/${KEY}.txt"

PAYLOAD="$(python3 - "$KEY" "$HOST" "$KEY_LOC" <<'PY'
import json, sys
key, host, key_loc = sys.argv[1], sys.argv[2], sys.argv[3]
urls = [
    f"https://{host}/",
    f"https://{host}/en/",
    f"https://{host}/token/",
    f"https://{host}/token/en.html",
    f"https://{host}/llm-rank/",
    f"https://{host}/llm-rank/en.html",
]
print(json.dumps({"host": host, "key": key, "keyLocation": key_loc, "urlList": urls}))
PY
)"

echo "Submitting 6 URLs via IndexNow (key ${KEY:0:8}…) ..."
RESP="$(curl -s -w '\n%{http_code}' -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "$PAYLOAD" --noproxy '*')"
CODE="$(printf '%s' "$RESP" | tail -n1)"
BODY="$(printf '%s' "$RESP" | sed '$d')"
echo "HTTP ${CODE} ${BODY}"
if [[ "$CODE" == "200" ]]; then
  echo "OK: 已通知搜索引擎更新。"
else
  echo "提示：200/202/204 均视为成功；429 为提交过快，需稍候重试。"
fi