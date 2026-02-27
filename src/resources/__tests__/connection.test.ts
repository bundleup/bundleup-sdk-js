import { Connections } from '../connection';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Connections', () => {
  let connections: Connections;
  const apiKey = 'test-api-key';

  beforeEach(() => {
    connections = new Connections(apiKey);
    jest.clearAllMocks();
  });

  it('should have the correct namespace', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await connections.list();

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl.toString()).toContain('v1/connections');
  });

  it('should list connections', async () => {
    const mockData = [
      {
        id: '1',
        integrationId: 'int_1',
        isValid: true,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        integrationId: 'int_2',
        isValid: false,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await connections.list();

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

  it('should retrieve a specific connection', async () => {
    const mockData = {
      id: '1',
      integrationId: 'int_1',
      isValid: true,
      externalId: 'ext_123',
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await connections.retrieve('1');

    expect(result).toEqual(mockData);
  });

  it('should delete a connection', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await connections.del('1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });
});
