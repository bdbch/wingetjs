import type { WingetClient } from "../client.ts";
import type { InstallOptions, InstallResult } from "../types.ts";

export async function installPackage(
  client: WingetClient,
  packageId: string,
  options?: InstallOptions,
): Promise<InstallResult> {
  const args = buildInstallArgs(packageId, options);
  const { exitCode } = await client.run(args);

  return {
    packageId,
    success: exitCode === 0,
  };
}

function buildInstallArgs(packageId: string, options?: InstallOptions): string[] {
  const args: string[] = ["install", packageId];

  if (options?.version) args.push("--version", options.version);
  if (options?.source) args.push("--source", options.source);
  if (options?.silent) args.push("--silent");
  if (options?.interactive) args.push("--interactive");
  if (options?.scope) args.push("--scope", options.scope);
  if (options?.architecture) args.push("--architecture", options.architecture);
  if (options?.locale) args.push("--locale", options.locale);
  if (options?.override) args.push("--override", options.override);
  if (options?.custom?.length) args.push("--custom", options.custom.join(" "));
  if (options?.force) args.push("--force");
  if (options?.acceptPackageAgreements) args.push("--accept-package-agreements");
  if (options?.authenticationMode) args.push("--authentication-mode", options.authenticationMode);
  if (options?.authenticationAccount)
    args.push("--authentication-account", options.authenticationAccount);

  return args;
}
