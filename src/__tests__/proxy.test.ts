import { Proxy } from '../proxy';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Proxy', () => {
  let proxy: Proxy;
  const apiKey = 'test-api-key';
  const connectionId = 'conn_123';

  beforeEach(() => {
    proxy = new Proxy(apiKey, connectionId);
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should make a GET request with correct headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await proxy.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'BU-Connection-Id': connectionId,
          }),
        }),
      );

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl.toString()).toContain('https://proxy.bundleup.io/users');
    });

    it('should add leading slash to path if missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await proxy.get('users');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl.toString()).toContain('/users');
    });

    it('should include search params in URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await proxy.get('/users?page=1&limit=10');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl.toString()).toContain('page=1');
      expect(callUrl.toString()).toContain('limit=10');
    });

    it('should merge custom headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await proxy.get('/users', { 'X-Custom': 'header' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'header',
            Authorization: `Bearer ${apiKey}`,
          }),
        }),
      );
    });

    it('should throw error if path is missing', () => {
      expect(() => proxy.get('')).toThrow('Path is required for GET request.');
    });

    it('should throw error if headers is not an object', () => {
      expect(() => proxy.get('/users', 'invalid' as any)).toThrow('Headers must be an object.');
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1' }),
      });

      const body = { name: 'Test User' };
      await proxy.post('/users', JSON.stringify(body));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'BU-Connection-Id': connectionId,
          }),
          body: JSON.stringify(body),
        }),
      );
    });

    it('should throw error if path is missing', () => {
      expect(() => proxy.post('', '')).toThrow('Path is required for POST request.');
    });

    it('should throw error if headers is not an object', () => {
      expect(() => proxy.post('/users', '', 'invalid' as any)).toThrow('Headers must be an object.');
    });
  });

  describe('put', () => {
    it('should make a PUT request with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', name: 'Updated' }),
      });

      const body = { name: 'Updated User' };
      await proxy.put('/users/1', JSON.stringify(body));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'BU-Connection-Id': connectionId,
          }),
          body: JSON.stringify(body),
        }),
      );
    });

    it('should throw error if path is missing', () => {
      expect(() => proxy.put('', '')).toThrow('Path is required for PUT request.');
    });

    it('should throw error if headers is not an object', () => {
      expect(() => proxy.put('/users/1', '', 'invalid' as any)).toThrow('Headers must be an object.');
    });
  });

  describe('patch', () => {
    it('should make a PATCH request with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', name: 'Patched' }),
      });

      const body = { name: 'Patched User' };
      await proxy.patch('/users/1', JSON.stringify(body));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'BU-Connection-Id': connectionId,
          }),
          body: JSON.stringify(body),
        }),
      );
    });

    it('should throw error if path is missing', () => {
      expect(() => proxy.patch('', '')).toThrow('Path is required for PATCH request.');
    });

    it('should throw error if headers is not an object', () => {
      expect(() => proxy.patch('/users/1', '', 'invalid' as any)).toThrow('Headers must be an object.');
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await proxy.delete('/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'BU-Connection-Id': connectionId,
          }),
        }),
      );
    });

    it('should throw error if path is missing', () => {
      expect(() => proxy.delete('')).toThrow('Path is required for DELETE request.');
    });

    it('should throw error if headers is not an object', () => {
      expect(() => proxy.delete('/users/1', 'invalid' as any)).toThrow('Headers must be an object.');
    });
  });

  describe('URL building', () => {
    it('should build URLs with the proxy base URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await proxy.get('/api/users');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl.toString()).toBe('https://proxy.bundleup.io/api/users');
    });

    it('should handle search params correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await proxy.get('/users?filter=active&sort=name');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl.searchParams.get('filter')).toBe('active');
      expect(callUrl.searchParams.get('sort')).toBe('name');
    });
  });
});
