/**
 * Tool Converter — Bridges Shem MCP tool definitions to OpenAI function format.
 *
 * The Anthropic path wraps the Shem tools via `createSdkMcpServer`, but the
 * SDK's returned object is *not* an MCP server the rest of the world can talk
 * to — it's an internal `{ type, name, instance }` envelope with no
 * `listTools` / `callTool` surface. Trying to use it as a generic MCP server
 * is why this converter previously crashed with
 * `mcpServer.listTools is not a function`.
 *
 * Mistral and local providers don't need the SDK wrapper at all: every Shem
 * tool is already an `SdkMcpToolDefinition` (`{ name, description,
 * inputSchema, handler }`), and that's all OpenAI-compatible function
 * calling needs. We build the registry directly from the tool array
 * (see `buildShemTools` in `src/mcp/server.ts`).
 */

import { z } from 'zod';
import type { SdkMcpToolDefinition } from '@anthropic-ai/claude-agent-sdk';
import type { MistralToolDefinition } from './mistral.js';

// ── Types ───────────────────────────────────────────────────────────────

/**
 * A resolved tool registry ready for the Mistral / local executor.
 */
export interface ToolRegistry {
  /** OpenAI function definitions (for the API request) */
  definitions: MistralToolDefinition[];
  /** Call a tool by name, returns text result */
  callTool: (name: string, args: Record<string, unknown>) => Promise<string>;
}

// ── Converter ───────────────────────────────────────────────────────────

/**
 * Build a ToolRegistry from a flat array of Shem tool definitions.
 *
 * The SDK stores `inputSchema` as a raw Zod *shape* (`AnyZodRawShape`),
 * not a fully-constructed `z.object(...)`. We wrap it on the fly here for
 * both schema export (toJSONSchema for the OpenAI request body) and
 * runtime validation (safeParse before handler dispatch). This matches
 * the pattern already used in `src/mcp/remote-bridge/dispatcher.ts`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildToolRegistry(tools: Array<SdkMcpToolDefinition<any>>): ToolRegistry {
  const byName = new Map<string, (typeof tools)[number]>();
  const definitions: MistralToolDefinition[] = [];

  for (const t of tools) {
    byName.set(t.name, t);

    let parameters: Record<string, unknown>;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const schema = z.object(t.inputSchema as any);
      parameters = z.toJSONSchema(schema) as Record<string, unknown>;
    } catch {
      // Fallback so a single broken schema doesn't sink the whole registry —
      // the tool stays callable, just without typed parameters.
      parameters = { type: 'object', properties: {}, additionalProperties: true };
    }

    definitions.push({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description ?? `Tool: ${t.name}`,
        parameters,
      },
    });
  }

  const callTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
    const tool = byName.get(name);
    if (!tool) return `[TOOL ERROR] Unknown tool: ${name}`;

    // Validate args with the same Zod shape we exposed to the model.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = z.object(tool.inputSchema as any);
    const parsed = schema.safeParse(args ?? {});
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ');
      return `[TOOL ERROR] ${name} invalid args: ${message}`;
    }

    try {
      // The SDK handler signature is `(args, extra)`. We pass `undefined` for
      // extra — same as the remote bridge does — because the in-process
      // tools don't depend on the extra context.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (tool.handler as any)(parsed.data, undefined);

      const content: Array<{ type: string; text?: string }> = Array.isArray(result?.content) ? result.content : [];
      const text = content
        .filter((c) => c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text as string)
        .join('\n');

      if (result?.isError) {
        return `[TOOL ERROR] ${text || 'Unknown tool error'}`;
      }
      return text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `[TOOL ERROR] ${name} failed: ${message}`;
    }
  };

  return { definitions, callTool };
}
