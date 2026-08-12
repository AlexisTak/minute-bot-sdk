import type {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  Interaction,
  Message,
  PartialGuildMember,
} from 'discord.js';

export interface Disposable {
  dispose(): void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  child(scope: string): Logger;
}

export interface BotEventMap {
  messageCreate: Message;
  interactionCreate: Interaction;
  memberJoin: GuildMember;
  memberLeave: GuildMember | PartialGuildMember;
  guildCreate: Guild;
  guildDelete: Guild;
  scheduledTask: { name: string };
}

export type BotEventName = keyof BotEventMap;

export interface CommandInvocation {
  readonly interaction: ChatInputCommandInteraction;
  reply(content: string): Promise<void>;
}

export interface CommandDefinition {
  name: string;
  description: string;
  execute(invocation: CommandInvocation): void | Promise<void>;
}

export interface CommandApi {
  register(definition: CommandDefinition): Disposable;
}

export interface EventApi {
  on<K extends BotEventName>(
    event: K,
    handler: (payload: BotEventMap[K]) => void | Promise<void>,
  ): Disposable;
}

export interface TaskDefinition {
  name: string;
  intervalMs: number;
  runOnStart?: boolean;
  run(): void | Promise<void>;
}

export interface TaskApi {
  register(definition: TaskDefinition): Disposable;
}

export interface DiscordApi {
  sendMessage(channelId: string, content: string): Promise<void>;
  createEmbed(init: { title?: string; description?: string; color?: number }): EmbedBuilder;
  manageRole(
    guildId: string,
    userId: string,
    roleId: string,
    action: 'add' | 'remove',
  ): Promise<void>;
  kickMember(guildId: string, userId: string, reason?: string): Promise<void>;
  banMember(guildId: string, userId: string, reason?: string): Promise<void>;
}

export interface HttpApi {
  fetch(url: string, init?: RequestInit, timeoutMs?: number): Promise<Response>;
}

export interface PluginConfig {
  get<T = unknown>(key: string): T | undefined;
  set(key: string, value: unknown): Promise<void>;
  all(): Record<string, unknown>;
}

export interface Cache {
  get<T = unknown>(key: string): T | undefined;
  set(key: string, value: unknown, ttlMs?: number): void;
  delete(key: string): void;
  clear(): void;
}

/** Phase 2: the REST API does not exist yet. */
export interface RouteApi {
  register(definition: never): Disposable;
}

/** Phase 2: Prisma is not wired up yet. */
export interface DatabaseApi {
  query(sql: string, params?: unknown[]): Promise<unknown>;
}
