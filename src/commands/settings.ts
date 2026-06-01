import type { WingetClient } from "../client.ts";

export async function openSettings(client: WingetClient): Promise<void> {
  await client.run(["settings"]);
}
