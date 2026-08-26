import { Base } from '../base';
import { Calendar } from '../calendar';
import { Chat } from '../chat';
import { CRM } from '../crm';
import { Drive } from '../drive';
import { Git } from '../git';
import { Me } from '../me';
import { Ticketing } from '../ticketing';

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

const apiKey = 'test-api-key';
const connectionId = 'conn_123';

function ok(payload: unknown = { data: [], metadata: { next: null } }) {
  return { ok: true, status: 200, json: async () => payload };
}

function failed(statusText = 'Bad Gateway', status = 502) {
  return { ok: false, status, statusText, json: async () => ({}) };
}

function callUrl(index = 0): string {
  return mockFetch.mock.calls[index][0].toString();
}

function callInit(index = 0) {
  return mockFetch.mock.calls[index][1];
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('unify Base', () => {
  it('should target the versioned namespace on unify.bundleup.io', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Chat(apiKey, connectionId).users();

    expect(callUrl()).toContain('https://unify.bundleup.io/v1/chat/users');
  });

  it('should send the API key and connection ID', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Chat(apiKey, connectionId).users();

    expect(callInit().headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'BU-Connection-Id': connectionId,
    });
  });

  it('should default limit and include_raw, and omit an absent cursor', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Chat(apiKey, connectionId).users();

    const url = new URL(callUrl());

    expect(url.searchParams.get('limit')).toBe('100');
    expect(url.searchParams.get('include_raw')).toBe('false');
    expect(url.searchParams.has('after')).toBe(false);
  });

  it('should pass through paging options', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Chat(apiKey, connectionId).users({ limit: 5, after: 'cursor_1', include_raw: true });

    const url = new URL(callUrl());

    expect(url.searchParams.get('limit')).toBe('5');
    expect(url.searchParams.get('after')).toBe('cursor_1');
    expect(url.searchParams.get('include_raw')).toBe('true');
  });

  it('should reject non-object search params', () => {
    class Exposed extends Base {
      protected namespace = 'exposed';

      public url(searchParams: unknown) {
        return this.buildUrl('thing', searchParams as Record<string, unknown>);
      }
    }

    expect(() => new Exposed(apiKey, connectionId).url('nope')).toThrow('URL search params must be an object.');
  });

  it('should return the parsed body', async () => {
    const payload = { data: [{ id: 'u_1', name: 'Ada' }], metadata: { next: 'cursor_2' } };
    mockFetch.mockResolvedValueOnce(ok(payload));

    await expect(new Chat(apiKey, connectionId).users()).resolves.toEqual(payload);
  });
});

describe('Chat', () => {
  let chat: Chat;

  beforeEach(() => {
    chat = new Chat(apiKey, connectionId);
  });

  it.each([
    ['users', 'chat/users'],
    ['channels', 'chat/channels'],
  ])('should fetch %s', async (method, path) => {
    mockFetch.mockResolvedValueOnce(ok());

    await (chat[method as 'users' | 'channels'])();

    expect(callUrl()).toContain(path);
  });

  it.each([
    ['users', 'Failed to fetch chat/users: Bad Gateway'],
    ['channels', 'Failed to fetch chat/channels: Bad Gateway'],
  ])('should throw when %s fails', async (method, message) => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect((chat[method as 'users' | 'channels'])()).rejects.toThrow(message);
  });

  describe('message', () => {
    it('should POST the text to the channel', async () => {
      mockFetch.mockResolvedValueOnce(ok({ data: {} }));

      await chat.message('C123', 'Deploy finished');

      expect(callUrl()).toContain('chat/channels/C123/message');
      expect(callInit().method).toBe('POST');
      expect(callInit().body).toBe(JSON.stringify({ text: 'Deploy finished' }));
    });

    it('should encode a channel ID with URL-unsafe characters', async () => {
      mockFetch.mockResolvedValueOnce(ok({ data: {} }));

      await chat.message('team/general', 'hi');

      expect(callUrl()).toContain('chat/channels/team%2Fgeneral/message');
    });

    it('should reject an empty channel ID', async () => {
      await expect(chat.message('', 'hi')).rejects.toThrow('channelId is required to send a message.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Forbidden', 403));

      await expect(chat.message('C123', 'hi')).rejects.toThrow(
        'Failed to post chat/channels/C123/message: Forbidden',
      );
    });
  });

  describe('messages', () => {
    it('should fetch messages for a channel', async () => {
      mockFetch.mockResolvedValueOnce(ok());

      await chat.messages('C123');

      expect(callUrl()).toContain('chat/channels/C123/messages');
    });

    it('should pass through paging options', async () => {
      mockFetch.mockResolvedValueOnce(ok());

      await chat.messages('C123', { limit: 20, after: 'cursor_1' });

      const url = new URL(callUrl());

      expect(url.searchParams.get('limit')).toBe('20');
      expect(url.searchParams.get('after')).toBe('cursor_1');
    });

    it('should encode a channel ID with URL-unsafe characters', async () => {
      mockFetch.mockResolvedValueOnce(ok());

      await chat.messages('team/general');

      expect(callUrl()).toContain('chat/channels/team%2Fgeneral/messages');
    });

    it('should reject an empty channel ID', async () => {
      await expect(chat.messages('')).rejects.toThrow('channelId is required to fetch messages.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce(failed('Not Found', 404));

      await expect(chat.messages('C123')).rejects.toThrow(
        'Failed to fetch chat/channels/C123/messages: Not Found',
      );
    });
  });
});

