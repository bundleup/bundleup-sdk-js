import { Base } from './base';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
}

interface WebhookListParams {
  offset: number;
  limit: number;
}

interface WebhookBody extends Record<string, unknown> {
  name: string;
  url: string;
  events: Record<string, boolean>;
}

export class Webhooks extends Base<Webhook> {
  protected namespace = 'webhooks';

  /**
   * List all webhooks with optional query parameters.
   * @param searchParams - Query parameters for filtering the list of webhooks.
   *   - offset: The number of items to skip before starting to collect the result set.
   *   - limit: The number of items to return.
   * @returns A promise that resolves to an array of webhook objects.
   * @throws If the fetch request fails or if the search parameters are invalid.
   */
  public list(searchParams: Partial<WebhookListParams> = {}) {
    return super.list(searchParams);
  }

  /**
   * Retrieve a specific webhook by ID.
   * @param id - The ID of the webhook to retrieve.
   * @returns A promise that resolves to the webhook object.
   * @throws If the fetch request fails or if the ID is invalid.
   */
  public retrieve(id: string) {
    return super.retrieve(id);
  }

  /**
   * Create a new webhook with the specified data.
   * @param data - An object containing the properties of the webhook to create.
   * @returns A promise that resolves to the created webhook object.
   * @throws If the fetch request fails or if the data is invalid.
   */
  public create(data: WebhookBody) {
    return super.create(data);
  }

  /**
   * Update an existing webhook with the specified data.
   * @param id - The ID of the webhook to update.
   * @param data - An object containing the properties of the webhook to update.
   * @returns A promise that resolves to the updated webhook object.
   * @throws If the fetch request fails, if the ID is invalid, or if the data is invalid.
   */
  public update(id: string, data: WebhookBody) {
    return super.update(id, data);
  }

  /**
   * Delete a specific webhook by ID.
   * @param id - The ID of the webhook to delete.
   * @returns A promise that resolves when the webhook is deleted.
   * @throws If the fetch request fails or if the ID is invalid.
   */
  public del(id: string) {
    return super.del(id);
  }
}
