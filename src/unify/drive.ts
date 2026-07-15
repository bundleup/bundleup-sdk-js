import { Base, type Params, type Response } from './base';

export class Drive extends Base {
  protected namespace = 'drive';

  /**
   * Fetch Drive files
   * @param limit - Maximum number of files to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async files({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('files', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/files: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
        mime_type: string | null;
        size: number | null;
        created_at: string | null;
        updated_at: string | null;
        url: string | null;
        is_folder: boolean;
      }>
    >;
  }
}
