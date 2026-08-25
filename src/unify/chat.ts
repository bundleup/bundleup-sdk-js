import { isEmpty } from '../utils/helpers';
import { Base, type Params, type Response } from './base';

export class Chat extends Base {
  protected namespace = 'chat';

  /**
   * Fetch chat users
   * @param limit - Maximum number of users to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async users({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('users', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/users: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
      }>
    >;
  }

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

  /**
   * Send a chat message to a channel
   * @param channelId - The ID of the channel to send the message to.
   * @param text - Markdown-formatted message text.
   * @returns A promise that resolves to the fetch response.
   * @throws If channelId is not provided.
   */
  async message(channelId: string, text: string) {
    if (isEmpty(channelId)) {
      throw new Error('channelId is required to send a message.');
    }

    const url = this.buildUrl(`channels/${encodeURIComponent(channelId)}/message`);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to post ${this.namespace}/channels/${channelId}/message: ${response.statusText}`);
    }

    const data = await response.json();
    return data as { data: Record<string, unknown>; _raw?: unknown };
  }
}
