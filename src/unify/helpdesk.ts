import { isEmpty } from '../utils/helpers';
import { Base, type Params, type Response } from './base';

export type HelpdeskTicket = {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  requester: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export class Helpdesk extends Base {
  protected namespace = 'helpdesk';

  /**
   * Fetch support tickets
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
    return data as Response<HelpdeskTicket[]>;
  }

  /**
   * Fetch a single support ticket by ID.
   * @param id - The ID of the ticket (a `sys_id` on ServiceNow).
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
    return data as { data: HelpdeskTicket; _raw?: unknown };
  }
}
