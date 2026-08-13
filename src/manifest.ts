import { z } from 'zod';

export const PERMISSIONS = [
  'commands',
  'events',
  'tasks',
  'discord:read',
  'discord:send',
  'discord:roles',
  'discord:moderate',
  'network',
  'http-server',
  'database',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Plugin names the bot keeps for itself — a plugin may not claim one. */
export const RESERVED_PLUGIN_NAMES = [
  'admin',
  'bot',
  'core',
  'internal',
  'node-modules',
  'plugin',
  'plugins',
  'sdk',
  'system',
] as const;

/** Longest error string parseManifest will ever return. */
const MAX_ERROR_LENGTH = 500;

const SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

/**
 * Entrypoint path, relative to the plugin directory.
 *
 * Every rule here exists to keep `main` from escaping that directory: the
 * loader resolves it against the plugin folder and imports it, so an
 * unconstrained value is arbitrary code execution outside the sandbox.
 * The loader must still realpath the resolved file and confirm it stays
 * inside the plugin directory — symlinks defeat any string-level check.
 */
const mainPath = z
  .string()
  .min(1)
  .max(255)
  .refine((p) => !p.includes('\0'), 'main must not contain null bytes')
  .refine((p) => !p.includes('\\'), 'main must use forward slashes')
  .refine((p) => !/^[a-zA-Z]:/.test(p), 'main must not be an absolute path')
  .refine((p) => !p.startsWith('/'), 'main must not be an absolute path')
  .refine((p) => !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(p), 'main must not be a URL')
  .refine((p) => {
    const segments = p.split('/');
    return segments.every((s) => s !== '' && s !== '.' && s !== '..');
  }, 'main must stay inside the plugin directory')
  .refine((p) => /\.(js|mjs|cjs|ts|mts)$/.test(p), 'main must point to a JS/TS entrypoint');

export const manifestSchema = z
  .object({
    name: z
      .string()
      .max(64)
      .regex(/^[a-z0-9][a-z0-9-]*$/, 'name must be kebab-case')
      .refine(
        (n) => !(RESERVED_PLUGIN_NAMES as readonly string[]).includes(n),
        'name is reserved by the bot',
      ),
    version: z.string().regex(SEMVER, 'version must be semver'),
    author: z.string().min(1).max(128),
    description: z.string().max(512).default(''),
    apiVersion: z.literal('1.0'),
    main: mainPath,
    permissions: z
      .array(z.enum(PERMISSIONS))
      .max(PERMISSIONS.length, 'permissions contains more entries than there are permissions')
      .default([])
      .transform((list) => [...new Set(list)]),
  })
  .strict();

export type PluginManifest = z.infer<typeof manifestSchema>;

export type ManifestResult =
  | { ok: true; manifest: PluginManifest }
  | { ok: false; error: string };

export function parseManifest(raw: unknown): ManifestResult {
  const parsed = manifestSchema.safeParse(raw);
  if (parsed.success) return { ok: true, manifest: parsed.data };

  const error = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ')
    // Issue messages can echo manifest values back; keep them from forging log lines.
    .replace(/[\r\n]+/g, ' ')
    .slice(0, MAX_ERROR_LENGTH);
  return { ok: false, error };
}
