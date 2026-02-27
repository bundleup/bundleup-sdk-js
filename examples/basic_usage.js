import { BundleUp } from '../dist/index.js';

const apiKey = process.env.BUNDLEUP_API_KEY;

if (!apiKey) {
  throw new Error('BUNDLEUP_API_KEY is required');
}

const client = new BundleUp(apiKey);

console.log('BundleUp JavaScript SDK: basic usage');

try {
  const connections = await client.connections.list();
  console.log(`Connections: ${connections.length}`);
} catch (error) {
  console.error(`Failed to list connections: ${error.message}`);
}

try {
  const integrations = await client.integrations.list();
  console.log(`Integrations: ${integrations.length}`);
} catch (error) {
  console.error(`Failed to list integrations: ${error.message}`);
}

try {
  const webhooks = await client.webhooks.list();
  console.log(`Webhooks: ${webhooks.length}`);
} catch (error) {
  console.error(`Failed to list webhooks: ${error.message}`);
}
