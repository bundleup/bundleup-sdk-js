import { Chat } from './unify/chat';
import { Git } from './unify/git';
import { PM } from './unify/pm';

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
   * Access the PM API for the connection.
   */
  get pm() {
    return new PM(this.apiKey, this.connectionId);
  }
}
