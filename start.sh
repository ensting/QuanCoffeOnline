#!/usr/bin/env bash
# Chạy game "Cà phê Vỉa Hè" trên Render (hoặc bất kỳ server Linux nào).
# Render gán cổng qua biến môi trường PORT, server.js đã đọc sẵn biến này.
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-3000}"
export PORT

if [ ! -d node_modules ]; then
  echo "==> Chưa có node_modules, đang cài thư viện..."
  if [ -f package-lock.json ]; then
    npm ci --omit=dev
  else
    npm install --omit=dev
  fi
fi

echo "==> Quán mở cửa tại cổng ${PORT}${CODE:+ (có mã phòng)}"
exec node server.js
