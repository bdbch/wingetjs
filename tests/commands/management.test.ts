import { expect, test, vi } from "vite-plus/test";
import type { WingetResult } from "../../src/executor.ts";
import type { WingetClient } from "../../src/client.ts";

function mockClient(stdout: string, exitCode = 0): WingetClient {
  return {
    run: vi.fn(() => Promise.resolve({ stdout, stderr: "", exitCode } as WingetResult)),
  } as unknown as WingetClient;
}

function capturedClient(): { client: WingetClient; lastArgs: () => string[] } {
  let args: string[] = [];
  const client = {
    run: vi.fn((a: string[]) => {
      args = a;
      return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 } as WingetResult);
    }),
  } as unknown as WingetClient;
  return { client, lastArgs: () => args };
}

// ── pin ──

import { pinList, pinAdd, pinRemove, pinReset } from "../../src/commands/pin.ts";

test("pinList parses table output", async () => {
  const table = [
    "Name       Id                           Version      Pin Type",
    "--------------------------------------------------------------",
    "Git        Git.Git                      *            Blocking",
  ].join("\n");
  const client = mockClient(table);
  const result = await pinList(client);
  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("Git.Git");
});

test("pinList returns empty array for no pins", async () => {
  const client = mockClient("");
  const result = await pinList(client);
  expect(result).toEqual([]);
});

test("pinAdd builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await pinAdd(client, "Git.Git", { blocking: true });
  expect(lastArgs()[0]).toBe("pin");
  expect(lastArgs()[1]).toBe("add");
  expect(lastArgs()[2]).toBe("Git.Git");
  expect(lastArgs()).toContain("--blocking");
});

test("pinRemove builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await pinRemove(client, "Git.Git");
  expect(lastArgs()).toContain("pin");
  expect(lastArgs()).toContain("remove");
  expect(lastArgs()).toContain("Git.Git");
});

test("pinReset builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await pinReset(client);
  expect(lastArgs()).toEqual(["pin", "reset"]);
});

// ── source ──

import {
  sourceList,
  sourceAdd,
  sourceRemove,
  sourceUpdate,
  sourceReset,
} from "../../src/commands/source.ts";

test("sourceList parses table output", async () => {
  const table = [
    "Name       Argument                                    Type",
    "────────────────────────────────────────────────────────────",
    "winget     https://cdn.winget.microsoft.com/cache      Microsoft.Rest",
  ].join("\n");
  const client = mockClient(table);
  const result = await sourceList(client);
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("winget");
});

test("sourceList returns empty array on no output", async () => {
  const client = mockClient("");
  const result = await sourceList(client);
  expect(result).toEqual([]);
});

test("sourceAdd builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await sourceAdd(client, "myrepo", { type: "Microsoft.Rest", argument: "https://example.com" });
  expect(lastArgs()).toContain("source");
  expect(lastArgs()).toContain("add");
  expect(lastArgs()).toContain("myrepo");
  expect(lastArgs()).toContain("--type");
  expect(lastArgs()).toContain("Microsoft.Rest");
  expect(lastArgs()).toContain("--arg");
  expect(lastArgs()).toContain("https://example.com");
});

test("sourceRemove builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await sourceRemove(client, "myrepo");
  expect(lastArgs()).toContain("remove");
  expect(lastArgs()).toContain("myrepo");
});

test("sourceUpdate without name builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await sourceUpdate(client);
  expect(lastArgs()).toEqual(["source", "update"]);
});

test("sourceUpdate with name builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await sourceUpdate(client, "winget");
  expect(lastArgs()).toEqual(["source", "update", "winget"]);
});

test("sourceReset builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await sourceReset(client);
  expect(lastArgs()).toEqual(["source", "reset"]);
});

// ── export ──

import { exportPackages } from "../../src/commands/exportCmd.ts";

test("exportPackages builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await exportPackages(client, "backup.json", { source: "winget", includeVersions: true });
  expect(lastArgs()).toContain("export");
  expect(lastArgs()).toContain("--output");
  expect(lastArgs()).toContain("backup.json");
  expect(lastArgs()).toContain("--source");
  expect(lastArgs()).toContain("winget");
  expect(lastArgs()).toContain("--include-versions");
});

