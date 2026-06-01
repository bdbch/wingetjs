import type { WingetClient } from "../client.ts";

export async function validateManifest(
  client: WingetClient,
  manifestPath: string,
): Promise<boolean> {
  try {
    const { exitCode } = await client.run(["validate", manifestPath]);
    return exitCode === 0;
  } catch {
    return false;
  }
}
