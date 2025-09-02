#!/bin/bash
set -e

PORT=${1:-3000}

WORK_DIR="$(dirname "$0")/../apps/web"
echo "Starting Next.js dev server in $WORK_DIR on http://localhost:$PORT ..."

# Start the dev server in background
cd "$WORK_DIR"
npm run dev -- -p "$PORT" &
PROC_ID=$!

sleep 4

# Check if listening
LISTENING=false
if command -v ss >/dev/null 2>&1; then
  if ss -tln | grep -q ":$PORT "; then
    LISTENING=true
  fi
elif command -v netstat >/dev/null 2>&1; then
  if netstat -tln | grep -q ":$PORT "; then
    LISTENING=true
  fi
fi

echo "Process Id: $PROC_ID"
if $LISTENING; then
  echo "Dev server is listening at http://localhost:$PORT"
else
  echo "Dev server started (it may still be warming up). Try http://localhost:$PORT"
fi
