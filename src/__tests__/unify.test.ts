import { Unify } from '../unify';
import { Chat } from '../unify/chat';
import { Git } from '../unify/git';
import { PM } from '../unify/pm';

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

  describe('pm getter', () => {
    it('should return a PM instance', () => {
      const pm = unify.pm;
      expect(pm).toBeInstanceOf(PM);
    });

    it('should create a new PM instance each time', () => {
      const pm1 = unify.pm;
      const pm2 = unify.pm;
      expect(pm1).not.toBe(pm2);
    });

    it('should initialize PM with correct apiKey and connectionId', () => {
      const pm = unify.pm;
      // Access protected properties for testing
      expect((pm as any).apiKey).toBe(apiKey);
      expect((pm as any).connectionId).toBe(connectionId);
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