describe('CRM', () => {
  it.each([
    ['companies', 'crm/companies'],
    ['contacts', 'crm/contacts'],
  ])('should fetch %s', async (method, path) => {
    mockFetch.mockResolvedValueOnce(ok());

    await (new CRM(apiKey, connectionId)[method as 'companies' | 'contacts'])();

    expect(callUrl()).toContain(path);
  });

  it.each([
    ['companies', 'Failed to fetch crm/companies: Bad Gateway'],
    ['contacts', 'Failed to fetch crm/contacts: Bad Gateway'],
  ])('should throw when %s fails', async (method, message) => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect((new CRM(apiKey, connectionId)[method as 'companies' | 'contacts'])()).rejects.toThrow(message);
  });
});

describe('Drive', () => {
  it('should fetch files', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Drive(apiKey, connectionId).files();

    expect(callUrl()).toContain('drive/files');
  });

  it('should throw on failure', async () => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect(new Drive(apiKey, connectionId).files()).rejects.toThrow('Failed to fetch drive/files: Bad Gateway');
  });
});

describe('Calendar', () => {
  const window = { starts_after: '2026-09-01T00:00:00Z', starts_before: '2026-09-08T00:00:00Z' };

  it('should fetch events', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Calendar(apiKey, connectionId).events(window);

    expect(callUrl()).toContain('calendar/events');
  });

  it('should pass through the window', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Calendar(apiKey, connectionId).events(window);

    const url = new URL(callUrl());

    expect(url.searchParams.get('starts_after')).toBe(window.starts_after);
    expect(url.searchParams.get('starts_before')).toBe(window.starts_before);
  });

  it.each([
    ['starts_after', { starts_before: window.starts_before }],
    ['starts_before', { starts_after: window.starts_after }],
    ['both bounds', {}],
  ])('should throw when %s is missing', async (_label, params) => {
    await expect(new Calendar(apiKey, connectionId).events(params as never)).rejects.toThrow(
      'starts_after and starts_before are required to fetch events.',
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should throw on failure', async () => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect(new Calendar(apiKey, connectionId).events(window)).rejects.toThrow(
      'Failed to fetch calendar/events: Bad Gateway',
    );
  });
});

describe('Ticketing', () => {
  it('should fetch tickets', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await new Ticketing(apiKey, connectionId).tickets();

    expect(callUrl()).toContain('ticketing/tickets');
  });

  it('should throw on failure', async () => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect(new Ticketing(apiKey, connectionId).tickets()).rejects.toThrow(
      'Failed to fetch ticketing/tickets: Bad Gateway',
    );
  });

  it('should fetch a single ticket', async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: 'TKT-1' } }));

    await new Ticketing(apiKey, connectionId).ticket('TKT-1');

    expect(callUrl()).toContain('ticketing/tickets/TKT-1');
  });

  it('should encode the ticket id', async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: 'a/b' } }));

    await new Ticketing(apiKey, connectionId).ticket('a/b');

    expect(callUrl()).toContain('ticketing/tickets/a%2Fb');
  });

  it('should throw without an id', async () => {
    await expect(new Ticketing(apiKey, connectionId).ticket('')).rejects.toThrow(
      'id is required to fetch a ticket.',
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should throw when a single ticket fails', async () => {
    mockFetch.mockResolvedValueOnce(failed('Not Found', 404));

    await expect(new Ticketing(apiKey, connectionId).ticket('TKT-1')).rejects.toThrow(
      'Failed to fetch ticketing/tickets/TKT-1: Not Found',
    );
  });
});

