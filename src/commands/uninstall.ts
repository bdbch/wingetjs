import type { WingetClient } from "../client.ts";
import type { UninstallOptions, UninstallResult } from "../types.ts";

export async function uninstallPackage(
  client: WingetClient,
  packageId: string,
  options?: UninstallOptions,
): Promise<UninstallResult> {
  const args: string[] = ["uninstall", packageId];

  if (options?.silent) args.push("--silent");
  if (options?.interactive) args.push("--interactive");
  if (options?.force) args.push("--force");

  const { exitCode } = await client.run(args);

  return {
    packageId,
    success: exitCode === 0,
  };
}
