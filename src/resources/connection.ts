import { Base } from './base';

interface Connection {
  id: string;
  externalId?: string;
  expiresAt: Date;
  integrationId: string;
  isValid: boolean;
  refreshedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ConnectionListParams {
  offset: number;
  limit: number;
  integration_id: string;
  integration_identifier: string;
  external_id: string;
}

export class Connections extends Base<Connection> {
  protected namespace = 'connections';

  /**
   * List all connections with optional query parameters.
   * @param searchParams - Query parameters for filtering the list of connections.
   *   - offset: The number of items to skip before starting to collect the result set.
   *   - limit: The number of items to return.
   *   - integration_id: Filter connections by integration ID.
   *   - integration_identifier: Filter connections by integration identifier.
   *   - external_id: Filter connections by external ID.
   * @returns A promise that resolves to an array of connection objects.
   * @throws If the fetch request fails or if the search parameters are invalid.
   */
  public list(searchParams: Partial<ConnectionListParams> = {}) {
    return super.list(searchParams);
  }

  /**
   * Retrieve a specific connection by ID.
   * @param id - The ID of the connection to retrieve.
   * @returns A promise that resolves to the connection object.
   * @throws If the fetch request fails or if the ID is invalid.
   */
  public retrieve(id: string) {
    return super.retrieve(id);
  }

  /**
   * Delete a specific connection by ID.
   * @param id - The ID of the connection to delete.
   * @returns A promise that resolves when the connection is deleted.
   * @throws If the fetch request fails or if the ID is invalid.
   */
  public del(id: string) {
    return super.del(id);
  }
}