test("exportPackages without options works", async () => {
  const { client, lastArgs } = capturedClient();
  await exportPackages(client, "out.json");
  expect(lastArgs()).toContain("export");
  expect(lastArgs()).toContain("--output");
  expect(lastArgs()).toContain("out.json");
});

// ── import ──

import { importPackages } from "../../src/commands/importCmd.ts";

test("importPackages builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await importPackages(client, "backup.json", {
    ignoreVersions: true,
    acceptPackageAgreements: true,
  });
  expect(lastArgs()).toContain("import");
  expect(lastArgs()).toContain("--import-file");
  expect(lastArgs()).toContain("backup.json");
  expect(lastArgs()).toContain("--ignore-versions");
  expect(lastArgs()).toContain("--accept-package-agreements");
});

test("importPackages returns success on exit code 0", async () => {
  const client = mockClient("", 0);
  const result = await importPackages(client, "backup.json");
  expect(result.success).toBe(true);
});

// ── download ──

import { downloadPackage } from "../../src/commands/download.ts";

test("downloadPackage builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await downloadPackage(client, "Git.Git", { version: "2.47.0" });
  expect(lastArgs()).toContain("download");
  expect(lastArgs()).toContain("Git.Git");
  expect(lastArgs()).toContain("--version");
  expect(lastArgs()).toContain("2.47.0");
});

test("downloadPackage parses file path from output", async () => {
  const output = "Downloading...\nC:\\Users\\me\\Downloads\\Git-2.47.0-64-bit.exe\nSuccess";
  const client = mockClient(output, 0);
  const result = await downloadPackage(client, "Git.Git");
  expect(result.success).toBe(true);
  expect(result.filePath).toMatch(/\.exe$/);
});

// ── hash ──

import { hashFile } from "../../src/commands/hash.ts";

test("hashFile builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await hashFile(client, "installer.exe", { algorithm: "sha256" });
  expect(lastArgs()).toContain("hash");
  expect(lastArgs()).toContain("installer.exe");
  expect(lastArgs()).toContain("--algorithm");
  expect(lastArgs()).toContain("sha256");
});

test("hashFile extracts sha256 from output", async () => {
  const sha = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b";
  const client = mockClient(`${sha}\n`);
  const result = await hashFile(client, "installer.exe");
  expect(result).toBe(sha);
});

test("hashFile falls back to trimmed output", async () => {
  const client = mockClient("abc123\n");
  const result = await hashFile(client, "file.bin");
  expect(result).toBe("abc123");
});

// ── validate ──

import { validateManifest } from "../../src/commands/validate.ts";

test("validateManifest passes correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await validateManifest(client, "./manifest.yaml");
  expect(lastArgs()).toEqual(["validate", "./manifest.yaml"]);
});

test("validateManifest returns true on exit 0", async () => {
  const client = mockClient("", 0);
  const result = await validateManifest(client, "./manifest.yaml");
  expect(result).toBe(true);
});

test("validateManifest returns false on error", async () => {
  const client = {
    run: vi.fn(() => Promise.reject(new Error("validation failed"))),
  } as unknown as WingetClient;
  const result = await validateManifest(client, "./manifest.yaml");
  expect(result).toBe(false);
});

// ── settings ──

import { openSettings } from "../../src/commands/settings.ts";

test("openSettings calls settings command", async () => {
  const { client, lastArgs } = capturedClient();
  await openSettings(client);
  expect(lastArgs()).toEqual(["settings"]);
});

// ── features ──

import { listFeatures } from "../../src/commands/features.ts";

test("listFeatures parses table output", async () => {
  const table = [
    "Name                    Enabled",
    "--------------------------------",
    "experimentalFeature     True",
    "otherFeature            False",
  ].join("\n");
  const client = mockClient(table);
  const result = await listFeatures(client);
  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("experimentalFeature");
  expect(result[0].enabled).toBe(true);
  expect(result[1].name).toBe("otherFeature");
  expect(result[1].enabled).toBe(false);
});

test("listFeatures returns empty array on no output", async () => {
  const client = mockClient("");
  const result = await listFeatures(client);
  expect(result).toEqual([]);
});
