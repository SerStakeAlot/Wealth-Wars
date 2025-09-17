# Wealth Wars Presence (AWS)

This folder contains a lightweight serverless presence service using:

- API Gateway WebSocket API (routes: `$connect`, `$disconnect`, `$default` and app routes: `hello`, `heartbeat`, `set:username`)
- Lambda (Node.js 18) to process routes
- DynamoDB (on-demand) to store active connections with TTL, enabling automatic expiry of stale connections

## Message protocol (client → server)

- hello: `{ type: "hello", payload: { id, username } }`
- heartbeat: `{ type: "heartbeat", payload: { username? } }`
- set:username: `{ type: "set:username", payload: { username } }`

## Broadcast (server → clients)

- presence:update: `{ type: "presence:update", payload: [ { id, username, lastSeen }, ... ] }`

## Deploy (AWS CLI / SAM)

Prereqs: `aws`, `sam` installed; configured AWS credentials.

```bash
# from repo root
cd infra/aws
sam build
sam deploy --guided \
  --capabilities CAPABILITY_IAM \
  --stack-name ww-presence \
  --parameter-overrides StageName=prod TtlSeconds=60
```

At the end, note the WebSocketUrl output and set it for the web app.

## Configure the web app

Set environment variable so the web connects to your AWS endpoint:

- `NEXT_PUBLIC_PRESENCE_WS_URL=wss://<api-id>.execute-api.<region>.amazonaws.com/prod`

For local dev without presence, omit the env var and the web will run in fallback mode.
