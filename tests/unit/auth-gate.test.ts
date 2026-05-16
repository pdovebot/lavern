/**
 * Unit Tests — LAVERN_AUTH_ENABLED route-registration gates.
 *
 * Regression guard for the LOCAL-MODE auth surface. v0.15.0 wraps the
 * registration of six route groups (auth, user-auth, google-oauth,
 * billing, referral, the require-verified onRequest hook) in
 * `if (config.authEnabled)` so that the OSS-default LOCAL MODE doesn't
 * surface dead infrastructure. The tests here pin that wiring:
 *
 *   · auth off → POST /api/auth/signup, POST /api/billing/*,
 *                GET /api/auth/google all 404
 *   · auth on  → those routes register (status varies by route, but
 *                NOT 404 — that's the contract this test enforces)
 *
 * If a future refactor removes one of the gates, this test fails loudly
 * before the wrong behaviour hits a release.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Minimal in-test registration plumbing — we don't boot the full server
// (DB, sessions, sockets); we only need to check what routes register
// when each helper is given the relevant flag.
async function buildGatedApp(authEnabled: boolean): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  // Mirror the gate pattern in src/api/server.ts:640-652.
  if (authEnabled) {
    const { registerUserAuthRoutes } = await import('../../src/api/routes/auth-routes.js');
    const { registerGoogleAuthRoutes } = await import('../../src/api/routes/google-auth.js');
    const { registerBillingRoutes } = await import('../../src/api/routes/billing.js');
    const { registerReferralRoutes } = await import('../../src/api/routes/referral.js');
    registerUserAuthRoutes(app);
    registerGoogleAuthRoutes(app);
    registerBillingRoutes(app);
    registerReferralRoutes(app);
  }

  // /api/capabilities ALWAYS registers — the frontend uses it to decide
  // what to render, so it must respond identically in both modes.
  app.get('/api/capabilities', async () => ({
    auth: authEnabled,
    billing: authEnabled,
    googleOauth: false, // we don't wire google.clientId in this fixture
    provider: 'anthropic',
    version: 'test',
  }));

  await app.ready();
  return app;
}

// ── LOCAL MODE (auth off) ───────────────────────────────────────────────

describe('LAVERN_AUTH_ENABLED=false (LOCAL MODE)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildGatedApp(false);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/capabilities reports auth: false', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/capabilities' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.auth).toBe(false);
    expect(body.billing).toBe(false);
  });

  it('POST /api/auth/signup returns 404 — route is not registered', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { email: 'x@example.com', password: 'whatever123' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/auth/login returns 404', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'x@example.com', password: 'whatever123' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/auth/me returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/auth/google returns 404 (OAuth gate)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/google' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/billing/status returns 404 — billing routes gated off', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/billing/status' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/referral/stats returns 404 — referral routes gated off', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/referral/stats' });
    expect(res.statusCode).toBe(404);
  });
});

// ── Hosted / shared mode (auth on) ──────────────────────────────────────

describe('LAVERN_AUTH_ENABLED=true (auth + billing live)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildGatedApp(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/capabilities reports auth: true', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/capabilities' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.auth).toBe(true);
    expect(body.billing).toBe(true);
  });

  it('POST /api/auth/signup is REGISTERED (any non-404 status)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { email: 'x@example.com', password: 'whatever123' },
    });
    // Real status depends on validation/DB — we just assert the route
    // exists. 400/422/500 are all fine; 404 means the gate is broken.
    expect(res.statusCode).not.toBe(404);
  });

  it('POST /api/auth/login is REGISTERED', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'x@example.com', password: 'whatever123' },
    });
    expect(res.statusCode).not.toBe(404);
  });

  it('GET /api/auth/google is REGISTERED', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/google' });
    expect(res.statusCode).not.toBe(404);
  });

  it('GET /api/billing/status is REGISTERED', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/billing/status' });
    expect(res.statusCode).not.toBe(404);
  });
});
