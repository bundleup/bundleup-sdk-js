import { Base } from '../base';

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

interface Thing {
  id: string;
}

/** Exposes the protected surface so the shared behaviour can be tested once. */
class Things extends Base<Thing> {
  protected namespace = 'things';

  public list(searchParams?: Record<string, unknown>) {
    return super.list(searchParams);
  }

  public create(body: Record<string, unknown>) {
    return super.create(body);
  }

  public retrieve(id: string) {
    return super.retrieve(id);
  }

  public update(id: string, body: Record<string, unknown>) {
    return super.update(id, body);
  }

  public del(id: string) {
    return super.del(id);
  }

  public url(path?: string | null, searchParams?: unknown) {
    return this.buildUrl(path, searchParams as Record<string, unknown>);
  }
}

function ok(payload: unknown = {}) {
  return { ok: true, status: 200, json: async () => payload };
}

function failed(statusText = 'Internal Server Error', status = 500) {
  return { ok: false, status, statusText, json: async () => ({}) };
}

function callUrl(index = 0): string {
  return mockFetch.mock.calls[index][0].toString();
}

function callInit(index = 0) {
  return mockFetch.mock.calls[index][1];
}

describe('resources Base', () => {
  let things: Things;
  const apiKey = 'test-api-key';

  beforeEach(() => {
    things = new Things(apiKey);
    jest.clearAllMocks();
  });

  describe('url building', () => {
    it('should target the versioned namespace', async () => {
      mockFetch.mockResolvedValueOnce(ok([]));

      await things.list();

      expect(callUrl()).toBe('https://api.bundleup.io/v1/things');
    });

    it('should append the ID as a path segment', async () => {
      mockFetch.mockResolvedValueOnce(ok({ id: '1' }));

      await things.retrieve('thing_1');

      expect(callUrl()).toBe('https://api.bundleup.io/v1/things/thing_1');
    });

    it('should serialize search params', async () => {
      mockFetch.mockResolvedValueOnce(ok([]));

      await things.list({ limit: 10, offset: 20 });

      expect(callUrl()).toBe('https://api.bundleup.io/v1/things?limit=10&offset=20');
    });

    it('should throw on non-object search params', () => {
      expect(() => things.url('thing_1', 'nope')).toThrow('URL search params must be an object.');
    });

    it('should drop undefined and null params but keep false and zero', async () => {
      mockFetch.mockResolvedValueOnce(ok([]));

      await things.list({ limit: 0, active: false, cursor: undefined, owner: null });

      expect(callUrl()).toBe('https://api.bundleup.io/v1/things?limit=0&active=false');
    });
  });

  describe('headers', () => {
    it('should send the API key and JSON content type', async () => {
      mockFetch.mockResolvedValueOnce(ok([]));

      await things.list();

      expect(callInit().headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      });
    });
  });

  describe('list', () => {
    it('should return the payload', async () => {
      mockFetch.mockResolvedValueOnce(ok([{ id: '1' }, { id: '2' }]));

      await expect(things.list()).resolves.toEqual([{ id: '1' }, { id: '2' }]);
      expect(callInit().method).toBe('GET');
    });

    it('should reject non-object params', async () => {
      await expect(things.list('nope' as unknown as Record<string, unknown>)).rejects.toThrow(
        'List parameters must be an object.',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject an array of params', async () => {
      await expect(things.list([] as unknown as Record<string, unknown>)).rejects.toThrow(
        'List parameters must be an object.',
      );
    });

    it('should throw with the namespace and status text on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Bad Gateway', 502));

      await expect(things.list()).rejects.toThrow('Failed to fetch things: Bad Gateway');
    });
  });

  describe('create', () => {
    it('should POST the body', async () => {
      mockFetch.mockResolvedValueOnce(ok({ id: '1' }));

      await expect(things.create({ name: 'first' })).resolves.toEqual({ id: '1' });

      expect(callInit().method).toBe('POST');
      expect(callInit().body).toBe(JSON.stringify({ name: 'first' }));
      expect(callUrl()).toBe('https://api.bundleup.io/v1/things');
    });

    it('should reject a non-object body', async () => {
      await expect(things.create('nope' as unknown as Record<string, unknown>)).rejects.toThrow(
        'Request body must be an object.',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Unprocessable Entity', 422));

      await expect(things.create({})).rejects.toThrow('Failed to create things: Unprocessable Entity');
    });
  });

  describe('retrieve', () => {
    it('should GET by ID', async () => {
      mockFetch.mockResolvedValueOnce(ok({ id: 'thing_1' }));

      await expect(things.retrieve('thing_1')).resolves.toEqual({ id: 'thing_1' });
      expect(callInit().method).toBe('GET');
    });

    it('should reject an empty ID', async () => {
      await expect(things.retrieve('')).rejects.toThrow('ID is required to retrieve a resource.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Not Found', 404));

      await expect(things.retrieve('thing_1')).rejects.toThrow('Failed to retrieve things: Not Found');
    });
  });

  describe('update', () => {
    it('should PATCH the body by ID', async () => {
      mockFetch.mockResolvedValueOnce(ok({ id: 'thing_1' }));

      await things.update('thing_1', { name: 'renamed' });

      expect(callInit().method).toBe('PATCH');
      expect(callInit().body).toBe(JSON.stringify({ name: 'renamed' }));
      expect(callUrl()).toBe('https://api.bundleup.io/v1/things/thing_1');
    });

    it('should reject an empty ID', async () => {
      await expect(things.update('', { name: 'x' })).rejects.toThrow('ID is required to update a resource.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject a non-object body', async () => {
      await expect(things.update('thing_1', 'nope' as unknown as Record<string, unknown>)).rejects.toThrow(
        'Request body must be an object.',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Conflict', 409));

      await expect(things.update('thing_1', {})).rejects.toThrow('Failed to update things: Conflict');
    });
  });

  describe('del', () => {
    it('should DELETE by ID and resolve with nothing', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

      await expect(things.del('thing_1')).resolves.toBeUndefined();

      expect(callInit().method).toBe('DELETE');
      expect(callUrl()).toBe('https://api.bundleup.io/v1/things/thing_1');
    });

    it('should reject an empty ID', async () => {
      await expect(things.del('')).rejects.toThrow('ID is required to delete a resource.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Forbidden', 403));

      await expect(things.del('thing_1')).rejects.toThrow('Failed to delete things: Forbidden');
    });
  });
});
