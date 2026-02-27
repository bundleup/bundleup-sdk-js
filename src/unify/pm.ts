import { Base, type Params, type Response } from './base';

export class PM extends Base {
  protected namespace = 'pm';

  /**
   * Fetch issues
   * @param limit - Maximum number of issues to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async issues({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('issues', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/issues: ${response.statusText}`);
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
