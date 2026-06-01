import type { WingetClient } from "../client.ts";
import { tryParseTable } from "../parsers/table.ts";

export interface Feature {
  name: string;
  enabled: boolean;
}

export async function listFeatures(client: WingetClient): Promise<Feature[]> {
  const { stdout } = await client.run(["features"]);

  const table = tryParseTable(stdout, ["name", "enabled"]);
  if (table) {
    return table.map((row) => {
      const name = typeof row.name === "string" ? row.name : "";
      const enabledStr = typeof row.enabled === "string" ? row.enabled : "";
      return {
        name,
        enabled: enabledStr.toLowerCase() === "true" || enabledStr.toLowerCase() === "yes",
      };
    });
  }

  return [];
}
