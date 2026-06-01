/**
 * Parses winget's table output using column positions from the header line.
 *
 * Winget outputs tables where columns are aligned by position under header
 * text. By measuring where each header starts/ends, we can extract values
 * from data rows by slicing at those same positions. This approach is
 * locale-independent — it only cares about position, not header text.
 *
 * Returns null if the input doesn't look like a winget table.
 *
 * @param input - Raw stdout from a winget command.
 * @param knownFields - Optional mapping of column index to field name.
 *                      If omitted, defaults to positional mapping.
 */
export function tryParseTable(
  input: string,
  knownFields?: string[],
): Record<string, unknown>[] | null {
  const lines = input.split("\n");
  if (lines.length < 3) return null;

  const headerIndex = findHeaderLine(lines);
  if (headerIndex === -1) return null;

  const separatorIndex = findSeparatorLine(lines, headerIndex + 1);
  if (separatorIndex === -1) return null;

  const headerLine = lines[headerIndex];
  const columns = parseColumns(headerLine);
  if (columns.length < 2) return null;

  const fields = knownFields ?? inferFields(columns);
  const dataStart = separatorIndex + 1;

  const results: Record<string, unknown>[] = [];
  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || isSeparatorLine(line)) continue;

    const row: Record<string, unknown> = {};
    let hasValue = false;
    for (let c = 0; c < columns.length; c++) {
      const field = fields[c];
      if (!field) continue;
      const value = line.slice(columns[c].start, columns[c].end).trim();
      if (value) {
        row[field] = value;
        hasValue = true;
      }
    }
    if (hasValue) results.push(row);
  }

  return results.length > 0 ? results : null;
}

interface Column {
  start: number;
  end: number;
}

function findHeaderLine(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s{2,}/);
    if (words.length >= 2) {
      return i;
    }
  }
  return -1;
}

function findSeparatorLine(lines: string[], start: number): number {
  for (let i = start; i < lines.length; i++) {
    if (isSeparatorLine(lines[i])) return i;
  }
  return -1;
}

function isSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return /^[\s\-─━═]+$/.test(trimmed);
}

function parseColumns(headerLine: string): Column[] {
  const columns: Column[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(headerLine)) !== null) {
    columns.push({
      start: match.index,
      end: headerLine.length,
    });
  }

  for (let i = 0; i < columns.length - 1; i++) {
    columns[i].end = columns[i + 1].start;
  }

  return columns;
}

function inferFields(columns: Column[]): string[] {
  const defaults: Record<number, string> = {
    0: "name",
    1: "id",
    2: "version",
  };

  if (columns.length === 4) {
    defaults[3] = "source";
  } else if (columns.length >= 5) {
    defaults[3] = "availableVersion";
    defaults[4] = "source";
  }

  const fields: string[] = [];
  for (let i = 0; i < columns.length; i++) {
    fields.push(defaults[i] ?? `col${i}`);
  }
  return fields;
}
