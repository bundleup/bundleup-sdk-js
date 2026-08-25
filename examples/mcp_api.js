import { BundleUp } from '../dist/index.js';

const apiKey = process.env.BUNDLEUP_API_KEY;
const connectionId = process.env.BUNDLEUP_CONNECTION_ID;

if (!apiKey) {
  throw new Error('BUNDLEUP_API_KEY is required');
}

if (!connectionId) {
  throw new Error('BUNDLEUP_CONNECTION_ID is required for MCP example');
}

const client = new BundleUp(apiKey);
const mcp = client.mcp(connectionId);

console.log('MCP transport:', mcp.transport().url);

const response = await mcp.post(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'bundleup-example', version: '1.0.0' },
    },
  }),
);

console.log(`Status: ${response.status}`);

if (!response.ok) {
  // connection_invalid, connection_refresh_failed, mcp_not_supported, rate_limit
  const error = await response.json();
  console.error(`MCP request failed [${error.code}]: ${error.message}`);
} else {
  const sessionId = response.headers.get('mcp-session-id');
  console.log(`Session: ${sessionId ?? 'none'}`);
  console.log(`Content-Type: ${response.headers.get('content-type')}`);
  console.log(await response.text());

  if (sessionId) {
    await mcp.delete({ 'Mcp-Session-Id': sessionId });
  }
}
