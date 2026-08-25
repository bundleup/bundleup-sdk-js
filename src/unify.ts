import { Chat } from './unify/chat';
import { Git } from './unify/git';
import { Ticketing } from './unify/ticketing';
import { CRM } from './unify/crm';
import { Drive } from './unify/drive';
import { MCP } from './unify/mcp';

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
   * Access the MCP API for the connection.
   */
  get mcp() {
    if (!this.mcpClient) {
      this.mcpClient = new MCP(this.apiKey, this.connectionId);
    }

    return this.mcpClient;
  }
}
