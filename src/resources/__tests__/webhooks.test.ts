import { Webhooks } from '../webhooks';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Webhooks', () => {
  let webhooks: Webhooks;
  const apiKey = 'test-api-key';

  beforeEach(() => {
    webhooks = new Webhooks(apiKey);
    jest.clearAllMocks();
  });

  it('should have the correct namespace', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await webhooks.list();

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl.toString()).toContain('v1/webhooks');
  });

  it('should list webhooks', async () => {
    const mockData = [
      {
        id: '1',
        name: 'Connection Created',
        url: 'https://example.com/webhook',
        events: { 'connection.created': true },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Connection Updated',
        url: 'https://example.com/webhook2',
        events: { 'connection.updated': true },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastTriggeredAt: new Date(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await webhooks.list();

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${apiKey}`,
        }),
      }),
    );
  });

  it('should retrieve a specific webhook', async () => {
    const mockData = {
      id: '1',
      name: 'Connection Created',
      url: 'https://example.com/webhook',
      events: { 'connection.created': true, 'connection.deleted': false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await webhooks.retrieve('1');

    expect(result).toEqual(mockData);
  });

  it('should create a webhook', async () => {
    const mockData = {
      id: '1',
      name: 'New Webhook',
      url: 'https://example.com/new-webhook',
      events: { 'connection.created': true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await webhooks.create({
      name: 'New Webhook',
      url: 'https://example.com/new-webhook',
      events: { 'connection.created': true },
    });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'New Webhook',
          url: 'https://example.com/new-webhook',
          events: { 'connection.created': true },
        }),
      }),
    );
  });

  it('should update a webhook', async () => {
    const mockData = {
      id: '1',
      name: 'Updated Webhook',
      url: 'https://example.com/updated-webhook',
      events: { 'connection.created': true, 'connection.updated': true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await webhooks.update('1', {
      name: 'Updated Webhook',
      url: 'https://example.com/updated-webhook',
      events: { 'connection.created': true, 'connection.updated': true },
    });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
  });

  it('should delete a webhook', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await webhooks.del('1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });

  it('should filter webhooks by query parameters', async () => {
    const mockData = [
      {
        id: '1',
        name: 'Active Webhook',
        url: 'https://example.com/webhook',
        events: { 'connection.created': true },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await webhooks.list({ limit: 1, offset: 0 });

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl.toString()).toContain('limit=1');
    expect(callUrl.toString()).toContain('offset=0');
  });
});
