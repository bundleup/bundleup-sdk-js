import { isEmpty, isObject } from './utils/helpers';

const BASE_URL = 'https://auth.bundleup.io';

export interface AuthorizationUrlParams {
  clientId: string;
  integrationId: string;
  redirectUri: string;
  externalId?: string;
  state?: string;
}

export interface ConnectionFromCodeParams {
  code: string;
  redirectUri: string;
}

export interface ConnectionFromCodeResponse {
  connection_id: string;
  external_id: string | null;
  integration_id: string;
}

export class Auth {
  constructor(private apiKey: string) {}

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Builds the hosted authorization URL to send the end user to.
   * @param params - The parameters required to build the URL.
   * @returns The authorization URL as a string.
   */
  public buildAuthorizationUrl(params: AuthorizationUrlParams): string {
    if (!isObject(params)) {
      throw new Error('params is required');
    }

    if (isEmpty(params.clientId)) {
      throw new Error('clientId is required');
    }

    if (isEmpty(params.integrationId)) {
      throw new Error('integrationId is required');
    }

    if (isEmpty(params.redirectUri)) {
      throw new Error('redirectUri is required');
    }

    const url = new URL(`${BASE_URL}/authorize`);
    url.searchParams.set('client_id', params.clientId);
    url.searchParams.set('integration_id', params.integrationId);
    url.searchParams.set('redirect_uri', params.redirectUri);

    if (params.externalId) {
      url.searchParams.set('external_id', params.externalId);
    }

    if (params.state) {
      url.searchParams.set('state', params.state);
    }

    return url.toString();
  }

  /**
   * Exchanges the one-time code from the redirect for the connection.
   * Call this server-side; the code expires after 5 minutes and works once.
   * @param params - The code and the exact redirectUri used to authorize.
   * @returns The connection id, external id and integration id.
   */
  public async getConnectionFromCode(
    params: ConnectionFromCodeParams,
  ): Promise<ConnectionFromCodeResponse> {
    if (!isObject(params)) {
      throw new Error('params is required');
    }

    if (isEmpty(params.code)) {
      throw new Error('code is required');
    }

    if (isEmpty(params.redirectUri)) {
      throw new Error('redirectUri is required');
    }

    const response = await fetch(`${BASE_URL}/connection`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        code: params.code,
        redirect_uri: params.redirectUri,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Failed to get connection: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`,
      );
    }

    return response.json();
  }
}
