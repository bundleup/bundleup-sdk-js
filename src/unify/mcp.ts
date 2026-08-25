import { isEmpty } from '../utils/helpers';
import { MCPClient } from '../utils/mcp';

/**
 * The Unified MCP server.
 *
 * Same protocol and headers as Proxy MCP, but the tools are BundleUp's
 * normalized ones rather than the provider's. See https://docs.bundleup.io/mcp/unified
 *
 * The server is stateless and POST-only — it issues no `Mcp-Session-Id`, so
 * `connect().close()` is a no-op and `delete()` has nothing to end.
 */
export class MCP {
  private baseUrl = 'https://unify.bundleup.io/v1/mcp';
  private client: MCPClient;

  constructor(
    private apiKey: string,
    private connectionId: string,
  ) {
    this.client = new MCPClient(this.baseUrl, apiKey, connectionId);
  }

  /**
   * The server URL and a single bearer token carrying both the API key and the
   * connection, for model-hosted MCP clients that cannot set custom headers.
   */
  public hosted(): { url: string; token: string } {
    return { url: this.baseUrl, token: `${this.apiKey}.${this.connectionId}` };
  }

  /**
   * Get the list of available tools.
   */
  public listTools() {
    return this.client.listTools();
  }

  /**
   * Call a specific tool with optional arguments.
   */
  public callTool(name: string, args?: Record<string, unknown>) {
    if (isEmpty(name)) {
      throw new Error('Tool name cannot be empty');
    }

    return this.client.callTool(name, args);
  }
}
