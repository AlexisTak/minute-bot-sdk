import { describe, expect, test } from 'vitest';
import { parseManifest } from './manifest';

const valid = {
  name: 'example-plugin',
  version: '1.0.0',
  author: 'Community',
  description: 'Plugin exemple',
  apiVersion: '1.0',
  main: 'src/index.ts',
  permissions: ['commands', 'events'],
};

describe('parseManifest', () => {
  test('accepts a valid manifest', () => {
    const result = parseManifest(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.name).toBe('example-plugin');
      expect(result.manifest.permissions).toEqual(['commands', 'events']);
    }
  });

  test('defaults permissions to an empty list', () => {
    const { permissions, ...withoutPermissions } = valid;
    const result = parseManifest(withoutPermissions);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.manifest.permissions).toEqual([]);
  });

  test('rejects an unknown permission', () => {
    const result = parseManifest({ ...valid, permissions: ['filesystem'] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('permissions');
  });

  test('rejects an unsupported api version', () => {
    const result = parseManifest({ ...valid, apiVersion: '2.0' });
    expect(result.ok).toBe(false);
  });

  test('rejects a name that is not kebab-case', () => {
    const result = parseManifest({ ...valid, name: 'Example Plugin' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('name');
  });

  test('rejects a non-object input', () => {
    expect(parseManifest('nope').ok).toBe(false);
  });
});
