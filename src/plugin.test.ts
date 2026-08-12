import { expect, test, vi } from 'vitest';
import { Plugin } from './plugin';
import type { PluginContext } from './context';

class DemoPlugin extends Plugin {
  readonly name = 'demo';
  enabled = false;
  async onEnable(_ctx: PluginContext): Promise<void> {
    this.enabled = true;
  }
  async onDisable(): Promise<void> {
    this.enabled = false;
  }
}

test('a plugin subclass follows the enable/disable lifecycle', async () => {
  const plugin = new DemoPlugin();
  const ctx = {} as PluginContext;

  await plugin.onEnable(ctx);
  expect(plugin.enabled).toBe(true);

  await plugin.onDisable?.();
  expect(plugin.enabled).toBe(false);
});

test('onLoad is optional', () => {
  const plugin = new DemoPlugin();
  expect(plugin.onLoad).toBeUndefined();
  expect(vi.isMockFunction(plugin.onEnable)).toBe(false);
});
