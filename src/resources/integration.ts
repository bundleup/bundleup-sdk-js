import { Base } from './base';

interface Integration {
  id: string;
  identifier: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IntegrationListParams {
  offset: number;
  limit: number;
  status: string;
}

export class Integrations extends Base<Integration> {
  protected namespace = 'integrations';

  /**
   * List all integrations with optional query parameters.
   * @param searchParams - Query parameters for filtering the list of integrations.
   *   - offset: The number of items to skip before starting to collect the result set.
   *   - limit: The number of items to return.
   *   - status: Filter integrations by status (e.g., 'active', 'inactive').
   * @returns A promise that resolves to an array of integration objects.
   * @throws If the fetch request fails or if the search parameters are invalid.
   */
  public list(searchParams: Partial<IntegrationListParams> = {}) {
    return super.list(searchParams);
  }

  /**
   * Retrieve a specific integration by ID.
   * @param id - The ID of the integration to retrieve.
   * @returns A promise that resolves to the integration object.
   * @throws If the fetch request fails or if the ID is invalid.
   */
  public retrieve(id: string) {
    return super.retrieve(id);
  }
}
