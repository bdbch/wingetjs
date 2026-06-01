import type { WingetClient } from "../client.ts";
import { tryParseTable } from "../parsers/table.ts";

export interface Source {
  name: string;
  argument: string;
  type: string;
}

export async function sourceList(client: WingetClient): Promise<Source[]> {
  const { stdout } = await client.run(["source", "list"]);

  const table = tryParseTable(stdout, ["name", "argument", "type"]);
  if (table) {
    return table as unknown as Source[];
  }

  return [];
}

export async function sourceAdd(
  client: WingetClient,
  name: string,
  options: { type: string; argument: string },
): Promise<void> {
  await client.run(["source", "add", name, "--type", options.type, "--arg", options.argument]);
}

export async function sourceRemove(client: WingetClient, name: string): Promise<void> {
  await client.run(["source", "remove", name]);
}

export async function sourceUpdate(client: WingetClient, name?: string): Promise<void> {
  const args: string[] = ["source", "update"];
  if (name) args.push(name);
  await client.run(args);
}

export async function sourceReset(client: WingetClient): Promise<void> {
  await client.run(["source", "reset"]);
}
