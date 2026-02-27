import { BundleUp } from '../dist/index.js';

const apiKey = process.env.BUNDLEUP_API_KEY;
const connectionId = process.env.BUNDLEUP_CONNECTION_ID;
const path = process.env.BUNDLEUP_PROXY_PATH || '/users';

if (!apiKey) {
  throw new Error('BUNDLEUP_API_KEY is required');
}

if (!connectionId) {
  throw new Error('BUNDLEUP_CONNECTION_ID is required for proxy example');
}

const client = new BundleUp(apiKey);
const proxy = client.proxy(connectionId);

console.log(`Proxy GET ${path}`);

try {
  const response = await proxy.get(path);
  console.log(`Status: ${response.status}`);
  const body = await response.text();
  console.log(`Body: ${body}`);
} catch (error) {
  console.error(`Proxy request failed: ${error.message}`);
}
