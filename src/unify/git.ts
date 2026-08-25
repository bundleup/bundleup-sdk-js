import { isEmpty } from '../utils/helpers';
import { Base, type Params, type Response } from './base';

export class Git extends Base {
  protected namespace = 'git';

  /**
   * Fetch repositories
   * @param limit - Maximum number of repositories to retrieve.
   * @param after - Cursor for pagination.
   * @param includeRaw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   */
  async repos({ limit = 100, after, include_raw = false }: Params = {}) {
    const url = this.buildUrl('repos', { limit, after, include_raw });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/repos: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
        full_name: string;
        description: string | null;
        url: string;
        created_at: string;
        updated_at: string;
        pushed_at: string;
      }>
    >;
  }

  /**
   * Fetch pull requests for a specific repository.
   * @param repoName - The name of the repository.
   * @param limit - Maximum number of pull requests to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If repoName is not provided.
   */
  async pulls(repoName: string, { limit = 100, after, include_raw = false }: Params = {}) {
    if (isEmpty(repoName)) {
      throw new Error('repoName is required to fetch pulls.');
    }

    const url = this.buildUrl(`repos/${encodeURIComponent(repoName)}/pulls`, {
      limit,
      after,
      include_raw,
    });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/repos/${repoName}/pulls: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        number: number;
        title: string;
        description: string | null;
        draft: boolean;
        state: string;
        url: string;
        user: string;
        created_at: string;
        updated_at: string;
        merged_at: string | null;
      }>
    >;
  }

  /**
   * Fetch tags for a specific repository.
   * @param repoName - The name of the repository.
   * @param limit - Maximum number of tags to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If repoName is not provided.
   */
  async tags(repoName: string, { limit = 100, after, include_raw = false }: Params = {}) {
    if (isEmpty(repoName)) {
      throw new Error('repoName is required to fetch tags.');
    }

    const url = this.buildUrl(`repos/${encodeURIComponent(repoName)}/tags`, {
      limit,
      after,
      include_raw,
    });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/repos/${repoName}/tags: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        name: string;
        commit_sha: string;
      }>
    >;
  }

  /**
   * Fetch releases for a specific repository.
   * @param repoName - The name of the repository.
   * @param limit - Maximum number of releases to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If repoName is not provided.
   */
  async releases(repoName: string, { limit = 100, after, include_raw = false }: Params = {}) {
    if (isEmpty(repoName)) {
      throw new Error('repoName is required to fetch releases.');
    }

    const url = this.buildUrl(`repos/${encodeURIComponent(repoName)}/releases`, {
      limit,
      after,
      include_raw,
    });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/repos/${repoName}/releases: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        id: string;
        name: string;
        tag_name: string;
        description: string | null;
        prerelease: boolean;
        url: string;
        created_at: string;
        released_at: string | null;
      }>
    >;
  }

  /**
   * Fetch branches for a specific repository.
   * @param repoName - The name of the repository.
   * @param limit - Maximum number of branches to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If repoName is not provided.
   */
  async branches(repoName: string, { limit = 100, after, include_raw = false }: Params = {}) {
    if (isEmpty(repoName)) {
      throw new Error('repoName is required to fetch branches.');
    }

    const url = this.buildUrl(`repos/${encodeURIComponent(repoName)}/branches`, {
      limit,
      after,
      include_raw,
    });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/repos/${repoName}/branches: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        name: string;
        commit_sha: string;
        protected: boolean;
      }>
    >;
  }
  /**
   * Fetch commits for a specific repository.
   * @param repoName - The name of the repository.
   * @param branch - Branch, tag or commit SHA to list commits from.
   * @param limit - Maximum number of commits to retrieve.
   * @param after - Cursor for pagination.
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the fetch response.
   * @throws If repoName is not provided.
   */
  async commits(
    repoName: string,
    { branch, limit = 100, after, include_raw = false }: Params & { branch?: string } = {},
  ) {
    if (isEmpty(repoName)) {
      throw new Error('repoName is required to fetch commits.');
    }

    const url = this.buildUrl(`repos/${encodeURIComponent(repoName)}/commits`, {
      branch,
      limit,
      after,
      include_raw,
    });

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.namespace}/repos/${repoName}/commits: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Response<
      Array<{
        sha: string;
        message: string | null;
        url: string;
        author: string | null;
        author_email: string | null;
        committed_at: string | null;
      }>
    >;
  }
}
