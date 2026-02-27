import { Base, type Params, type Response } from './base';

export class Chat extends Base {
  protected namespace = 'chat';

  /**
   * Fetch chat channels
   * @param limit - Maximum number of channels to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async channels({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('channels', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/channels: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
      }>
    >;
  }
}
