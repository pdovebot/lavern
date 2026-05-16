/**
 * Unit Tests — Email Verification Middleware
 *   (src/api/middleware/require-verified.ts)
 *
 * Email verification was deliberately removed for the OSS local-first
 * release — there are no user accounts to verify when the firm runs on
 * your own machine. The middleware is now a no-op pass-through.
 *
 * The original block-unverified-users-with-403 test suite lives in git
 * history (commit 25bef1a^). Restore it alongside the middleware logic
 * if multi-user auth ever returns.
 */

import { describe, it, expect } from 'vitest';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { createRequireVerifiedHook } from '../../src/api/middleware/require-verified.js';

function mockRequest(overrides: Record<string, unknown> = {}): FastifyRequest {
  return {
    method: 'POST',
    url: '/api/sessions',
    headers: {},
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function mockReply(): FastifyReply {
  // The new middleware never touches reply, but provide chainable stubs
  // so a future re-introduction of the hook fails loudly instead of
  // silently no-op'ing the assertion.
  const reply = {
    status: () => reply,
    send: () => reply,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  return reply;
}

describe('createRequireVerifiedHook (local-mode no-op)', () => {
  const hook = createRequireVerifiedHook(['/api/auth/']);

  it('resolves without throwing for an anonymous request', async () => {
    await expect(hook(mockRequest(), mockReply())).resolves.toBeUndefined();
  });

  it('resolves for an authenticated request regardless of verified state', async () => {
    const req = mockRequest({ userId: 'local-user', user: { id: 'local-user' } });
    await expect(hook(req, mockReply())).resolves.toBeUndefined();
  });

  it('resolves for non-exempt paths just the same', async () => {
    const req = mockRequest({ url: '/api/sessions', userId: 'local-user' });
    await expect(hook(req, mockReply())).resolves.toBeUndefined();
  });

  it('resolves for non-GET methods just the same', async () => {
    const req = mockRequest({ method: 'POST', userId: 'local-user' });
    await expect(hook(req, mockReply())).resolves.toBeUndefined();
  });

  it('resolves even with a Bearer Authorization header', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer shem_agent_xyz' } });
    await expect(hook(req, mockReply())).resolves.toBeUndefined();
  });
});
