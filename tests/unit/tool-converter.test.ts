/**
 * Unit Tests — Tool Converter (src/providers/tool-converter.ts)
 *
 * Verifies the bridge from `SdkMcpToolDefinition[]` to OpenAI function
 * format used by the Mistral and local providers.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { SdkMcpToolDefinition } from '@anthropic-ai/claude-agent-sdk';
import { buildToolRegistry } from '../../src/providers/tool-converter.js';

type ToolResult = { content: Array<{ type: string; text?: string }>; isError?: boolean };

function makeTool(
  name: string,
  description: string | undefined,
  inputSchema: Record<string, z.ZodTypeAny>,
  handler: (args: unknown) => Promise<ToolResult>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): SdkMcpToolDefinition<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { name, description, inputSchema, handler } as unknown as SdkMcpToolDefinition<any>;
}

describe('buildToolRegistry', () => {
  it('converts tool definitions to OpenAI function format', () => {
    const tools = [
      makeTool('debate_board', 'Post findings', { finding: z.string() }, async () => ({
        content: [{ type: 'text', text: 'OK' }],
      })),
      makeTool('score', 'Score document', {}, async () => ({
        content: [{ type: 'text', text: 'OK' }],
      })),
    ];

    const registry = buildToolRegistry(tools);
    expect(registry.definitions).toHaveLength(2);
    expect(registry.definitions[0].type).toBe('function');
    expect(registry.definitions[0].function.name).toBe('debate_board');
    expect(registry.definitions[0].function.description).toBe('Post findings');
    const params = registry.definitions[0].function.parameters as Record<string, unknown>;
    expect(params.type).toBe('object');
    expect((params.properties as Record<string, unknown>).finding).toBeDefined();
  });

  it('uses fallback description when none provided', () => {
    const tools = [makeTool('mystery_tool', undefined, {}, async () => ({ content: [] }))];
    const registry = buildToolRegistry(tools);
    expect(registry.definitions[0].function.description).toBe('Tool: mystery_tool');
  });

  it('produces an empty-properties object schema for tools with no inputs', () => {
    const tools = [makeTool('no_args', 'desc', {}, async () => ({ content: [] }))];
    const registry = buildToolRegistry(tools);
    const params = registry.definitions[0].function.parameters as Record<string, unknown>;
    expect(params.type).toBe('object');
    expect(params.properties).toEqual({});
  });

  it('callTool extracts text from successful result', async () => {
    const tools = [
      makeTool('test', 'desc', {}, async () => ({
        content: [
          { type: 'text', text: 'Result line 1' },
          { type: 'text', text: 'Result line 2' },
        ],
      })),
    ];
    const registry = buildToolRegistry(tools);
    const result = await registry.callTool('test', {});
    expect(result).toBe('Result line 1\nResult line 2');
  });

  it('callTool returns error text for isError responses', async () => {
    const tools = [
      makeTool('test', 'desc', {}, async () => ({
        content: [{ type: 'text', text: 'Something broke' }],
        isError: true,
      })),
    ];
    const registry = buildToolRegistry(tools);
    const result = await registry.callTool('test', {});
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('Something broke');
  });

  it('callTool handles empty error content', async () => {
    const tools = [
      makeTool('test', 'desc', {}, async () => ({ content: [], isError: true })),
    ];
    const registry = buildToolRegistry(tools);
    const result = await registry.callTool('test', {});
    expect(result).toContain('Unknown tool error');
  });

  it('callTool catches handler exceptions and returns error string', async () => {
    const tools = [
      makeTool('throws', 'desc', {}, async () => {
        throw new Error('Connection lost');
      }),
    ];
    const registry = buildToolRegistry(tools);
    const result = await registry.callTool('throws', {});
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('Connection lost');
  });

  it('callTool filters non-text content blocks', async () => {
    const tools = [
      makeTool('test', 'desc', {}, async () => ({
        content: [
          { type: 'image' },
          { type: 'text', text: 'Real content' },
        ],
      })),
    ];
    const registry = buildToolRegistry(tools);
    const result = await registry.callTool('test', {});
    expect(result).toBe('Real content');
  });

  it('callTool returns error for unknown tool name', async () => {
    const registry = buildToolRegistry([]);
    const result = await registry.callTool('nonexistent', {});
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('Unknown tool');
  });

  it('callTool rejects invalid args via Zod', async () => {
    const tools = [
      makeTool(
        'strict',
        'desc',
        { count: z.number().int().min(1) },
        async () => ({ content: [{ type: 'text', text: 'ok' }] }),
      ),
    ];
    const registry = buildToolRegistry(tools);
    const result = await registry.callTool('strict', { count: 'not a number' });
    expect(result).toContain('[TOOL ERROR]');
    expect(result).toContain('invalid args');
  });

  it('handles empty tool list', () => {
    const registry = buildToolRegistry([]);
    expect(registry.definitions).toEqual([]);
  });
});
