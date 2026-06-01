import type { WingetClient } from "../client.ts";
import { tryParseTable } from "../parsers/table.ts";

export interface PinnedPackage {
  id: string;
  name: string;
  version: string;
  pinType?: string;
}

export async function pinList(client: WingetClient): Promise<PinnedPackage[]> {
  const args = ["pin", "list"];
  const { stdout } = await client.run(args);

  const table = tryParseTable(stdout, ["name", "id", "version", "pinType"]);
  if (table) {
    return table as unknown as PinnedPackage[];
  }

  return [];
}

export async function pinAdd(
  client: WingetClient,
  packageId: string,
  options?: { version?: string; blocking?: boolean; source?: string },
): Promise<void> {
  const args: string[] = ["pin", "add", packageId];

  if (options?.version) args.push("--version", options.version);
  if (options?.blocking) args.push("--blocking");
  if (options?.source) args.push("--source", options.source);

  await client.run(args);
}

export async function pinRemove(client: WingetClient, packageId: string): Promise<void> {
  await client.run(["pin", "remove", packageId]);
}

export async function pinReset(client: WingetClient): Promise<void> {
  await client.run(["pin", "reset"]);
}
