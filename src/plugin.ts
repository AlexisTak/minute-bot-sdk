import type { PluginContext } from './context';

export abstract class Plugin {
  /** Must match the `name` field of plugin.json. */
  abstract readonly name: string;

  /** Called on every activation, before onEnable. */
  onLoad?(context: PluginContext): void | Promise<void>;

  /** Called on every activation. This is where commands and events are registered. */
  abstract onEnable(context: PluginContext): void | Promise<void>;

  /**
   * Called on every deactivation. The loader revokes every Disposable
   * returned by the register*() calls anyway; this hook is only for
   * resources the plugin created by itself.
   */
  onDisable?(): void | Promise<void>;
}
