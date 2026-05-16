/**
 * Unit Tests — Auth Middleware (src/api/middleware/auth.ts)
 *
 * Tests:
 * - ClientRegistry (register, authenticate, remove, list)
 * - parseCookieToken (parsing lavern_token from cookie headers)
 * - createAuthMiddleware (public path matching: exact, prefix, wildcard, method-specific)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientRegistry, parseCookieToken, createAuthMiddleware } from '../../src/api/middleware/auth.js';

// ── ClientRegistry ──────────────────────────────────────────────────────

describe('ClientRegistry', () => {
  let registry: ClientRegistry;

  beforeEach(() => {
    registry = new ClientRegistry();
  });

  describe('registerClient', () => {
    it('should register a human client and return an API key', () => {
      const { client, apiKey } = registry.registerClient('human', { name: 'Test User' });
      expect(client.type).toBe('human');
      expect(client.name).toBe('Test User');
      expect(client.id).toMatch(/^client-/);
      expect(apiKey).toMatch(/^shem_human_/);
      expect(client.registeredAt).toBeDefined();
    });

    it('should register an agent client with capabilities', () => {
      const { client, apiKey } = registry.registerClient('agent', {
        name: 'Bot',
        capabilities: ['contract-review', 'research'],
        callbackUrl: 'https://example.com/webhook',
        autoApproveThreshold: 0.8,
      });
      expect(client.type).toBe('agent');
      expect(apiKey).toMatch(/^shem_agent_/);
      expect(client.capabilities).toEqual(['contract-review', 'research']);
      expect(client.callbackUrl).toBe('https://example.com/webhook');
      expect(client.autoApproveThreshold).toBe(0.8);
    });

    it('should generate unique IDs for each client', () => {
      const { client: c1 } = registry.registerClient('human');
      const { client: c2 } = registry.registerClient('human');
      expect(c1.id).not.toBe(c2.id);
    });

    it('should generate unique API keys for each client', () => {
      const { apiKey: k1 } = registry.registerClient('human');
      const { apiKey: k2 } = registry.registerClient('human');
      expect(k1).not.toBe(k2);
    });
  });

  describe('authenticate', () => {
    it('should authenticate with a valid API key', () => {
      const { client, apiKey } = registry.registerClient('agent', { name: 'Auth Test' });
      const authed = registry.authenticate(apiKey);
      expect(authed).not.toBeNull();
      expect(authed!.id).toBe(client.id);
      expect(authed!.name).toBe('Auth Test');
    });

    it('should return null for an invalid API key', () => {
      registry.registerClient('human');
      const result = registry.authenticate('shem_human_invalid_key_12345');
      expect(result).toBeNull();
    });

    it('should return null for an empty API key', () => {
      expect(registry.authenticate('')).toBeNull();
    });

    it('should update lastActiveAt on successful authentication', () => {
      const { client, apiKey } = registry.registerClient('agent');
      expect(client.lastActiveAt).toBeUndefined();

      const authed = registry.authenticate(apiKey);
      expect(authed!.lastActiveAt).toBeDefined();
    });

    it('should not authenticate after client is removed', () => {
      const { client, apiKey } = registry.registerClient('human');
      registry.removeClient(client.id);
      expect(registry.authenticate(apiKey)).toBeNull();
    });
  });

  describe('getClient', () => {
    it('should return a registered client by ID', () => {
      const { client } = registry.registerClient('human', { name: 'Lookup' });
      expect(registry.getClient(client.id)?.name).toBe('Lookup');
    });

    it('should return null for unknown ID', () => {
      expect(registry.getClient('nonexistent')).toBeNull();
    });
  });

  describe('getAllClients', () => {
    it('should return empty array when no clients registered', () => {
      expect(registry.getAllClients()).toEqual([]);
    });

    it('should return all registered clients', () => {
      registry.registerClient('human', { name: 'A' });
      registry.registerClient('agent', { name: 'B' });
      const all = registry.getAllClients();
      expect(all).toHaveLength(2);
      expect(all.map(c => c.name).sort()).toEqual(['A', 'B']);
    });
  });

  describe('removeClient', () => {
    it('should remove a client and return true', () => {
      const { client } = registry.registerClient('human');
      expect(registry.removeClient(client.id)).toBe(true);
      expect(registry.getClient(client.id)).toBeNull();
    });

    it('should return false for unknown client ID', () => {
      expect(registry.removeClient('nonexistent')).toBe(false);
    });

    it('should clean up API key hash mapping', () => {
      const { client, apiKey } = registry.registerClient('human');
      registry.removeClient(client.id);
      // Key should no longer authenticate
      expect(registry.authenticate(apiKey)).toBeNull();
    });
  });
});

// ── parseCookieToken ────────────────────────────────────────────────────

describe('parseCookieToken', () => {
  it('should parse lavern_token from a simple cookie header', () => {
    expect(parseCookieToken('lavern_token=abc123')).toBe('abc123');
  });

  it('should parse lavern_token from multiple cookies', () => {
    expect(parseCookieToken('other=foo; lavern_token=token_value; third=bar')).toBe('token_value');
  });

  it('should return null when lavern_token is not present', () => {
    expect(parseCookieToken('session=xyz; theme=dark')).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(parseCookieToken(undefined)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseCookieToken('')).toBeNull();
  });

  it('should handle lavern_token with no value', () => {
    // "lavern_token=" → split('=')[1] is '' → '' || null → null
    expect(parseCookieToken('lavern_token=')).toBeNull();
  });

  it('should handle whitespace around the token value', () => {
    expect(parseCookieToken('lavern_token= abc123 ')).toBe('abc123');
  });
});

// ── createAuthMiddleware — Public Path Matching ─────────────────────────

// ── createAuthMiddleware ────────────────────────────────────────────────
//
// Auth was deliberately removed for the OSS local-first release. The
// middleware is now a no-op that injects a synthetic local user on every
// request. Bearer-token, cookie, and public-path matching tests from the
// pre-OSS version live in git history (commit 25bef1a^).
//
// If multi-user auth ever lands again, restore the pre-OSS test block
// alongside the restored middleware logic.

describe('createAuthMiddleware (local-mode no-op)', () => {
  const registry = new ClientRegistry();
  const middleware = createAuthMiddleware(registry);

  function req(method: string, url: string, headers: Record<string, string> = {}): any {
    return { method, url, headers };
  }
  function reply(): any { return {}; }

  it('injects request.userId = "local-user"', async () => {
    const r = req('GET', '/api/whatever');
    await middleware(r, reply());
    expect((r as any).userId).toBe('local-user');
  });

  it('injects request.user with id, email, displayName', async () => {
    const r = req('GET', '/api/whatever');
    await middleware(r, reply());
    expect((r as any).user).toEqual({
      id: 'local-user',
      email: 'local@localhost',
      displayName: 'Local User',
    });
  });

  it('never rejects — even on a path that used to require auth', async () => {
    const r = req('POST', '/api/sessions');
    await expect(middleware(r, reply())).resolves.toBeUndefined();
  });

  it('ignores Authorization header (auth path is removed)', async () => {
    const r = req('GET', '/api/private', { authorization: 'Bearer obviously-bad' });
    await expect(middleware(r, reply())).resolves.toBeUndefined();
    expect((r as any).userId).toBe('local-user');
  });

  it('ignores cookies (auth path is removed)', async () => {
    const r = req('GET', '/api/private', { cookie: 'lavern_token=garbage' });
    await expect(middleware(r, reply())).resolves.toBeUndefined();
    expect((r as any).userId).toBe('local-user');
  });
});
