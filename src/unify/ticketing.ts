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
}
