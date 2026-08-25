# BundleUp JavaScript SDK

[![npm version](https://img.shields.io/npm/v/@bundleup/sdk.svg)](https://www.npmjs.com/package/@bundleup/sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Official JavaScript/TypeScript SDK for the [BundleUp](https://bundleup.io) API. Connect to 100+ integrations with a single, unified API. Build once, integrate everywhere.

## Table of Contents

- [Installation](#installation)
- [Requirements](#requirements)
- [Features](#features)
- [Examples](#examples)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [Connections](#connections)
  - [Integrations](#integrations)
  - [Webhooks](#webhooks)
  - [Proxy API](#proxy-api)
  - [Unify API](#unify-api)
  - [MCP API](#mcp-api)
- [Error Handling](#error-handling)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the SDK using your preferred package manager:

**npm:**

```bash
npm install @bundleup/sdk
```

**yarn:**

```bash
yarn add @bundleup/sdk
```

**pnpm:**

```bash
pnpm add @bundleup/sdk
```

## Requirements

- **Node.js**: 16.0.0 or higher
- **TypeScript**: 5.0+ (for TypeScript projects)
- **Fetch API**: Native fetch support (Node.js 18+) or polyfill for older versions

### Node.js Compatibility

For Node.js versions below 18, you'll need to install a fetch polyfill:

```bash
npm install node-fetch
```

Then import it before using the SDK:

```javascript
import fetch from 'node-fetch';
globalThis.fetch = fetch;
```

## Features

- 🚀 **TypeScript First** - Built with TypeScript, includes comprehensive type definitions
- 📦 **Modern JavaScript** - ESM and CommonJS support for maximum compatibility
- ⚡ **Promise-based API** - Async/await support using native fetch
- 🔌 **100+ Integrations** - Connect to Slack, GitHub, Jira, Linear, and many more
- 🎯 **Unified API** - Consistent interface across all integrations via Unify API
- 🔑 **Proxy API** - Direct access to underlying integration APIs
- 🤖 **MCP API** - Point any MCP client at a provider's server, scoped to one connection
- 🪶 **Lightweight** - Zero dependencies beyond native fetch API
- 🛡️ **Error Handling** - Comprehensive error messages and validation
- 📚 **Well Documented** - Extensive documentation and examples

## Examples

Runnable examples are available in the [`examples/`](./examples) directory:

- [`examples/basic_usage.js`](./examples/basic_usage.js) - Client setup, connections, integrations, and webhooks
- [`examples/proxy_api.js`](./examples/proxy_api.js) - Proxy API GET request with a connection
- [`examples/unify_api.js`](./examples/unify_api.js) - Unify Chat, Git, Ticketing, CRM, and Drive endpoint usage
- [`examples/README.md`](./examples/README.md) - Setup and execution instructions

## Quick Start

Get started with BundleUp in just a few lines of code:

```javascript
import { BundleUp } from '@bundleup/sdk';

// Initialize the client
const client = new BundleUp(process.env.BUNDLEUP_API_KEY);

// List all active connections
const connections = await client.connections.list();
console.log(`You have ${connections.length} active connections`);

// Use the Proxy API to make requests to integrated services
const proxy = client.proxy('conn_123');
const response = await proxy.get('/api/users');
const users = await response.json();
console.log('Users:', users);

// Use the Unify API for standardized data across integrations
const unify = client.unify('conn_456');
const channels = await unify.chat.channels({ limit: 10 });
console.log('Chat channels:', channels.data);
```

## Authentication

The BundleUp SDK uses API keys for authentication. You can obtain your API key from the [BundleUp Dashboard](https://app.bundleup.io).

### Getting Your API Key

1. Sign in to your [BundleUp Dashboard](https://app.bundleup.io)
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Copy your API key and store it securely

### Initializing the SDK

```javascript
import { BundleUp } from '@bundleup/sdk';

// Initialize with API key
const client = new BundleUp('your_api_key_here');

// Or use environment variable (recommended)
const client = new BundleUp(process.env.BUNDLEUP_API_KEY);
```

### Security Best Practices

- ✅ **DO** store API keys in environment variables
- ✅ **DO** use a secrets management service in production
- ✅ **DO** rotate API keys regularly
- ❌ **DON'T** commit API keys to version control
- ❌ **DON'T** hardcode API keys in your source code
- ❌ **DON'T** share API keys in public channels

**Example `.env` file:**

```bash
BUNDLEUP_API_KEY=bu_live_1234567890abcdefghijklmnopqrstuvwxyz
```

**Loading environment variables:**

```javascript
import 'dotenv/config'; // For Node.js projects
import { BundleUp } from '@bundleup/sdk';

const client = new BundleUp(process.env.BUNDLEUP_API_KEY);
```

## Core Concepts

### Platform API

The **Platform API** provides access to core BundleUp features like managing connections and integrations. Use this API to list, retrieve, and delete connections, as well as discover available integrations.

### Proxy API

The **Proxy API** allows you to make direct HTTP requests to the underlying integration's API through BundleUp. This is useful when you need access to integration-specific features not covered by the Unify API.

### Unify API

The **Unify API** provides a standardized, normalized interface across different integrations. For example, you can fetch chat channels from Slack, Discord, or Microsoft Teams using the same API call.

### MCP API

The **MCP API** reaches a provider's own MCP server using a connection's stored credentials. Tools are defined by the provider, not by BundleUp. Because the connection is chosen per client, one agent can serve many end users without ever handling a token.

## API Reference

### Connections

Manage your integration connections.

#### List Connections

Retrieve a list of all connections in your account.

```javascript
const connections = await client.connections.list();
```

**With query parameters:**

```javascript
const connections = await client.connections.list({
  integration_id: 'int_slack',
  limit: 50,
  offset: 0,
  external_id: 'user_123',
});
```

**Query Parameters:**

- `integration_id` (string): Filter by integration ID
- `integration_identifier` (string): Filter by integration identifier (e.g., 'slack', 'github')
- `external_id` (string): Filter by external user/account ID
- `limit` (number): Maximum number of results (default: 50, max: 100)
- `offset` (number): Number of results to skip for pagination

**Response:**

```typescript
[
  {
    id: 'conn_123abc',
    externalId: 'user_456',
    integrationId: 'int_slack',
    isValid: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    refreshedAt: '2024-01-20T14:22:00Z',
    expiresAt: '2024-04-20T14:22:00Z',
  },
  // ... more connections
];
```

#### Retrieve a Connection

Get details of a specific connection by ID.

```javascript
const connection = await client.connections.retrieve('conn_123abc');
```

**Response:**

```typescript
{
  id: 'conn_123abc',
  externalId: 'user_456',
  integrationId: 'int_slack',
  isValid: true,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:22:00Z',
  refreshedAt: '2024-01-20T14:22:00Z',
  expiresAt: '2024-04-20T14:22:00Z'
}
```

#### Delete a Connection

Remove a connection from your account.

```javascript
await client.connections.del('conn_123abc');
```

**Note:** Deleting a connection will revoke access to the integration and cannot be undone.

### Integrations

Discover and work with available integrations.

#### List Integrations

Get a list of all available integrations.

```javascript
const integrations = await client.integrations.list();
```

**With query parameters:**

```javascript
const integrations = await client.integrations.list({
  status: 'active',
  limit: 100,
  offset: 0,
});
```

**Query Parameters:**

- `status` (string): Filter by status ('active', 'inactive', 'beta')
- `limit` (number): Maximum number of results
- `offset` (number): Number of results to skip for pagination

**Response:**

```typescript
[
  {
    id: 'int_slack',
    identifier: 'slack',
    name: 'Slack',
    category: 'chat',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  // ... more integrations
];
```

#### Retrieve an Integration

Get details of a specific integration.

```javascript
const integration = await client.integrations.retrieve('int_slack');
```

**Response:**

```typescript
{
  id: 'int_slack',
  identifier: 'slack',
  name: 'Slack',
  category: 'chat',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
}
```

### Webhooks

Manage webhook subscriptions for real-time event notifications.

#### List Webhooks

Get all registered webhooks.

```javascript
const webhooks = await client.webhooks.list();
```

**With pagination:**

```javascript
const webhooks = await client.webhooks.list({
  limit: 50,
  offset: 0,
});
```

**Response:**

```typescript
[
  {
    id: 'webhook_123',
    name: 'My Webhook',
    url: 'https://example.com/webhook',
    events: {
      'connection.created': true,
      'connection.deleted': true,
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    lastTriggeredAt: '2024-01-20T14:22:00Z',
  },
];
```

#### Create a Webhook

Register a new webhook endpoint.

```javascript
const webhook = await client.webhooks.create({
  name: 'Connection Events Webhook',
  url: 'https://example.com/webhook',
  events: {
    'connection.created': true,
    'connection.deleted': true,
    'connection.updated': true,
  },
});
```

**Webhook Events:**

- `connection.created` - Triggered when a new connection is established
- `connection.deleted` - Triggered when a connection is removed
- `connection.updated` - Triggered when a connection is modified

**Request Body:**

```typescript
{
  name: string;           // Friendly name for the webhook
  url: string;            // Your webhook endpoint URL
  events: {               // Events to subscribe to
    [eventName: string]: boolean;
  };
}
```

**Response:**

```typescript
{
  id: 'webhook_123',
  name: 'Connection Events Webhook',
  url: 'https://example.com/webhook',
  events: {
    'connection.created': true,
    'connection.deleted': true,
    'connection.updated': true
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
}
```

#### Retrieve a Webhook

Get details of a specific webhook.

```javascript
const webhook = await client.webhooks.retrieve('webhook_123');
```

#### Update a Webhook

Modify an existing webhook.

```javascript
const updated = await client.webhooks.update('webhook_123', {
  name: 'Updated Webhook Name',
  url: 'https://example.com/new-webhook',
  events: {
    'connection.created': true,
    'connection.deleted': false,
  },
});
```

#### Delete a Webhook

Remove a webhook subscription.

```javascript
await client.webhooks.del('webhook_123');
```

#### Webhook Payload Example

When an event occurs, BundleUp sends a POST request to your webhook URL with the following payload:

```json
{
  "id": "evt_1234567890",
  "type": "connection.created",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "id": "conn_123abc",
    "external_id": "user_456",
    "integration_id": "int_slack",
    "is_valid": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Webhook Security

To verify webhook signatures:

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['bundleup-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook
  console.log('Webhook received:', req.body);
  res.status(200).send('OK');
});
```

### Proxy API

Make direct HTTP requests to integration APIs through BundleUp.

#### Creating a Proxy Instance

```javascript
const proxy = client.proxy('conn_123abc');
```

#### GET Request

```javascript
const response = await proxy.get('/api/users');
const data = await response.json();
console.log(data);
```

**With custom headers:**

```javascript
const response = await proxy.get('/api/users', {
  'X-Custom-Header': 'value',
  Accept: 'application/json',
});
```

#### POST Request

```javascript
const response = await proxy.post(
  '/api/users',
  JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'developer',
  }),
);

const newUser = await response.json();
console.log('Created user:', newUser);
```

**With custom headers:**

```javascript
const response = await proxy.post('/api/users', JSON.stringify({ name: 'John Doe' }), {
  'Content-Type': 'application/json',
  'X-API-Version': '2.0',
});
```

#### PUT Request

```javascript
const response = await proxy.put(
  '/api/users/123',
  JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
  }),
);

const updatedUser = await response.json();
```

#### PATCH Request

```javascript
const response = await proxy.patch(
  '/api/users/123',
  JSON.stringify({
    email: 'newemail@example.com',
  }),
);

const partiallyUpdated = await response.json();
```

#### DELETE Request

```javascript
const response = await proxy.delete('/api/users/123');

if (response.ok) {
  console.log('User deleted successfully');
}
```

#### Working with Different Content Types

**Sending form data:**

```javascript
const formData = new URLSearchParams();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');

const response = await proxy.post('/api/users', formData.toString(), {
  'Content-Type': 'application/x-www-form-urlencoded',
});
```

**Uploading files:**

```javascript
import FormData from 'form-data';
import fs from 'fs';

const form = new FormData();
form.append('file', fs.createReadStream('document.pdf'));
form.append('title', 'My Document');

const response = await proxy.post('/api/documents', form, form.getHeaders());
```

#### Handling Binary Data

```javascript
const response = await proxy.get('/api/files/download/123');
const buffer = await response.arrayBuffer();
fs.writeFileSync('downloaded-file.pdf', Buffer.from(buffer));
```

### Unify API

Access unified, normalized data across different integrations with a consistent interface.

#### Creating a Unify Instance

```javascript
const unify = client.unify('conn_123abc');
```

#### Chat API

The Chat API provides a unified interface for chat platforms like Slack, Discord, and Microsoft Teams.

##### List Users

Retrieve a list of users from the connected chat platform.

```javascript
const result = await unify.chat.users({
  limit: 100,
  after: null,
  include_raw: false,
});

console.log('Users:', result.data);
console.log('Next cursor:', result.metadata.next);
```

**Parameters:**

- `limit` (number, optional): Maximum number of users to return (default: 100, max: 1000)
- `after` (string, optional): Pagination cursor from previous response
- `include_raw` (boolean, optional): Include raw API response from the integration (default: false)

**Response:**

```typescript
{
  data: [
    {
      id: 'U1234567890',
      name: 'Jane Doe'
    }
  ],
  metadata: {
    next: 'cursor_abc123'
  }
}
```

##### List Channels

Retrieve a list of channels from the connected chat platform.

```javascript
const result = await unify.chat.channels({
  limit: 100,
  after: null,
  include_raw: false,
});

console.log('Channels:', result.data);
console.log('Next cursor:', result.metadata.next);
```

**Parameters:**

- `limit` (number, optional): Maximum number of channels to return (default: 100, max: 1000)
- `after` (string, optional): Pagination cursor from previous response
- `include_raw` (boolean, optional): Include raw API response from the integration (default: false)

**Response:**

```typescript
{
  data: [
    {
      id: 'C1234567890',
      name: 'general'
    },
    {
      id: 'C0987654321',
      name: 'engineering'
    }
  ],
  metadata: {
    next: 'cursor_abc123'  // Use this for pagination
  },
  _raw?: {  // Only present if include_raw: true
    // Original response from the integration API
  }
}
```

**Pagination example:**

```javascript
let allChannels = [];
let cursor = null;

do {
  const result = await unify.chat.channels({
    limit: 100,
    after: cursor,
  });

  allChannels = [...allChannels, ...result.data];
  cursor = result.metadata.next;
} while (cursor);

console.log(`Fetched ${allChannels.length} total channels`);
```

##### Send Message

Send a message to a channel on the connected chat platform.

```javascript
const result = await unify.chat.message('C1234567890', 'Hello from BundleUp! :wave:');

console.log('Message sent:', result.data);
```

**Parameters:**

- `channelId` (string, required): The ID of the channel to send the message to
- `text` (string, required): Markdown-formatted message text

**Response:**

```typescript
{
  data: {
    // Raw response data from the chat provider
  }
}
```

#### Git API

The Git API provides a unified interface for version control platforms like GitHub, GitLab, and Bitbucket.

##### List Repositories

```javascript
const result = await unify.git.repos({
  limit: 50,
  after: null,
  include_raw: false,
});

console.log('Repositories:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      id: '123456',
      name: 'my-awesome-project',
      full_name: 'organization/my-awesome-project',
      description: 'An awesome project',
      url: 'https://github.com/organization/my-awesome-project',
      created_at: '2023-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:22:00Z',
      pushed_at: '2024-01-20T14:22:00Z'
    }
  ],
  metadata: {
    next: 'cursor_xyz789'
  }
}
```

##### List Pull Requests

```javascript
const result = await unify.git.pulls('organization/repo-name', {
  limit: 20,
  after: null,
  include_raw: false,
});

console.log('Pull Requests:', result.data);
```

**Parameters:**

- `repoName` (string, required): Repository name in the format 'owner/repo'
- `limit` (number, optional): Maximum number of PRs to return
- `after` (string, optional): Pagination cursor
- `include_raw` (boolean, optional): Include raw API response

**Response:**

```typescript
{
  data: [
    {
      id: '12345',
      number: 42,
      title: 'Add new feature',
      description: 'This PR adds an awesome new feature',
      draft: false,
      state: 'open',
      url: 'https://github.com/org/repo/pull/42',
      user: 'john-doe',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:22:00Z',
      merged_at: null
    }
  ],
  metadata: {
    next: null
  }
}
```

##### List Tags

```javascript
const result = await unify.git.tags('organization/repo-name', {
  limit: 50,
});

console.log('Tags:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      name: 'v1.0.0',
      commit_sha: 'abc123def456'
    },
    {
      name: 'v0.9.0',
      commit_sha: 'def456ghi789'
    }
  ],
  metadata: {
    next: null
  }
}
```

##### List Releases

```javascript
const result = await unify.git.releases('organization/repo-name', {
  limit: 10,
});

console.log('Releases:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      id: '54321',
      name: 'Version 1.0.0',
      tag_name: 'v1.0.0',
      description: 'Initial release with all the features',
      prerelease: false,
      url: 'https://github.com/org/repo/releases/tag/v1.0.0',
      created_at: '2024-01-15T10:30:00Z',
      released_at: '2024-01-15T10:30:00Z'
    }
  ],
  metadata: {
    next: null
  }
}
```

##### List Branches

```javascript
const result = await unify.git.branches('organization/repo-name', {
  limit: 50,
});

console.log('Branches:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      name: 'main',
      commit_sha: 'abc123def456',
      protected: true
    }
  ],
  metadata: {
    next: null
  }
}
```

#### Ticketing API

The Ticketing API provides a unified interface for ticketing and project management platforms like Jira, Linear, and Asana.

##### List Tickets

```javascript
const result = await unify.ticketing.tickets({
  limit: 100,
  after: null,
  include_raw: false,
});

console.log('Tickets:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      id: 'PROJ-123',
      url: 'https://jira.example.com/browse/PROJ-123',
      title: 'Fix login bug',
      status: 'in_progress',
      description: 'Users are unable to log in',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:22:00Z'
    }
  ],
  metadata: {
    next: 'cursor_def456'
  }
}
```

**Filtering and sorting:**

```javascript
const openTickets = result.data.filter(ticket => ticket.status === 'open');
const sortedByDate = result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
```

#### CRM API

The CRM API provides a unified interface for CRM platforms like Attio, HubSpot, PipeDrive, Salesforce and Zoho.

##### List Companies

```javascript
const result = await unify.crm.companies({
  limit: 100,
  after: null,
  include_raw: false,
});

console.log('Companies:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      id: '12345',
      name: 'Acme Inc.',
      website: 'https://acme.example.com'
    }
  ],
  metadata: {
    next: null
  }
}
```

##### List Contacts

```javascript
const result = await unify.crm.contacts({
  limit: 100,
  after: null,
  include_raw: false,
});

console.log('Contacts:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      id: '67890',
      name: 'Jane Doe',
      email: 'jane@acme.example.com'
    }
  ],
  metadata: {
    next: null
  }
}
```

#### Drive API

The Drive API provides a unified interface for file storage platforms like Google Drive, OneDrive, Box, Dropbox and Microsoft SharePoint.

##### List Files

```javascript
const result = await unify.drive.files({
  limit: 100,
  after: null,
  include_raw: false,
});

console.log('Files:', result.data);
```

**Response:**

```typescript
{
  data: [
    {
      id: 'file_123',
      name: 'quarterly-report.pdf',
      mime_type: 'application/pdf',
      size: 204800,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:22:00Z',
      url: 'https://drive.example.com/file_123',
      is_folder: false
    }
  ],
  metadata: {
    next: null
  }
}
```

### MCP API

Reach a provider's own MCP server using a connection's credentials. BundleUp injects and refreshes the access token, so the connection ID is the only thing your agent needs to know about a user.

Supported for providers that run a first-party MCP server — see the [integrations page](https://www.bundleup.io/integrations). Others return an `mcp_not_supported` error.

`post` and `delete` are transport only, like the Proxy API — responses come back untouched. `connect()` layers a managed session on top when you would rather not drive the protocol yourself.

#### Creating an MCP Client

```javascript
const mcp = client.mcp('conn_123abc');
```

#### Managed Sessions

`connect()` returns a client that handles the handshake, session ID and response decoding, and exposes what the provider offers.

```javascript
const mcp = client.mcp('conn_123abc').connect();

const tools = await mcp.tools();
const result = await mcp.tool('create_issue', { title: 'Login broken' });

await mcp.close();
```

Resources and prompts follow the same plural/singular shape:

```javascript
const resources = await mcp.resources();
const contents = await mcp.resource('file:///readme.md');

const prompts = await mcp.prompts();
const messages = await mcp.prompt('summarize', { id: '123' });
```

Anything else in the protocol:

```javascript
await mcp.request('logging/setLevel', { level: 'debug' });
```

The handshake runs lazily on the first call and once per client, list methods follow `nextCursor` to the end, and `text/event-stream` responses are decoded for you. Errors throw with the provider's message, or BundleUp's with its code appended — `Missing or invalid connection ID (connection_invalid)`.

Call `close()` when you are done to end the session upstream.

#### Model-Hosted MCP

OpenAI and Anthropic can connect to an MCP server themselves, with no tool mapping or dispatch loop on your side. Both accept only a single credential and no custom headers, so `hosted()` returns the server URL alongside the API key and connection joined into one bearer.

```javascript
const { url, token } = client.mcp('conn_123abc').hosted();

const response = await openai.responses.create({
  model: 'gpt-4o',
  input: 'What issues are assigned to me?',
  tools: [
    {
      type: 'mcp',
      server_label: 'linear',
      server_url: url,
      authorization: token,
      require_approval: 'never',
    },
  ],
});
```

Anthropic's connector takes the same pair as `url` and `authorization_token`. `client.unify('conn_123abc').mcp.hosted()` returns them for Unified MCP.

`server_url` must be exactly the URL `hosted()` returns — the proxy rebuilds the upstream URL from the provider's own base, so any path or query you append is ignored rather than rejected.

This sends your API key to the model provider, whose servers make the request. Use an MCP client in your own backend if that is not acceptable.

#### Using an MCP Client Library

`transport()` returns the URL and headers if you would rather use an existing MCP client.

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const { url, headers } = client.mcp('conn_123abc').transport();

const mcpClient = new Client({ name: 'my-agent', version: '1.0.0' });
await mcpClient.connect(new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers } }));

const { tools } = await mcpClient.listTools();
```

#### Sending JSON-RPC Directly

MCP requires an `initialize` handshake before any other method. The session ID comes back on that first response and must be sent on every call after it.

```javascript
const mcp = client.mcp('conn_123abc');

// 1. Handshake
const init = await mcp.post(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'my-agent', version: '1.0.0' },
    },
  }),
);

const sessionId = init.headers.get('mcp-session-id');
const session = sessionId ? { 'Mcp-Session-Id': sessionId } : {};

// 2. Confirm the handshake (a notification — no id, no response body)
await mcp.post(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }), session);

// 3. List tools
const response = await mcp.post(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }), session);
const { result } = await parse(response);

console.log(result.tools);
```

Providers may answer with `text/event-stream` rather than JSON, so responses need unwrapping either way:

```javascript
async function parse(response) {
  const text = await response.text();

  if (!response.headers.get('content-type')?.includes('text/event-stream')) {
    return JSON.parse(text);
  }

  const data = text
    .split('\n')
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim())
    .join('\n');

  return JSON.parse(data);
}
```

Tool lists can be paginated. If `result.nextCursor` is set, call `tools/list` again with `params: { cursor: result.nextCursor }` until it comes back empty.

Calling a tool follows the same shape:

```javascript
const response = await mcp.post(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'create_issue', arguments: { title: 'Login broken' } },
  }),
  session,
);
```

#### Sessions

MCP sessions live on the provider's server — BundleUp holds no session state. Close one when you are done:

```javascript
await mcp.delete({ 'Mcp-Session-Id': sessionId });
```

#### Errors

BundleUp rejects a request before it reaches the provider by returning an HTTP error with a JSON body — the response is passed straight through, so check `response.ok` yourself.

```javascript
const response = await mcp.post(body);

