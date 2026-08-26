import { Chat } from './unify/chat';
import { Git } from './unify/git';
import { Ticketing } from './unify/ticketing';
import { CRM } from './unify/crm';
import { Drive } from './unify/drive';
import { Calendar } from './unify/calendar';
import { MCP } from './unify/mcp';
import { Me, type MeParams } from './unify/me';

export class Unify {
  private mcpClient?: MCP;

  constructor(
    private apiKey: string,
    private connectionId: string,
  ) {}

  /**
   * Access the Chat API for the connection.
   */
  get chat() {
    return new Chat(this.apiKey, this.connectionId);
  }

  /**
   * Access the Git API for the connection.
   */
  get git() {
    return new Git(this.apiKey, this.connectionId);
  }

  /**
   * Access the Ticketing API for the connection.
   */
  get ticketing() {
    return new Ticketing(this.apiKey, this.connectionId);
  }

  /**
   * Access the CRM API for the connection.
   */
  get crm() {
    return new CRM(this.apiKey, this.connectionId);
  }

  /**
   * Access the Drive API for the connection.
   */
  get drive() {
    return new Drive(this.apiKey, this.connectionId);
  }

  /**
   * Access the Calendar API for the connection.
   */
  get calendar() {
    return new Calendar(this.apiKey, this.connectionId);
  }

  /**
   * Fetch the account this connection is authenticated as.
   *
   * `me` is the one unified method every provider implements, so it hangs off the
   * Unify client directly instead of a vertical namespace.
   *
   * @param include_raw - Whether to include raw response data.
   * @returns A promise that resolves to the connected account.
   */
  async me(params: MeParams = {}) {
    return new Me(this.apiKey, this.connectionId).get(params);
  }

  /**
   * Access the MCP API for the connection.
   */
  get mcp() {
    if (!this.mcpClient) {
      this.mcpClient = new MCP(this.apiKey, this.connectionId);
    }

    return this.mcpClient;
  }
}