describe('Git', () => {
  let git: Git;

  beforeEach(() => {
    git = new Git(apiKey, connectionId);
  });

  it('should fetch repos', async () => {
    mockFetch.mockResolvedValueOnce(ok());

    await git.repos();

    expect(callUrl()).toContain('git/repos');
  });

  it('should throw when repos fails', async () => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect(git.repos()).rejects.toThrow('Failed to fetch git/repos: Bad Gateway');
  });

  const scoped = ['pulls', 'tags', 'releases', 'branches', 'commits'] as const;

  it.each(scoped)('should fetch %s for a repo', async method => {
    mockFetch.mockResolvedValueOnce(ok());

    await git[method]('acme/api');

    expect(callUrl()).toContain(`git/repos/acme%2Fapi/${method}`);
  });

  it.each(scoped)('should reject %s without a repo name', async method => {
    await expect(git[method]('')).rejects.toThrow(`repoName is required to fetch ${method}.`);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each(scoped)('should throw when %s fails', async method => {
    mockFetch.mockResolvedValueOnce(failed('Not Found', 404));

    await expect(git[method]('acme/api')).rejects.toThrow(`Failed to fetch git/repos/acme/api/${method}: Not Found`);
  });

  it.each(scoped)('should pass paging options through to %s', async method => {
    mockFetch.mockResolvedValueOnce(ok());

    await git[method]('acme/api', { limit: 5, after: 'cursor_1' });

    const url = new URL(callUrl());

    expect(url.searchParams.get('limit')).toBe('5');
    expect(url.searchParams.get('after')).toBe('cursor_1');
  });

  describe('commits', () => {
    it('should include the branch when given', async () => {
      mockFetch.mockResolvedValueOnce(ok());

      await git.commits('acme/api', { branch: 'main' });

      expect(new URL(callUrl()).searchParams.get('branch')).toBe('main');
    });

    it('should omit the branch when absent', async () => {
      mockFetch.mockResolvedValueOnce(ok());

      await git.commits('acme/api');

      expect(new URL(callUrl()).searchParams.has('branch')).toBe(false);
    });
  });
});

describe('Me', () => {
  const account = { data: { id: 'u_1', name: 'Ada', email: 'ada@acme.io', avatar_url: null } };

  let me: Me;

  beforeEach(() => {
    me = new Me(apiKey, connectionId);
  });

  it('should target the root me endpoint, not a vertical', async () => {
    mockFetch.mockResolvedValueOnce(ok(account));

    await me.get();

    expect(new URL(callUrl()).pathname).toBe('/v1/me');
  });

  it('should send the API key and connection ID', async () => {
    mockFetch.mockResolvedValueOnce(ok(account));

    await me.get();

    expect(callInit().headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'BU-Connection-Id': connectionId,
    });
  });

  it('should default include_raw and send no paging params', async () => {
    mockFetch.mockResolvedValueOnce(ok(account));

    await me.get();

    const url = new URL(callUrl());

    expect(url.searchParams.get('include_raw')).toBe('false');
    expect(url.searchParams.has('limit')).toBe(false);
    expect(url.searchParams.has('after')).toBe(false);
  });

  it('should pass include_raw through', async () => {
    mockFetch.mockResolvedValueOnce(ok(account));

    await me.get({ include_raw: true });

    expect(new URL(callUrl()).searchParams.get('include_raw')).toBe('true');
  });

  it('should return the parsed account', async () => {
    mockFetch.mockResolvedValueOnce(ok(account));

    await expect(me.get()).resolves.toEqual(account);
  });

  it('should throw when me fails', async () => {
    mockFetch.mockResolvedValueOnce(failed());

    await expect(me.get()).rejects.toThrow('Failed to fetch me: Bad Gateway');
  });
});
