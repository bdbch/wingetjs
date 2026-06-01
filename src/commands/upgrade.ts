import type { WingetClient } from "../client.ts";
import type { InstalledPackage, UpgradeOptions, UpgradeResult } from "../types.ts";
import { tryParseJson } from "../parsers/json.ts";
import { tryParseTable } from "../parsers/table.ts";

export async function listUpgrades(
  client: WingetClient,
  options?: { source?: string },
): Promise<InstalledPackage[]> {
  const args: string[] = ["upgrade"];

  if (options?.source) args.push("--source", options.source);
  args.push("--output", "json");

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

export async function upgradePackage(
  client: WingetClient,
  packageId: string,
  options?: UpgradeOptions,
): Promise<UpgradeResult> {
  const args = buildUpgradeArgs(packageId, options);
  const { exitCode } = await client.run(args);

  return {
    packageId,
    version: options?.version ?? "",
    success: exitCode === 0,
  };
}

export async function upgradeAll(
  client: WingetClient,
  options?: { source?: string },
): Promise<UpgradeResult[]> {
  const args: string[] = ["upgrade", "--all"];

  if (options?.source) args.push("--source", options.source);

  const { exitCode, stdout } = await client.run(args);

  if (exitCode !== 0) return [];

  const table = tryParseTable(stdout, ["name", "id", "version", "availableVersion", "source"]);
  if (!table) return [];

  return table.map((row) => {
    const id = typeof row.id === "string" ? row.id : "";
    const version =
      typeof row.availableVersion === "string"
        ? row.availableVersion
        : typeof row.version === "string"
          ? row.version
          : "";
    return {
      packageId: id,
      version,
      success: true,
    };
  });
}

function buildUpgradeArgs(packageId: string, options?: UpgradeOptions): string[] {
  const args: string[] = ["upgrade", packageId];

  if (options?.version) args.push("--version", options.version);
  if (options?.source) args.push("--source", options.source);
  if (options?.silent) args.push("--silent");
  if (options?.interactive) args.push("--interactive");
  if (options?.scope) args.push("--scope", options.scope);
  if (options?.architecture) args.push("--architecture", options.architecture);
  if (options?.locale) args.push("--locale", options.locale);
  if (options?.override) args.push("--override", options.override);
  if (options?.force) args.push("--force");
  if (options?.acceptPackageAgreements) args.push("--accept-package-agreements");

  return args;
}
