import type { WingetClient } from "../client.ts";
import type { InstalledPackage, ListOptions } from "../types.ts";
import { tryParseJson } from "../parsers/json.ts";
import { tryParseTable } from "../parsers/table.ts";

export async function listInstalled(
  client: WingetClient,
  query?: string,
  options?: ListOptions,
): Promise<InstalledPackage[]> {
  const args = buildListArgs(query, options, true);
  const { stdout } = await client.run(args);

  const json = tryParseJson(stdout);
  if (json) {
    return json as unknown as InstalledPackage[];
  }

  const table = tryParseTable(stdout, ["name", "id", "version", "availableVersion", "source"]);
  if (table) {
    return table as unknown as InstalledPackage[];
  }

  return [];
}

function buildListArgs(query?: string, options?: ListOptions, withJson?: boolean): string[] {
  const args: string[] = ["list"];

  if (query !== undefined && query !== "") {
    args.push("--query", query);
  }

  if (options?.id) args.push("--id", options.id);
  if (options?.name) args.push("--name", options.name);
  if (options?.moniker) args.push("--moniker", options.moniker);
  if (options?.source) args.push("--source", options.source);
  if (options?.tag) args.push("--tag", options.tag);
  if (options?.command) args.push("--command", options.command);
  if (options?.count !== undefined) args.push("--count", String(options.count));
  if (options?.exact) args.push("--exact");
  if (options?.scope) args.push("--scope", options.scope);
  if (options?.upgradeAvailable) args.push("--upgrade-available");
  if (options?.includeUnknown) args.push("--include-unknown");
  if (options?.includePinned) args.push("--include-pinned");

  if (withJson) args.push("--output", "json");

  return args;
}
