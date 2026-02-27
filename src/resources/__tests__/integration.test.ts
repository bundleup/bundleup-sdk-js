import { Integrations } from '../integration';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Integrations', () => {
  let integrations: Integrations;
  const apiKey = 'test-api-key';

  beforeEach(() => {
    integrations = new Integrations(apiKey);
    jest.clearAllMocks();
  });

  it('should have the correct namespace', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await integrations.list();

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl.toString()).toContain('v1/integrations');
  });

  it('should list integrations', async () => {
    const mockData = [
      {
        id: '1',
        identifier: 'github',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        identifier: 'slack',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await integrations.list();

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

  it('should retrieve a specific integration', async () => {
    const mockData = {
      id: '1',
      identifier: 'github',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await integrations.retrieve('1');

    expect(result).toEqual(mockData);
  });
});
