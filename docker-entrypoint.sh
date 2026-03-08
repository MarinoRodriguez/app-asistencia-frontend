#!/bin/sh
set -e

: "${VITE_API_URL:=}"

CONFIG_PATH="/usr/share/nginx/html/config.js"
cat > "$CONFIG_PATH" <<EOF
window.__ENV__ = window.__ENV__ || {};
window.__ENV__.VITE_API_URL = "${VITE_API_URL}";
EOF

exec "$@"
