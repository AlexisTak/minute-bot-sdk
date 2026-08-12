import { z } from 'zod';

export const PERMISSIONS = [
  'commands',
  'events',
  'tasks',
  'discord',
  'network',
  'http-server',
  'database',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const manifestSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'name must be kebab-case'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver'),
  author: z.string().min(1),
  description: z.string().default(''),
  apiVersion: z.literal('1.0'),
  main: z.string().min(1),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
});

export type PluginManifest = z.infer<typeof manifestSchema>;

export type ManifestResult =
  | { ok: true; manifest: PluginManifest }
  | { ok: false; error: string };

export function parseManifest(raw: unknown): ManifestResult {
  const parsed = manifestSchema.safeParse(raw);
  if (parsed.success) return { ok: true, manifest: parsed.data };

  const error = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ');
  return { ok: false, error };
}
