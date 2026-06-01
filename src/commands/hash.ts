import type { WingetClient } from "../client.ts";

export async function hashFile(
  client: WingetClient,
  filePath: string,
  options?: { algorithm?: string; msix?: boolean },
): Promise<string> {
  const args: string[] = ["hash", filePath];

  if (options?.algorithm) args.push("--algorithm", options.algorithm);
  if (options?.msix) args.push("--msix");

  const { stdout } = await client.run(args);

  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
      return trimmed;
    }
  }

  return stdout.trim();
}
