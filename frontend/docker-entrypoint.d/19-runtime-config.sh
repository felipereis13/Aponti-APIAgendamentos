#!/bin/sh
set -eu

api_url="${API_URL:-${VITE_API_URL:-http://localhost:3000}}"

# A API deste projeto fica na raiz do dominio. Validar impede injetar JS.
if ! printf '%s\n' "$api_url" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?/?$'; then
  echo '[config] API_URL deve ser uma origem HTTP(S), ex.: https://minha-api.onrender.com' >&2
  exit 1
fi

printf 'window.__APP_CONFIG__ = {"apiUrl":"%s"};\n' "$api_url" > /usr/share/nginx/html/runtime-config.js
echo "[config] URL publica da API: $api_url"
