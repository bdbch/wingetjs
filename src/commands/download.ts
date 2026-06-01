import type { WingetClient } from "../client.ts";

export interface DownloadResult {
  packageId: string;
  success: boolean;
  filePath?: string;
}

export async function downloadPackage(
  client: WingetClient,
  packageId: string,
  options?: { version?: string; source?: string; architecture?: string; locale?: string },
): Promise<DownloadResult> {
  const args: string[] = ["download", packageId];

  if (options?.version) args.push("--version", options.version);
  if (options?.source) args.push("--source", options.source);
  if (options?.architecture) args.push("--architecture", options.architecture);
  if (options?.locale) args.push("--locale", options.locale);

  const { exitCode, stdout } = await client.run(args);

  const filePath = parseDownloadPath(stdout);

  return {
    packageId,
    success: exitCode === 0,
    filePath,
  };
}

function parseDownloadPath(stdout: string): string | undefined {
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.endsWith(".exe") || trimmed.endsWith(".msi") || trimmed.endsWith(".msix")) {
      return trimmed;
    }
  }
  return undefined;
}
