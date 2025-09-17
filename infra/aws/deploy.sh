#!/usr/bin/env bash
set -euo pipefail

STACK_NAME=${STACK_NAME:-ww-presence}
STAGE=${STAGE:-prod}
TTL_SECONDS=${TTL_SECONDS:-60}

cd "$(dirname "$0")"

sam build
sam deploy --no-confirm-changeset --resolve-s3 \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides StageName="$STAGE" TtlSeconds=$TTL_SECONDS
