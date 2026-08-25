import { isEmpty, isObject } from './utils/helpers';

export class Proxy {
  private baseUrl = 'https://proxy.bundleup.io';

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'BU-Connection-Id': this.connectionId,
    };
  }

  constructor(
    private apiKey: string,
    private connectionId: string,
  ) {}

  private buildUrl(path: string): URL {
    if (isEmpty(path)) {
      throw new Error('Path is required to build URL.');
    }

    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    const url = new URL(path, this.baseUrl);

    return url;
  }

  /**
   * Send a GET request to the specified path with optional headers.
   *
   * @param path - The endpoint path relative to the proxy server.
   * @param headers - Extra headers to include in the request.
   */
  public get(path: string, headers: Record<string, string> = {}) {
    if (isEmpty(path)) {
      throw new Error('Path is required for GET request.');
    }

    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    const url = this.buildUrl(path);

    return fetch(url, {
      method: 'GET',
      headers: { ...this.headers, ...headers },
    });
  }

  /**
   * Send a POST request to the specified path with a JSON body and optional headers.
   *
   * @param path - The endpoint path relative to the proxy server.
   * @param body - The request body.
   * @param headers - Extra headers to include in the request.
   */
  public post(path: string, body: BodyInit, headers: Record<string, string> = {}) {
    if (isEmpty(path)) {
      throw new Error('Path is required for POST request.');
    }

    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    const url = this.buildUrl(path);

    return fetch(url, {
      body,
      method: 'POST',
      headers: { ...this.headers, ...headers },
    });
  }

  /**
   * Send a PUT request to the specified path with a JSON body and optional headers.
   *
   * @param path - The endpoint path relative to the proxy server.
   * @param body - The request body.
   * @param headers - Extra headers to include in the request.
   */
  public put(path: string, body: BodyInit, headers: Record<string, string> = {}) {
    if (isEmpty(path)) {
      throw new Error('Path is required for PUT request.');
    }

    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    const url = this.buildUrl(path);

    return fetch(url, {
      body,
      method: 'PUT',
      headers: { ...this.headers, ...headers },
    });
  }

  /**
   * Send a PATCH request to the specified path with a JSON body and optional headers.
   *
   * @param path - The endpoint path relative to the proxy server.
   * @param body - The request body.
   * @param headers - Extra headers to include in the request.
   */
  public patch(path: string, body: BodyInit, headers: Record<string, string> = {}) {
    if (isEmpty(path)) {
      throw new Error('Path is required for PATCH request.');
    }

    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    const url = this.buildUrl(path);

    return fetch(url, {
      body,
      method: 'PATCH',
      headers: { ...this.headers, ...headers },
    });
  }

  /**
   * Send a DELETE request to the specified path with optional headers.
   *
   * @param path - The endpoint path relative to the proxy server.
   * @param headers - Extra headers to include in the request.
   */
  public delete(path: string, headers: Record<string, string> = {}) {
    if (isEmpty(path)) {
      throw new Error('Path is required for DELETE request.');
    }

    if (!isObject(headers)) {
      throw new Error('Headers must be an object.');
    }

    const url = this.buildUrl(path);

    return fetch(url, {
      method: 'DELETE',
      headers: { ...this.headers, ...headers },
    });
  }
}