if (!response.ok) {
  const { code, message } = await response.json();
  // connection_invalid, connection_refresh_failed, mcp_not_supported, rate_limit
  console.error(code, message);
}
```

Every JSON-RPC message counts toward the rate limit of 100 requests per 60 seconds, per connection — including the `initialize` handshake.

#### Merging Several Connections

An agent often needs more than one provider for the same end user. There is no merge helper in the SDK — how tools are namespaced, filtered and recovered from differs enough per agent that it is better written where you can see it:

```javascript
const clients = {
  slack: client.mcp(user.slackConnection).connect(),
  linear: client.mcp(user.linearConnection).connect(),
  crm: client.unify(user.hubspotConnection).mcp,
};

// One namespaced list: slack__send_message, linear__create_issue, …
const tools = (
  await Promise.all(
    Object.entries(clients).map(async ([label, mcp]) =>
      (await mcp.tools()).map(tool => ({ ...tool, name: `${label}__${tool.name}` })),
    ),
  )
).flat();

// Route a call back to the client that owns it
const call = (name, args) => {
  const [label, ...rest] = name.split('__');
  return clients[label].tool(rest.join('__'), args);
};
```

Anything that exposes `tools()` and `tool(name, args)` fits the same shape, so an internal tool layer of your own can sit in that map alongside BundleUp connections.

Two things worth handling that the sketch above skips. **Filter before you hand the list to a model** — three providers is easily sixty tools, and accuracy drops as that list grows, so select the ones the agent actually needs rather than passing everything. And decide what an unreachable provider should do: `Promise.all` fails the whole list, while `Promise.allSettled` lets the others through.

#### Unified MCP

BundleUp's normalized tools instead of the provider's, on the same protocol. Tools only — Unified MCP exposes no resources or prompts.

```javascript
const mcp = client.unify('conn_123abc').mcp;

