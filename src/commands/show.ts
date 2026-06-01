import type { WingetClient } from "../client.ts";
import type { PackageDetail } from "../types.ts";

export async function showPackage(
  client: WingetClient,
  packageId: string,
  options?: { versions?: boolean; source?: string },
): Promise<PackageDetail> {
  const args: string[] = ["show", packageId];

  if (options?.versions) args.push("--versions");
  if (options?.source) args.push("--source", options.source);

  const { stdout } = await client.run(args);
  return parseShowOutput(stdout);
}

function parseShowOutput(output: string): PackageDetail {
  const lines = output.split("\n");
  const detail: Record<string, string> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key && value) {
      detail[key] = value;
    }
  }

  return {
    id: detail["Id"] ?? detail["Package Identifier"] ?? "",
    name: detail["Name"] ?? "",
    version: detail["Version"] ?? "",
    source: detail["Source"] ?? "",
    publisher: detail["Publisher"],
    description: detail["Description"],
    homepage: detail["Homepage"],
    license: detail["License"],
    licenseUrl: detail["License Url"],
    installerType: detail["Installer Type"],
    installerUrl: detail["Installer Url"] ?? detail["Installer URL"],
    sha256: detail["SHA256"],
    packageVersion: detail["Package Version"],
    releaseDate: detail["Release Date"],
    tags: detail["Tags"]
      ?.split(";")
      .map((t) => t.trim())
      .filter(Boolean),
    commands: detail["Commands"]
      ?.split(";")
      .map((c) => c.trim())
      .filter(Boolean),
  };
}
