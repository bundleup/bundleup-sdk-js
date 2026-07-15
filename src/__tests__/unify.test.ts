import { Unify } from '../unify';
import { Chat } from '../unify/chat';
import { Git } from '../unify/git';
import { Ticketing } from '../unify/ticketing';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Unify', () => {
  let unify: Unify;
  const apiKey = 'test-api-key';
  const connectionId = 'conn_123';

  beforeEach(() => {
    unify = new Unify(apiKey, connectionId);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with apiKey and connectionId', () => {
      expect(unify).toBeInstanceOf(Unify);
      expect(unify).toBeDefined();
    });
  });

  describe('chat getter', () => {
    it('should return a Chat instance', () => {
      const chat = unify.chat;
      expect(chat).toBeInstanceOf(Chat);
    });

    it('should create a new Chat instance each time', () => {
      const chat1 = unify.chat;
      const chat2 = unify.chat;
      expect(chat1).not.toBe(chat2);
    });

    it('should initialize Chat with correct apiKey and connectionId', () => {
      const chat = unify.chat;
      // Access protected properties for testing
      expect((chat as any).apiKey).toBe(apiKey);
      expect((chat as any).connectionId).toBe(connectionId);
    });
  });

  describe('git getter', () => {
    it('should return a Git instance', () => {
      const git = unify.git;
      expect(git).toBeInstanceOf(Git);
    });

    it('should create a new Git instance each time', () => {
      const git1 = unify.git;
      const git2 = unify.git;
      expect(git1).not.toBe(git2);
    });

    it('should initialize Git with correct apiKey and connectionId', () => {
      const git = unify.git;
      // Access protected properties for testing
      expect((git as any).apiKey).toBe(apiKey);
      expect((git as any).connectionId).toBe(connectionId);
    });
  });

  describe('ticketing getter', () => {
    it('should return a Ticketing instance', () => {
      const ticketing = unify.ticketing;
      expect(ticketing).toBeInstanceOf(Ticketing);
    });

    it('should create a new Ticketing instance each time', () => {
      const ticketing1 = unify.ticketing;
      const ticketing2 = unify.ticketing;
      expect(ticketing1).not.toBe(ticketing2);
    });

    it('should initialize Ticketing with correct apiKey and connectionId', () => {
      const ticketing = unify.ticketing;
      // Access protected properties for testing
      expect((ticketing as any).apiKey).toBe(apiKey);
      expect((ticketing as any).connectionId).toBe(connectionId);
    });
  });

  describe('multiple Unify instances', () => {
    it('should create independent instances with different credentials', () => {
      const unify2 = new Unify('different-key', 'conn_456');

      const chat1 = unify.chat;
      const chat2 = unify2.chat;

      expect((chat1 as any).apiKey).toBe(apiKey);
      expect((chat1 as any).connectionId).toBe(connectionId);
      expect((chat2 as any).apiKey).toBe('different-key');
      expect((chat2 as any).connectionId).toBe('conn_456');
    });
  });
});