const tools = await mcp.tools();
const result = await mcp.tool('send_message', { text: 'Deploy finished' });
```

`unify.mcp` is cached per `Unify` instance, so the handshake runs once no matter how often you read it. The server itself is stateless and POST-only, so there is no session to close.

## Error Handling

The SDK throws standard JavaScript errors with descriptive messages. Always wrap SDK calls in try-catch blocks for proper error handling.

```javascript
try {
  const connections = await client.connections.list();
} catch (error) {
  console.error('Failed to fetch connections:', error.message);
}
```

### Getting Help

If you're still experiencing issues:

1. Check the [BundleUp Documentation](https://docs.bundleup.io)
2. Search [GitHub Issues](https://github.com/bundleup/bundleup-sdk-js/issues)
3. Contact [support@bundleup.io](mailto:support@bundleup.io)

When reporting issues, please include:

- SDK version (`@bundleup/sdk` version from package.json)
- Node.js version (`node --version`)
- Minimal code to reproduce the issue
- Full error message and stack trace

## Development

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/bundleup/bundleup-sdk-js.git
cd bundleup-sdk-js/packages/sdk

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

### Project Structure

```
src/
├── index.ts              # Main entry point
├── proxy.ts              # Proxy API implementation
├── unify.ts              # Unify API implementation
├── utils.ts              # Utility functions
├── resources/
│   ├── base.ts          # Base resource class
│   ├── connection.ts    # Connections API
│   ├── integration.ts   # Integrations API
│   └── webhooks.ts      # Webhooks API
├── unify/
│   ├── base.ts          # Base Unify class
│   ├── chat.ts          # Chat Unify API
│   ├── git.ts           # Git Unify API
│   ├── ticketing.ts     # Ticketing Unify API
│   ├── crm.ts           # CRM Unify API
│   └── drive.ts         # Drive Unify API
└── __tests__/           # Test files
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- proxy.test.ts

# Run with coverage
npm test -- --coverage
```

### Building

```bash
# Build for production
npm run build

# Clean build artifacts
npm run clean

# Build and watch for changes
npm run dev
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Contributing

We welcome contributions to the BundleUp JavaScript SDK! Here's how you can help:

### Reporting Bugs

1. Check if the bug has already been reported in [GitHub Issues](https://github.com/bundleup/bundleup-sdk-js/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - SDK version and environment details

### Suggesting Features

1. Open a new issue with the "feature request" label
2. Describe the feature and its use case
3. Explain why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-new-feature`
3. Make your changes
4. Write or update tests
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature/my-new-feature`
8. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation for API changes
- Keep commits focused and atomic
- Write clear commit messages

## License

This package is available as open source under the terms of the [ISC License](https://opensource.org/licenses/ISC).

```
Copyright (c) 2026 BundleUp

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## Code of Conduct

Everyone interacting in the BundleUp project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/bundleup/javascript/blob/main/CODE_OF_CONDUCT).

---

Made with ❤️ by the [BundleUp](https://bundleup.io) team
