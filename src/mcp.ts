import { MCPClient } from './utils/mcp';
import { isObject } from './utils/helpers';

export class MCP {
  protected baseUrl = 'https://mcp.bundleup.io';

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${this.apiKey}`,
      'BU-Connection-Id': this.connectionId,
    };
  }

  constructor(
    private apiKey: string,
    private connectionId: string,
  ) {}

  /**
   * The URL and headers for this connection's MCP server.
   *
   * Hand these to an MCP client to let it drive the connection:
   *
   * ```ts
   * const { url, headers } = client.mcp('conn_123').transport();
   * new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers } });
   * ```
   */
  public transport(): { url: string; headers: Record<string, string> } {
    return { url: this.baseUrl, headers: this.headers };
  }

  /**
   * The server URL and a single bearer token carrying both the API key and the
   * connection.
   *
   * For model-hosted MCP — OpenAI's Responses API, Anthropic's Messages API —
   * where the model provider connects to the MCP server itself and accepts one
   * credential with no way to add a `BU-Connection-Id` header:
   *
   * ```ts
   * const { url, token } = client.mcp(connectionId).hosted();
   *
   * tools: [{ type: 'mcp', server_label: 'linear', server_url: url, authorization: token }]
   * ```
   *
   * This hands your API key to the model provider, whose servers make the
   * call. Use `transport()` for clients that run in your own backend.
   */
  public hosted(): { url: string; token: string } {
    return { url: this.baseUrl, token: `${this.apiKey}.${this.connectionId}` };
  }

  /**
   * Send a JSON-RPC message and return the raw response.
   *
   * The response is passed through untouched — it may be `application/json`
   * or `text/event-stream` depending on the provider.
   *
   * @param body - The JSON-RPC payload.
   * @param headers - Extra headers, merged over the defaults. Pass
   * `Mcp-Session-Id` here to stay on an existing session.
   */
  public post(body: BodyInit, headers: Record<string, string> = {}) {
    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    return fetch(this.baseUrl, {
      body,
      method: 'POST',
      headers: { ...this.headers, ...headers },
    });
  }

  /**
   * End an MCP session.
   *
   * @param headers - Extra headers, merged over the defaults. Pass the
   * session's `Mcp-Session-Id` here.
   */
  public delete(headers: Record<string, string> = {}) {
    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    return fetch(this.baseUrl, {
      method: 'DELETE',
      headers: { ...this.headers, ...headers },
    });
  }

  /**
   * Open a managed MCP session for this connection.
   *
   * Handles the handshake, session ID and response decoding, and exposes the
   * provider's tools, resources and prompts. Use `post` above instead if you
   * want to drive the protocol yourself.
   */
  connect() {
    return new MCPClient(this.baseUrl, this.apiKey, this.connectionId);
  }
}
