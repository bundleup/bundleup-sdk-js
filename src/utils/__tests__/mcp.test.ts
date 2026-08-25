import { MCPClient } from '../mcp';
import { MCP as UnifiedMCP } from '../../unify/mcp';
import { Unify } from '../../unify';

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;
const baseURL = 'https://mcp.bundleup.io';

interface FakeInit {
  sessionId?: string;
  status?: number;
  ok?: boolean;
  sse?: boolean;
}

function response(payload?: unknown, init: FakeInit = {}) {
  const { sessionId, status = 200, ok = true, sse = false } = init;

  let body = '';

  if (payload !== undefined) {
    body = sse
      ? (payload as unknown[]).map(message => `event: message\r\ndata: ${JSON.stringify(message)}\r\n\r\n`).join('')
      : JSON.stringify(payload);
  }

  return {
    ok,
    status,
    headers: {
      get: (name: string) => {
        const key = name.toLowerCase();

        if (key === 'content-type') {
          return sse ? 'text/event-stream' : 'application/json';
        }

        if (key === 'mcp-session-id') {
          return sessionId ?? null;
        }

        return null;
      },
    },
    text: async () => body,
  };
}

/** initialize + notifications/initialized, in that order. */
function mockHandshake(sessionId = 'sess_123') {
  mockFetch.mockResolvedValueOnce(
    response({ jsonrpc: '2.0', id: 1, result: { protocolVersion: '2025-06-18' } }, { sessionId }),
  );
  mockFetch.mockResolvedValueOnce(response(undefined, { status: 202 }));
}

function bodyOf(call: number): Record<string, unknown> {
  return JSON.parse(mockFetch.mock.calls[call][1].body);
}

function headersOf(call: number): Record<string, string> {
  return mockFetch.mock.calls[call][1].headers;
}

const TOOL = {
  name: 'create_issue',
  description: 'Create an issue',
  inputSchema: { type: 'object', properties: { title: { type: 'string' } } },
};

