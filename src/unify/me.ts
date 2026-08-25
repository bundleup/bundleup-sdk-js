import { Base } from './base';

export interface MeParams {
  include_raw?: boolean;
}

export interface Account {
  id: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface MeResponse {
  data: Account;
  _raw?: unknown;
}

/**
 * `me` is the one unified method every provider implements, so the API mounts it
 * at the root rather than under a vertical. It is exposed on the Unify client as
 * `unify.me()` rather than as a namespace.
 */
export class Me extends Base {
  protected namespace = 'me';

  /**
   * Fetch the account the connection is authenticated as.
   *
   * Providers that authorize per workspace, portal, tenant or company return that
   * account instead of a user, and fields the provider does not expose come back
   * as null.
   *
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async get({ include_raw = false }: MeParams = {}) {
    const url = this.buildUrl(null, { include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as MeResponse;
  }
}
