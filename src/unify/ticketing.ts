import { isEmpty } from '../utils/helpers';
import { Base, type Params, type Response } from './base';

export class Ticketing extends Base {
  protected namespace = 'ticketing';

  /**
   * Fetch tickets
   * @param limit - Maximum number of tickets to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async tickets({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('tickets', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/tickets: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        url: string;
        title: string;
        status: string;
        description: string | null;
        created_at: string;
        updated_at: string;
      }>
    >;
  }

  /**
   * Fetch a single ticket by ID.
   *
   * Not supported by Basecamp, whose API only serves a to-do underneath its
   * project — an id on its own cannot address one.
   *
   * @param id - The ID of the ticket.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If id is not provided.
   */
  async ticket(id: string, { include_raw = false }: Params = {}) {
    if (isEmpty(id)) {
      throw new Error('id is required to fetch a ticket.');
    }

    const url = this.buildUrl(`tickets/${encodeURIComponent(id)}`, { include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/tickets/${id}: ${response.statusText}`);
    }

    const data = await response.json();

    // A single resource carries no pagination, so this is not `Response<T>`.
    return data as {
      data: {
        id: string;
        url: string | null;
        title: string;
        status: string | null;
        description: string | null;
        created_at: string | null;
        updated_at: string | null;
      };
      _raw?: unknown;
    };
  }
}
