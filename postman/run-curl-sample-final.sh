#!/usr/bin/env bash
set -euo pipefail

# Multi-curl runner mirroring a subset of `postman/postman-sample-collection.json`.
# Constraints:
#   - No node/jq (bash + curl only)
#   - No test cases that read from files in postman/input
# Targets:
#   - Postman Echo: https://postman-echo.com
#   - httpbin:      https://httpbin.org
#
# Usage:
#   bash postman/run-curl-sample-final.sh

BASE_URL="https://postman-echo.com"
HTTPBIN_BASE_URL="https://httpbin.org"
SOURCE="newman-sample-github-collection"
HTTPBIN_USER="user"
HTTPBIN_PASS="passwd"
BEARER_TOKEN="my-demo-token"

REQUEST_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"

CURL_HTTP_STATUS=""
CURL_BODY=""

say() { printf "\n==> %s\n" "$*"; }

# Print a shell-escaped version of argv for logging/replay.
print_cmd() {
  # Print as: $ <command...>
  printf '$'
  local arg
  for arg in "$@"; do
    printf ' %q' "$arg"
  done
  printf '\n'
}

# curl_body METHOD URL [curl args...]
# Updates globals:
#   - CURL_HTTP_STATUS
#   - CURL_BODY
curl_body() {
  local method="$1"; shift
  local url="$1"; shift

  local tmp
  tmp="/tmp/ui-autitester-curl-body.$$"

  # Build and print the curl command we'll run
  local -a cmd
  cmd=(
    curl -sS -o "$tmp" -w '%{http_code}'
    -X "$method" "$url"
    -H "X-Request-Id: $REQUEST_ID"
  )
  if (($#)); then
    cmd+=("$@")
  fi
  print_cmd "${cmd[@]}"

  CURL_HTTP_STATUS="$("${cmd[@]}")"

  CURL_BODY="$(cat "$tmp")"
  rm -f "$tmp"
}

assert_status() {
  local got="$1"
  local expected="$2"
  [[ "$got" == "$expected" ]] || die "expected HTTP $expected but got $got"
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  # Normalize whitespace so assertions work against both minified and pretty-printed JSON
  local normalized
  normalized="$(printf "%s" "$haystack" | tr -d '[:space:]')"
  printf "%s" "$normalized" | grep -Fq "$needle" || die "expected response to contain: $needle"
}

say "Postman Echo: GET /get?source=..."
curl_body GET "$BASE_URL/get?source=$SOURCE" -H 'accept: application/json'
assert_status "$CURL_HTTP_STATUS" 200
assert_contains "$CURL_BODY" '"source":"'"$SOURCE"'"'

say "Postman Echo: POST /post text/plain"
curl_body POST "$BASE_URL/post" -H 'Content-Type: text/plain' --data 'hello-world'
assert_status "$CURL_HTTP_STATUS" 200
assert_contains "$CURL_BODY" '"data":"hello-world"'

say "Postman Echo: POST /post application/json"
json_payload='{"text":"hello-json"}'
curl_body POST "$BASE_URL/post" -H 'Content-Type: application/json' -H 'accept: application/json' --data "$json_payload"
assert_status "$CURL_HTTP_STATUS" 200
assert_contains "$CURL_BODY" '"json":'
assert_contains "$CURL_BODY" '"text":"hello-json"'

say "httpbin: Basic Auth"
curl_body GET "$HTTPBIN_BASE_URL/basic-auth/$HTTPBIN_USER/$HTTPBIN_PASS" -u "$HTTPBIN_USER:$HTTPBIN_PASS" -H 'accept: application/json'
assert_status "$CURL_HTTP_STATUS" 200
assert_contains "$CURL_BODY" '"authenticated":true'

say "httpbin: Bearer Token"
curl_body GET "$HTTPBIN_BASE_URL/bearer" -H "Authorization: Bearer $BEARER_TOKEN" -H 'accept: application/json'
assert_status "$CURL_HTTP_STATUS" 200
assert_contains "$CURL_BODY" '"authenticated":true'

say "httpbin: Stream 10 (NDJSON)"
stream_text="$(curl -sS -X GET "$HTTPBIN_BASE_URL/stream/10" -H 'accept: application/json')"
line_count="$(printf "%s" "$stream_text" | awk 'NF{c++} END{print c+0}')"
[[ "$line_count" == "10" ]] || die "expected 10 lines, got $line_count"

say "All curl scenarios passed."
