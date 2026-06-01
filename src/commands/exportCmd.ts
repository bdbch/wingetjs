import type { WingetClient } from "../client.ts";
import type { ExportOptions } from "../types.ts";

export async function exportPackages(
  client: WingetClient,
  outputFile: string,
  options?: ExportOptions,
): Promise<void> {
  const args: string[] = ["export", "--output", outputFile];

  if (options?.source) args.push("--source", options.source);
  if (options?.includeVersions) args.push("--include-versions");

  await client.run(args);
}
