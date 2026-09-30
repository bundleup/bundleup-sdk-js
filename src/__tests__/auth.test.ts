import { Auth } from '../auth';
import { BundleUp } from '../index';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Auth', () => {
  let auth: Auth;
  const apiKey = 'test-api-key';

  beforeEach(() => {
    auth = new Auth(apiKey);
    jest.clearAllMocks();
  });

  it('is exposed on the BundleUp client', () => {
    expect(new BundleUp(apiKey).auth).toBeInstanceOf(Auth);
  });

  describe('buildAuthorizationUrl', () => {
    const base = {
      clientId: 'client_123',
      integrationId: 'github',
      redirectUri: 'https://app.example.com/callback',
    };

    it('builds the authorize URL with required params', () => {
      const url = new URL(auth.buildAuthorizationUrl(base));

      expect(url.origin + url.pathname).toBe('https://auth.bundleup.io/authorize');
      expect(url.searchParams.get('client_id')).toBe('client_123');
      expect(url.searchParams.get('integration_id')).toBe('github');
      expect(url.searchParams.get('redirect_uri')).toBe('https://app.example.com/callback');
      expect(url.searchParams.has('state')).toBe(false);
      expect(url.searchParams.has('external_id')).toBe(false);
    });

    it('includes externalId and state when given', () => {
      const url = new URL(
        auth.buildAuthorizationUrl({ ...base, externalId: 'user_42', state: 'xyz' }),
      );

      expect(url.searchParams.get('external_id')).toBe('user_42');
      expect(url.searchParams.get('state')).toBe('xyz');
    });

    it('throws when params is missing', () => {
      expect(() => auth.buildAuthorizationUrl(undefined as any)).toThrow('params is required');
    });

    it.each(['clientId', 'integrationId', 'redirectUri'])('throws when %s is missing', (key) => {
      expect(() => auth.buildAuthorizationUrl({ ...base, [key]: '' })).toThrow(
        `${key} is required`,
      );
    });
  });

  describe('getConnectionFromCode', () => {
    const params = { code: 'code_abc', redirectUri: 'https://app.example.com/callback' };

    it('POSTs the code and redirect_uri with the API key', async () => {
      const body = { connection_id: 'conn_1', external_id: 'user_42', integration_id: 'github' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => body });

      const result = await auth.getConnectionFromCode(params);

      expect(result).toEqual(body);
      expect(global.fetch).toHaveBeenCalledWith('https://auth.bundleup.io/connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ code: 'code_abc', redirect_uri: 'https://app.example.com/callback' }),
      });
    });

    it('includes the error body when the exchange fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => '{"errors":{"code":["Invalid or expired authorization code"]}}',
      });

      await expect(auth.getConnectionFromCode(params)).rejects.toThrow(
        /400 Bad Request - .*Invalid or expired authorization code/,
      );
    });

    it('throws when code is missing', async () => {
      await expect(auth.getConnectionFromCode({ ...params, code: '' })).rejects.toThrow(
        'code is required',
      );
    });

    it('throws when redirectUri is missing', async () => {
      await expect(auth.getConnectionFromCode({ ...params, redirectUri: '' })).rejects.toThrow(
        'redirectUri is required',
      );
    });
  });
});