describe('MCPClient', () => {
  let client: MCPClient;
  const apiKey = 'test-api-key';
  const connectionId = 'conn_123';

  beforeEach(() => {
    client = new MCPClient(baseURL, apiKey, connectionId);
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should handshake before the first call', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [TOOL] } }));

      await client.listTools();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(bodyOf(0).method).toBe('initialize');
      expect(bodyOf(1).method).toBe('notifications/initialized');
      expect(bodyOf(1).id).toBeUndefined();
      expect(bodyOf(2).method).toBe('tools/list');
    });

    it('should handshake only once across calls', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 3, result: { resources: [] } }));

      await client.listTools();
      await client.listResources();

      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(bodyOf(3).method).toBe('resources/list');
    });

    it('should handshake once for concurrent calls', async () => {
      mockHandshake();
      mockFetch.mockResolvedValue(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));

      await Promise.all([client.listTools(), client.listTools()]);

      const handshakes = mockFetch.mock.calls.filter(call => JSON.parse(call[1].body).method === 'initialize');

      expect(handshakes).toHaveLength(1);
    });

    it('should send the session ID returned by initialize', async () => {
      mockHandshake('sess_abc');
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));

      await client.listTools();

      expect(headersOf(0)['Mcp-Session-Id']).toBeUndefined();
      expect(headersOf(2)['Mcp-Session-Id']).toBe('sess_abc');
    });

    it('should retry the handshake after a failure', async () => {
      mockFetch.mockResolvedValueOnce(
        response({ code: 'rate_limit', message: 'Too many requests' }, { ok: false, status: 429 }),
      );
      await expect(client.listTools()).rejects.toThrow('Too many requests (rate_limit)');

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 3, result: { tools: [TOOL] } }));

      await expect(client.listTools()).resolves.toEqual([TOOL]);
    });
  });

  describe('tools', () => {
    it('should return the provider tool list', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [TOOL] } }));

      await expect(client.listTools()).resolves.toEqual([TOOL]);
    });

    it('should follow nextCursor pagination', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(
        response({ jsonrpc: '2.0', id: 2, result: { tools: [TOOL], nextCursor: 'page2' } }),
      );
      mockFetch.mockResolvedValueOnce(
        response({ jsonrpc: '2.0', id: 3, result: { tools: [{ ...TOOL, name: 'list_issues' }] } }),
      );

      const tools = await client.listTools();

      expect(tools).toHaveLength(2);
      expect(bodyOf(3).params).toEqual({ cursor: 'page2' });
    });

    it('should parse a result delivered as an event stream', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(
        response(
          [
            { jsonrpc: '2.0', method: 'notifications/message', params: {} },
            { jsonrpc: '2.0', id: 2, result: { tools: [TOOL] } },
          ],
          { sse: true },
        ),
      );

      await expect(client.listTools()).resolves.toEqual([TOOL]);
    });
  });

  describe('tool', () => {
    it('should send the tool name and arguments', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(
        response({ jsonrpc: '2.0', id: 2, result: { content: [{ type: 'text', text: 'done' }] } }),
      );

      const result = await client.callTool('create_issue', { title: 'Login broken' });

      expect(bodyOf(2)).toEqual(
        expect.objectContaining({
          method: 'tools/call',
          params: { name: 'create_issue', arguments: { title: 'Login broken' } },
        }),
      );
      expect(result).toEqual({ content: [{ type: 'text', text: 'done' }] });
    });

    it('should require a tool name', async () => {
      await expect(client.callTool('')).rejects.toThrow('Tool name is required');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should surface a JSON-RPC error', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(
        response({ jsonrpc: '2.0', id: 2, error: { code: -32602, message: 'Unknown tool' } }),
      );

      await expect(client.callTool('nope')).rejects.toThrow('Unknown tool');
    });
  });

  describe('resources', () => {
    it('should list resources', async () => {
      const resource = { uri: 'file:///readme.md', name: 'readme' };

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { resources: [resource] } }));

      await expect(client.listResources()).resolves.toEqual([resource]);
      expect(bodyOf(2).method).toBe('resources/list');
    });

    it('should read a resource by URI', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { contents: [] } }));

      await client.readResource('file:///readme.md');

      expect(bodyOf(2)).toEqual(
        expect.objectContaining({ method: 'resources/read', params: { uri: 'file:///readme.md' } }),
      );
    });

    it('should require a URI', async () => {
      await expect(client.readResource('')).rejects.toThrow('Resource URI is required');
    });
  });

  describe('prompts', () => {
    it('should list prompts', async () => {
      const prompt = { name: 'summarize', description: 'Summarize an issue' };

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { prompts: [prompt] } }));

      await expect(client.listPrompts()).resolves.toEqual([prompt]);
    });

    it('should get a prompt by name', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { messages: [] } }));

      await client.getPrompt('summarize', { id: '123' });

      expect(bodyOf(2)).toEqual(
        expect.objectContaining({ method: 'prompts/get', params: { name: 'summarize', arguments: { id: '123' } } }),
      );
    });

    it('should require a prompt name', async () => {
      await expect(client.getPrompt('')).rejects.toThrow('Prompt name is required');
    });
  });

  describe('request', () => {
    it('should send an arbitrary method', async () => {
      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { ok: true } }));

      await expect(client.request('logging/setLevel', { level: 'debug' })).resolves.toEqual({ ok: true });
      expect(bodyOf(2).method).toBe('logging/setLevel');
    });

    it('should require a method', async () => {
      await expect(client.request('')).rejects.toThrow('Method is required');
    });
  });

  describe('errors', () => {
    it('should include the BundleUp error code in the message', async () => {
      mockFetch.mockResolvedValueOnce(
        response(
          { status: 400, code: 'connection_invalid', message: 'Missing or invalid connection ID' },
          {
            ok: false,
            status: 400,
          },
        ),
      );

      await expect(client.listTools()).rejects.toThrow('Missing or invalid connection ID (connection_invalid)');
    });

    it('should fall back to the status when the body is not JSON', async () => {
      mockFetch.mockResolvedValueOnce(response('gateway timeout', { ok: false, status: 504 }));

      await expect(client.listTools()).rejects.toThrow('MCP request failed with status 504.');
    });
  });

  describe('close', () => {
    it('should delete the session and reset state', async () => {
      mockHandshake('sess_xyz');
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));

      await client.listTools();

      mockFetch.mockResolvedValueOnce(response());
      await client.close();

      expect(mockFetch.mock.calls[3][1].method).toBe('DELETE');
      expect(mockFetch.mock.calls[3][1].headers['Mcp-Session-Id']).toBe('sess_xyz');
    });

    it('should not call DELETE without a session', async () => {
      await client.close();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handshake again after close', async () => {
      mockHandshake('sess_1');
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));
      await client.listTools();

      mockFetch.mockResolvedValueOnce(response());
      await client.close();

      mockHandshake('sess_2');
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 4, result: { tools: [TOOL] } }));
      await expect(client.listTools()).resolves.toEqual([TOOL]);
    });
  });

  describe('unified', () => {
    const unifiedURL = 'https://unify.bundleup.io/v1/mcp';

    it('should list tools against the Unified server', async () => {
      const unified = new UnifiedMCP(apiKey, connectionId);

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [TOOL] } }));

      await expect(unified.listTools()).resolves.toEqual([TOOL]);
      expect(mockFetch.mock.calls.every(call => call[0] === unifiedURL)).toBe(true);
    });

    it('should call a tool against the Unified server', async () => {
      const unified = new UnifiedMCP(apiKey, connectionId);

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { content: [] } }));

      await unified.callTool('send_message', { text: 'hi' });

      expect(bodyOf(2)).toEqual(
        expect.objectContaining({
          method: 'tools/call',
          params: { name: 'send_message', arguments: { text: 'hi' } },
        }),
      );
    });

    it('should reuse one session across calls', async () => {
      const unified = new UnifiedMCP(apiKey, connectionId);

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 3, result: { content: [] } }));

      await unified.listTools();
      await unified.callTool('send_message');

      const handshakes = mockFetch.mock.calls.filter(call => JSON.parse(call[1].body).method === 'initialize');

      expect(handshakes).toHaveLength(1);
    });

    it('should require a tool name', () => {
      const unified = new UnifiedMCP(apiKey, connectionId);

      expect(() => unified.callTool('')).toThrow('Tool name cannot be empty');
    });
  });

  describe('unified via Unify', () => {
    it('should reuse one client across accesses', () => {
      const unify = new Unify(apiKey, connectionId);

      expect(unify.mcp).toBe(unify.mcp);
    });

    it('should handshake once across separate accesses', async () => {
      const unify = new Unify(apiKey, connectionId);

      mockHandshake();
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 2, result: { tools: [] } }));
      mockFetch.mockResolvedValueOnce(response({ jsonrpc: '2.0', id: 3, result: { content: [] } }));

      await unify.mcp.listTools();
      await unify.mcp.callTool('send_message');

      const handshakes = mockFetch.mock.calls.filter(call => JSON.parse(call[1].body).method === 'initialize');

      expect(handshakes).toHaveLength(1);
    });
  });

  describe('unified hosted', () => {
    it('should expose the Unified URL and a composite token', () => {
      const unified = new UnifiedMCP(apiKey, connectionId);

      expect(unified.hosted()).toEqual({
        url: 'https://unify.bundleup.io/v1/mcp',
        token: `${apiKey}.${connectionId}`,
      });
    });
  });
});
