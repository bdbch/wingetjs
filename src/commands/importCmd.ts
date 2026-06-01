import type { WingetClient } from "../client.ts";
import type { ImportOptions } from "../types.ts";

export async function importPackages(
  client: WingetClient,
  inputFile: string,
  options?: ImportOptions,
): Promise<{ success: boolean }> {
  const args: string[] = ["import", "--import-file", inputFile];

  if (options?.ignoreUnavailable) args.push("--ignore-unavailable");
  if (options?.ignoreVersions) args.push("--ignore-versions");
  if (options?.acceptPackageAgreements) args.push("--accept-package-agreements");

  const { exitCode } = await client.run(args);

  return { success: exitCode === 0 };
}
