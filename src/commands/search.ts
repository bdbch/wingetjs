import type { WingetClient } from "../client.ts";
import type { SearchOptions, SearchResult } from "../types.ts";
import { tryParseJson } from "../parsers/json.ts";
import { tryParseTable } from "../parsers/table.ts";

/**
 * Search for available packages using winget.
 *
 * Tries JSON output first (faster, structured), falls back to table parsing
 * for older winget versions that don't support --output json.
 *
 * @param client - A configured WingetClient instance.
 * @param query - Search string (substring match by default).
 * @param options - Optional search filters.
 * @returns An array of matching packages.
 */
export async function search(
  client: WingetClient,
  query?: string,
  options?: SearchOptions,
): Promise<SearchResult[]> {
  const args = buildSearchArgs(query, options, true);
  const { stdout } = await client.run(args);

  const json = tryParseJson(stdout);
  if (json) {
    return json as unknown as SearchResult[];
  }

  const table = tryParseTable(stdout, ["name", "id", "version", "matchType", "source"]);
  if (table) {
    return table as unknown as SearchResult[];
  }

  return [];
}

function buildSearchArgs(query?: string, options?: SearchOptions, withJson?: boolean): string[] {
  const args: string[] = ["search"];

  if (query !== undefined && query !== "") {
    args.push("--query", query);
  }

  if (options?.id) args.push("--id", options.id);
  if (options?.name) args.push("--name", options.name);
  if (options?.moniker) args.push("--moniker", options.moniker);
  if (options?.tag) args.push("--tag", options.tag);
  if (options?.command) args.push("--command", options.command);
  if (options?.source) args.push("--source", options.source);
  if (options?.count !== undefined) args.push("--count", String(options.count));
  if (options?.exact) args.push("--exact");
  if (options?.versions) args.push("--versions");
  if (options?.authenticationMode) args.push("--authentication-mode", options.authenticationMode);
  if (options?.authenticationAccount)
    args.push("--authentication-account", options.authenticationAccount);

  if (withJson) {
    args.push("--output", "json");
  }

  return args;
}
