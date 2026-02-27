import { isObject } from '../utils';

export interface Params {
  limit?: number;
  after?: string;
  include_raw?: boolean;
}

export interface Response<T> {
  data: T;
  _raw?: unknown;
  metadata: {
    next: string | null;
  };
}

export abstract class Base {
  private baseUrl = 'https://unify.bundleup.io';
  private version = 'v1';

  protected abstract namespace: string;

  protected get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'BU-Connection-Id': this.connectionId,
    };
  }

  protected buildUrl(path?: string | null, searchParams: Record<string, unknown> = {}): URL {
    if (!isObject(searchParams)) {
      throw new Error('URL search params must be an object.');
    }

    const parts = [this.version, this.namespace, path].filter(Boolean).join('/');

    const parsedSearchParams = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const url = new URL(parts, this.baseUrl);
    url.search = new URLSearchParams(parsedSearchParams).toString();

    return url;
  }

  constructor(
    private apiKey: string,
    private connectionId: string,
  ) {}
}
