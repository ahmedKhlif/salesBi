import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex < 1) {
        return undefined;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = stripQuotes(line.slice(separatorIndex + 1));
      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry));
}

export function loadProjectEnv() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    const parsedEntries = parseEnvFile(readFileSync(filePath, 'utf8'));
    for (const [key, value] of parsedEntries) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}
