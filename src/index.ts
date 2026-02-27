import { Proxy } from './proxy';
import { Unify } from './unify';
import { isEmpty } from './utils';

// Resources
import { Connections } from './resources/connection';
import { Integrations } from './resources/integration';
import { Webhooks } from './resources/webhooks';

export class BundleUp {
  private apiKey: string;

  constructor(apiKey: string) {
    if (isEmpty(apiKey)) {
      throw new Error('API key is required to initialize BundleUp SDK.');
    }

    this.apiKey = apiKey;
  }

  /**
   * Access the Connections resource.
   */
  get connections() {
    return new Connections(this.apiKey);
  }

  /**
   * Access the Integrations resource.
   */
  get integrations() {
    return new Integrations(this.apiKey);
  }

  /**
   * Access the Webhooks resource.
   */
  get webhooks() {
    return new Webhooks(this.apiKey);
  }

  /**
   * Create a Proxy instance for a specific connection.
   * @param connectionId - The ID of the connection.
   * @returns A Proxy instance.
   */
  proxy(connectionId: string) {
    if (isEmpty(connectionId)) {
      throw new Error('Connection ID is required to create a Proxy instance.');
    }

    return new Proxy(this.apiKey, connectionId);
  }

  /**
   * Access Unify API for a specific connection.
   * @param connectionId - The ID of the connection.
   * @returns An object containing Unify methods.
   */
  unify(connectionId: string) {
    if (isEmpty(connectionId)) {
      throw new Error('Connection ID is required to create a Unify instance.');
    }

    return new Unify(this.apiKey, connectionId);
  }
}
