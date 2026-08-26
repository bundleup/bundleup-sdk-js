import { isEmpty } from '../utils/helpers';
import { Base, type Params, type Response } from './base';

export interface EventParams extends Params {
  /** Only return events starting at or after this ISO 8601 timestamp. */
  starts_after: string;
  /** Only return events starting before this ISO 8601 timestamp. */
  starts_before: string;
}

export class Calendar extends Base {
  protected namespace = 'calendar';

  /**
   * Fetch calendar events.
   *
   * The window is required — the endpoint refuses an unbounded listing.
   *
   * @param starts_after - Only return events starting at or after this ISO 8601 timestamp.
   * @param starts_before - Only return events starting before this ISO 8601 timestamp.
   * @param limit - Maximum number of events to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If starts_after or starts_before is not provided.
   */
  async events({ starts_after, starts_before, limit = 100, after, include_raw = false }: EventParams) {
    if (isEmpty(starts_after) || isEmpty(starts_before)) {
      throw new Error('starts_after and starts_before are required to fetch events.');
    }

    const url = this.buildUrl('events', { starts_after, starts_before, limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/events: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        title: string | null;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        status: 'confirmed' | 'tentative' | 'cancelled' | null;
        url: string | null;
      }>
    >;
  }
}
