/**
 * Attempts to parse a JSON string from winget's --output json flag.
 *
 * Winget search, list, and upgrade commands output a flat array of objects
 * with PascalCase keys (Id, Name, Version, Source, ...). This parser
 * normalizes the keys to camelCase and returns the array.
 *
 * If the input is not valid JSON or is empty, returns null so the caller
 * can fall back to table parsing.
 *
 * @param input - Raw stdout from a winget command.
 * @returns Normalized array of records, or null if parsing failed.
 */
export function tryParseJson(input: string): Record<string, unknown>[] | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) {
    return null;
  }

  return parsed.map((item) => normalizeKeys(item as Record<string, unknown>));
}

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[normalizeKey(key)] = value;
  }
  return result;
}

function normalizeKey(key: string): string {
  if (!key) return key;
  return key[0].toLowerCase() + key.slice(1);
}
