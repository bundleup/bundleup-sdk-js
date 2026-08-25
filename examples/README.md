# BundleUp JavaScript SDK Examples

This folder contains runnable scripts that show common SDK workflows.

## Prerequisites

- Node.js 16+
- `npm install` run from `bundleup-sdk-js/`
- `BUNDLEUP_API_KEY` set in your environment

For examples that use a connected integration, also set:

- `BUNDLEUP_CONNECTION_ID`

## Run an Example

From `bundleup-sdk-js/`:

```bash
node examples/basic_usage.js
node examples/proxy_api.js
node examples/unify_api.js
node examples/mcp_api.js
```

## Scripts

- `basic_usage.js` — initialize the SDK and list connections, integrations, and webhooks
- `proxy_api.js` — send a GET request through the Proxy API
- `unify_api.js` — call Unify Chat, Git, and Ticketing endpoints
- `mcp_api.js` — open an MCP session against the provider's server for a connection
