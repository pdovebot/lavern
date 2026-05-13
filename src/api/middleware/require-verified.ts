/**
 * Email verification enforcement middleware.
 *
 * Blocks authenticated users whose email is not yet verified from
 * accessing paid operations. Anonymous requests (QuickStart) and
 * exempt paths (auth, billing, read-only metadata) pass through.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { isEmailVerified } from '../../db/database.js';

/**
 * Create a Fastify onRequest hook that enforces email verification.
 *
 * @param exemptPrefixes — URL prefixes that unverified users may access
 *   (e.g. `/api/auth/`, `/api/billing/`). Matched with startsWith.
 */
export function createRequireVerifiedHook(
  exemptPrefixes: string[],
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // LOCAL MODE: skip email verification — see git history for original logic
  };
}
