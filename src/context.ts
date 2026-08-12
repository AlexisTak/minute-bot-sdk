import type {
  Cache,
  CommandApi,
  DatabaseApi,
  DiscordApi,
  EventApi,
  HttpApi,
  Logger,
  PluginConfig,
  RouteApi,
  TaskApi,
} from './types';

export interface PluginContext {
  /** Name of the plugin owning this context. */
  readonly pluginName: string;
  /** Always available. */
  readonly logger: Logger;
  /** Always available, isolated per plugin. */
  readonly config: PluginConfig;
  /** Always available, in memory. */
  readonly cache: Cache;
  /** Permission `commands`. */
  readonly commands: CommandApi;
  /** Permission `events`. */
  readonly events: EventApi;
  /** Permission `tasks`. */
  readonly tasks: TaskApi;
  /** Permission `discord`. */
  readonly discord: DiscordApi;
  /** Permission `network`. */
  readonly http: HttpApi;
  /** Permission `http-server` — not implemented in phase 1. */
  readonly routes: RouteApi;
  /** Permission `database` — not implemented in phase 1. */
  readonly database: DatabaseApi;
}
