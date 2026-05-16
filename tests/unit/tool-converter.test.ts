/**
 * Unit Tests — Tool Converter (src/providers/tool-converter.ts)
 *
 * Tests the bridge between Shem MCP tool definitions and OpenAI function
 * format. The function now takes a flat array of SdkMcpToolDefinition
 * (no MCP server wrapper) — see the comment block in tool-converter.ts
 * for why. Tests were updated to match that signature.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { SdkMcpToolDefinition } from '@anthropic-ai/claude-agent-sdk';
import { buildToolRegistry } from '../../src/providers/tool-converter.js';

interface ToolOpts {
  description?: string;
  inputSchema?: z.ZodRawShape;
  handler?: (
    args: Record<string, unknown>,
    extra: unknown,
  ) => Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }>;
}

function tool(name: string, opts: ToolOpts = {}): SdkMcpToolDefinition<z.ZodRawShape> {
  return {
    name,
    // Leave description undefined when not provided so the fallback in
    // buildToolRegistry (`?? \`Tool: ${name}\``) can be exercised.
    description: opts.description,
    inputSchema: opts.inputSchema ?? {},
    handler:
      opts.handler ??
      (async () => ({ content: [{ type: 'text', text: 'OK' }] })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('buildToolRegistry', () => {
  it('converts MCP tools to OpenAI function definitions', () => {
    const registry = buildToolRegistry([
      tool('debate_board', {
        description: 'Post findings',
        inputSchema: { finding: z.string() },
      }),
      tool('score', { description: 'Score document' }),
    ]);
    expect(registry.definitions).toHaveLength(2);
    expect(registry.definitions[0].type).toBe('function');
    expect(registry.definitions[0].function.name).toBe('debate_board');
    expect(registry.definitions[0].function.description).toBe('Post findings');
    // z.toJSONSchema produces extra fields (required, additionalProperties)
    // — we only assert the shape we care about.
    expect(registry.definitions[0].function.parameters).toMatchObject({
      type: 'object',
      properties: { finding: { type: 'string' } },
    });
  });

  it('uses fallback description when none provided', () => {
    const registry = buildToolRegistry([tool('mystery_tool')]);
    expect(registry.definitions[0].function.description).toBe('Tool: mystery_tool');
  });

  it('uses empty object schema when none provided', () => {
    const registry = buildToolRegistry([tool('no_schema')]);
    expect(registry.definitions[0].function.parameters).toMatchObject({
      type: 'object',
    });
  });

  it('callTool extracts text from successful result', async () => {
    const registry = buildToolRegistry([
      tool('test', {
        handler: async () => ({
          content: [
            { type: 'text', text: 'Result line 1' },
            { type: 'text', text: 'Result line 2' },
          ],
        }),
      }),
    ]);
    const result = await registry.callTool('test', {});
    expect(result).toBe('Result line 1\nResult line 2');
  });

  it('callTool returns error text for isError responses', async () => {
    const registry = buildToolRegistry([
      tool('test', {
        handler: async () => ({
          content: [{ type: 'text', text: 'Something broke' }],
          isError: true,
        }),
      }),
    ]);
    const result = await registry.callTool('test', {});
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('Something broke');
  });

  it('callTool handles empty error content', async () => {
    const registry = buildToolRegistry([
      tool('test', { handler: async () => ({ content: [], isError: true }) }),
    ]);
    const result = await registry.callTool('test', {});
    expect(result).toContain('Unknown tool error');
  });

  it('callTool catches exceptions and returns error string', async () => {
    const registry = buildToolRegistry([
      tool('throws', {
        handler: async () => {
          throw new Error('Connection lost');
        },
      }),
    ]);
    const result = await registry.callTool('throws', {});
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('Connection lost');
  });

  it('callTool filters non-text content blocks', async () => {
    const registry = buildToolRegistry([
      tool('test', {
        handler: async () => ({
          content: [
            { type: 'image' },
            { type: 'text', text: 'Real content' },
          ],
        }),
      }),
    ]);
    const result = await registry.callTool('test', {});
    expect(result).toBe('Real content');
  });

  it('returns an [TOOL ERROR] for an unknown tool name', async () => {
    const registry = buildToolRegistry([tool('present')]);
    const result = await registry.callTool('absent', {});
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('absent');
  });

  it('handles empty tool list', () => {
    const registry = buildToolRegistry([]);
    expect(registry.definitions).toEqual([]);
  });
});
