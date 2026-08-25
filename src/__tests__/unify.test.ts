import { Unify } from '../unify';
import { Chat } from '../unify/chat';
import { Git } from '../unify/git';
import { Ticketing } from '../unify/ticketing';
import { CRM } from '../unify/crm';
import { Drive } from '../unify/drive';
import { Me } from '../unify/me';

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

  describe('crm getter', () => {
    it('should return a CRM instance', () => {
      const crm = unify.crm;
      expect(crm).toBeInstanceOf(CRM);
    });

    it('should create a new CRM instance each time', () => {
      const crm1 = unify.crm;
      const crm2 = unify.crm;
      expect(crm1).not.toBe(crm2);
    });

    it('should initialize CRM with correct apiKey and connectionId', () => {
      const crm = unify.crm;
      // Access protected properties for testing
      expect((crm as any).apiKey).toBe(apiKey);
      expect((crm as any).connectionId).toBe(connectionId);
    });
  });

  describe('drive getter', () => {
    it('should return a Drive instance', () => {
      const drive = unify.drive;
      expect(drive).toBeInstanceOf(Drive);
    });

    it('should create a new Drive instance each time', () => {
      const drive1 = unify.drive;
      const drive2 = unify.drive;
      expect(drive1).not.toBe(drive2);
    });

    it('should initialize Drive with correct apiKey and connectionId', () => {
      const drive = unify.drive;
      // Access protected properties for testing
      expect((drive as any).apiKey).toBe(apiKey);
      expect((drive as any).connectionId).toBe(connectionId);
    });
  });

  describe('me method', () => {
    const account = { data: { id: 'u_1', name: 'Ada', email: 'ada@acme.io', avatar_url: null } };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => account,
      });
    });

    it('should be a method rather than a namespace getter', () => {
      expect(typeof unify.me).toBe('function');
      expect(unify.me).not.toBeInstanceOf(Me);
    });

    it('should request the root me endpoint with the connection credentials', async () => {
      await unify.me();

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];

      expect(new URL(url.toString()).pathname).toBe('/v1/me');
      expect(init.headers.Authorization).toBe(`Bearer ${apiKey}`);
      expect(init.headers['BU-Connection-Id']).toBe(connectionId);
    });

    it('should pass include_raw through', async () => {
      await unify.me({ include_raw: true });

      const [url] = (global.fetch as jest.Mock).mock.calls[0];

      expect(new URL(url.toString()).searchParams.get('include_raw')).toBe('true');
    });

    it('should resolve to the connected account', async () => {
      await expect(unify.me()).resolves.toEqual(account);
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
