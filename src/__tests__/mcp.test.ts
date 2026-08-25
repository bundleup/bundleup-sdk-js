import { MCP } from '../mcp';
import { MCPClient } from '../utils/mcp';

// Mock the global fetch function
global.fetch = jest.fn();

describe('MCP', () => {
  let mcp: MCP;
  const apiKey = 'test-api-key';
  const connectionId = 'conn_123';

  beforeEach(() => {
    mcp = new MCP(apiKey, connectionId);
    jest.clearAllMocks();
  });

  describe('transport', () => {
    it('should return the URL and default headers', () => {
      const { url, headers } = mcp.transport();

      expect(url).toBe('https://mcp.bundleup.io');
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${apiKey}`,
        'BU-Connection-Id': connectionId,
      });
    });
  });

  describe('connect', () => {
    it('should return a managed client', () => {
      expect(mcp.connect()).toBeInstanceOf(MCPClient);
    });

    it('should return a new client each call', () => {
      expect(mcp.connect()).not.toBe(mcp.connect());
    });
  });

  describe('hosted', () => {
    it('should return the URL and a composite token', () => {
      expect(mcp.hosted()).toEqual({
        url: 'https://mcp.bundleup.io',
        token: `${apiKey}.${connectionId}`,
      });
    });
  });

  describe('post', () => {
    it('should make a POST request with correct headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: {} }),
      });

      const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

      await mcp.post(body);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://mcp.bundleup.io',
        expect.objectContaining({
          body,
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            Authorization: `Bearer ${apiKey}`,
            'BU-Connection-Id': connectionId,
          }),
        }),
      );
    });

    it('should merge custom headers over the defaults', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await mcp.post('{}', { 'Mcp-Session-Id': 'sess_abc' });

      const { headers } = (global.fetch as jest.Mock).mock.calls[0][1];

      expect(headers['Mcp-Session-Id']).toBe('sess_abc');
      expect(headers['BU-Connection-Id']).toBe(connectionId);
    });

    it('should return the response untouched', async () => {
      const response = { ok: true, status: 200, headers: new Map() };
      (global.fetch as jest.Mock).mockResolvedValueOnce(response);

      await expect(mcp.post('{}')).resolves.toBe(response);
    });

    it('should not throw on an error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 429 });

      const result = await mcp.post('{}');

      expect(result.status).toBe(429);
    });

    it('should throw if headers is not an object', () => {
      expect(() => mcp.post('{}', 'invalid' as unknown as Record<string, string>)).toThrow(
        'Headers must be an object.',
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should make a DELETE request with correct headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await mcp.delete({ 'Mcp-Session-Id': 'sess_abc' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://mcp.bundleup.io',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Mcp-Session-Id': 'sess_abc',
            'BU-Connection-Id': connectionId,
          }),
        }),
      );
    });

    it('should throw if headers is not an object', () => {
      expect(() => mcp.delete('invalid' as unknown as Record<string, string>)).toThrow('Headers must be an object.');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
