import { Chat } from './unify/chat';
import { Git } from './unify/git';
import { Ticketing } from './unify/ticketing';

export class Unify {
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
}
