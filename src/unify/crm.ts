import { Base, type Params, type Response } from './base';

export class CRM extends Base {
  protected namespace = 'crm';

  /**
   * Fetch CRM companies
   * @param limit - Maximum number of companies to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async companies({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('companies', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/companies: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
        website: string | null;
      }>
    >;
  }

  /**
   * Fetch CRM contacts
   * @param limit - Maximum number of contacts to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async contacts({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('contacts', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/contacts: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
        email: string | null;
      }>
    >;
  }
}
