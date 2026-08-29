#!/bin/sh
set -e

node dist/remote-auth.js &
AUTH_PID=$!

node dist/http-server.js &
HTTP_PID=$!

trap 'kill "$AUTH_PID" "$HTTP_PID" 2>/dev/null || true' TERM INT

while kill -0 "$AUTH_PID" 2>/dev/null && kill -0 "$HTTP_PID" 2>/dev/null; do
  sleep 1
done

kill "$AUTH_PID" "$HTTP_PID" 2>/dev/null || true
wait "$AUTH_PID" "$HTTP_PID" 2>/dev/null || true
