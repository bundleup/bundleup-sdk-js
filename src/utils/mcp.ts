import { isEmpty, isObject } from './helpers';

const PROTOCOL_VERSION = '2025-06-18';
const CLIENT_NAME = '@bundleup/sdk';
const CLIENT_VERSION = '0.3.0';

export interface Tool {
  name: string;
  title?: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
}

export interface Resource {
  uri: string;
  name: string;
  title?: string;
  description?: string;
  mimeType?: string;
}

export interface Prompt {
  name: string;
  title?: string;
  description?: string;
  arguments?: { name: string; description?: string; required?: boolean }[];
}

interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number | string;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * A connected MCP session.
 *
 * Tools, resources and prompts are defined by the provider — BundleUp does not
 * rename or normalize them. Created via `client.mcp(connectionId).connect()`.
 */
export class MCPClient {
  private sessionId: string | null = null;
  private isConnected: boolean = false;
  private handshake: Promise<void> | null = null;
  private lastId = 0;

  constructor(
    private baseURL: string,
    private apiKey: string,
    private connectionId: string,
  ) {}

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${this.apiKey}`,
      'BU-Connection-Id': this.connectionId,
    };

    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    return headers;
  }

  private async post(payload: Record<string, unknown>): Promise<Response> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const sessionId = response.headers.get('mcp-session-id');

    if (sessionId) {
      this.sessionId = sessionId;
    }

    if (!response.ok) {
      let message = `MCP request failed with status ${response.status}.`;

      try {
        // BundleUp rejections carry { code, message }; provider errors may not be JSON.
        const parsed = JSON.parse(await response.text());

        if (isObject(parsed) && typeof parsed.message === 'string') {
          message = typeof parsed.code === 'string' ? `${parsed.message} (${parsed.code})` : parsed.message;
        }
      } catch {
        // Keep the status-only message.
      }

      throw new Error(message);
    }

    return response;
  }

  /**
   * Pull the message matching `id` out of the response. Providers may answer a
   * plain request/response over `text/event-stream`, so both are handled.
   */
  private async parse(response: Response, id: number): Promise<JsonRpcMessage | null> {
    const body = await response.text();

    if (!body) {
      return null;
    }

    if (!response.headers.get('content-type')?.includes('text/event-stream')) {
      return JSON.parse(body) as JsonRpcMessage;
    }

    for (const event of body.replace(/\r\n/g, '\n').split('\n\n')) {
      const data = event
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trim())
        .join('\n');

      if (!data) {
        continue;
      }

      const message = JSON.parse(data) as JsonRpcMessage;

      // Skip server notifications interleaved on the stream.
      if (message.id === id) {
        return message;
      }
    }

    return null;
  }

  private async send(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const id = ++this.lastId;
    const response = await this.post({ jsonrpc: '2.0', id, method, params });
    const message = await this.parse(response, id);

    if (!message) {
      throw new Error(`No response received for ${method}.`);
    }

    if (message.error) {
      throw new Error(message.error.message);
    }

    return message.result ?? {};
  }

  /**
   * Run the MCP handshake, once. Deferred until the first call, and retried on
   * the next call if it fails.
   */
  private connect(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve();
    }

    if (!this.handshake) {
      const pending = (async () => {
        await this.send('initialize', {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: CLIENT_NAME, version: CLIENT_VERSION },
        });

        await this.post({ jsonrpc: '2.0', method: 'notifications/initialized' });

        this.isConnected = true;
      })();

      this.handshake = pending;

      pending.catch(() => {
        if (this.handshake === pending) {
          this.handshake = null;
        }
      });
    }

    return this.handshake;
  }

  private async paginate<T>(method: string, key: string): Promise<T[]> {
    await this.connect();

    const items: T[] = [];
    let cursor: string | undefined;

    do {
      const result = await this.send(method, cursor ? { cursor } : undefined);

      items.push(...((result[key] as T[]) ?? []));
      cursor = result.nextCursor as string | undefined;
    } while (cursor);

    return items;
  }

  /**
   * List the provider's tools, following pagination to the end.
   */
  public tools(): Promise<Tool[]> {
    return this.paginate<Tool>('tools/list', 'tools');
  }

  /**
   * Call a tool.
   * @param name - The tool name, as returned by `tools()`.
   * @param args - Arguments matching the tool's own `inputSchema`.
   */
  public async tool(name: string, args: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    if (isEmpty(name)) {
      throw new Error('Tool name is required to call a tool.');
    }

    if (!isObject(args)) {
      throw new Error('Tool arguments must be an object.');
    }

    await this.connect();

    return this.send('tools/call', { name, arguments: args });
  }

  /**
   * List the provider's resources, following pagination to the end.
   */
  public resources(): Promise<Resource[]> {
    return this.paginate<Resource>('resources/list', 'resources');
  }

  /**
   * Read a resource.
   * @param uri - The resource URI, as returned by `resources()`.
   */
  public async resource(uri: string): Promise<Record<string, unknown>> {
    if (isEmpty(uri)) {
      throw new Error('Resource URI is required to read a resource.');
    }

    await this.connect();

    return this.send('resources/read', { uri });
  }

  /**
   * List the provider's prompts, following pagination to the end.
   */
  public prompts(): Promise<Prompt[]> {
    return this.paginate<Prompt>('prompts/list', 'prompts');
  }

  /**
   * Get a prompt.
   * @param name - The prompt name, as returned by `prompts()`.
   * @param args - Arguments the prompt declares.
   */
  public async prompt(name: string, args: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    if (isEmpty(name)) {
      throw new Error('Prompt name is required to get a prompt.');
    }

    if (!isObject(args)) {
      throw new Error('Prompt arguments must be an object.');
    }

    await this.connect();

    return this.send('prompts/get', { name, arguments: args });
  }

  /**
   * Send any other JSON-RPC method on this session.
   */
  public async request(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (isEmpty(method)) {
      throw new Error('Method is required to send a request.');
    }

    await this.connect();

    return this.send(method, params);
  }

  /**
   * End the session and reset local state.
   */
  public async close(): Promise<void> {
    if (this.sessionId) {
      await fetch(this.baseURL, { method: 'DELETE', headers: this.headers }).catch(() => {});
    }

    this.sessionId = null;
    this.isConnected = false;
    this.handshake = null;
  }
}
