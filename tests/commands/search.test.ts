import { expect, test, vi } from "vite-plus/test";
import type { WingetResult } from "../../src/executor.ts";
import type { WingetClient } from "../../src/client.ts";
import { search } from "../../src/commands/search.ts";
import { listInstalled } from "../../src/commands/list.ts";
import { showPackage } from "../../src/commands/show.ts";
import { installPackage } from "../../src/commands/install.ts";
import { uninstallPackage } from "../../src/commands/uninstall.ts";
import { listUpgrades, upgradePackage, upgradeAll } from "../../src/commands/upgrade.ts";

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
  return {
    client,
    lastArgs: () => args,
  };
}

// ── search ──

test("search passes query to winget", async () => {
  const { client, lastArgs } = capturedClient();
  await search(client, "vscode");
  expect(lastArgs()).toContain("--query");
  expect(lastArgs()).toContain("vscode");
});

test("search adds --exact flag", async () => {
  const { client, lastArgs } = capturedClient();
  await search(client, "vscode", { exact: true });
  expect(lastArgs()).toContain("--exact");
});

test("search adds --source", async () => {
  const { client, lastArgs } = capturedClient();
  await search(client, "firefox", { source: "winget" });
  expect(lastArgs()).toContain("--source");
  expect(lastArgs()).toContain("winget");
});

test("search requests JSON output", async () => {
  const { client, lastArgs } = capturedClient();
  await search(client, "test");
  expect(lastArgs()).toContain("--output");
  expect(lastArgs()).toContain("json");
});

test("search parses JSON output", async () => {
  const client = mockClient(
    JSON.stringify([{ Id: "Git.Git", Name: "Git", Version: "2.47.0", Source: "winget" }]),
  );
  const results = await search(client, "git");
  expect(results).toHaveLength(1);
  expect(results[0].id).toBe("Git.Git");
  expect(results[0].name).toBe("Git");
});

test("search falls back to table parsing when JSON fails", async () => {
  const table = [
    "Name              Id                           Version      Source",
    "──────────────────────────────────────────────────────────────────",
    "Git                Git.Git                     2.47.0       winget",
  ].join("\n");
  const client = mockClient(table);
  const results = await search(client, "git");
  expect(results).toHaveLength(1);
  expect(results[0].id).toBe("Git.Git");
});

test("search returns empty array for no results", async () => {
  const client = mockClient("");
  const results = await search(client, "zzzznonexistent");
  expect(results).toEqual([]);
});

// ── list ──

test("list builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await listInstalled(client, undefined, { upgradeAvailable: true });
  expect(lastArgs()).toContain("list");
  expect(lastArgs()).toContain("--upgrade-available");
});

test("list parses JSON output", async () => {
  const client = mockClient(
    JSON.stringify([
      {
        Id: "Git.Git",
        Name: "Git",
        Version: "2.47.0",
        Source: "winget",
        AvailableVersion: "2.48.0",
      },
    ]),
  );
  const results = await listInstalled(client);
  expect(results).toHaveLength(1);
  expect(results[0].availableVersion).toBe("2.48.0");
});

test("list with query", async () => {
  const { client, lastArgs } = capturedClient();
  await listInstalled(client, "code");
  expect(lastArgs()).toContain("--query");
  expect(lastArgs()).toContain("code");
});

// ── show ──

test("show parses key-value output", async () => {
  const output = [
    "Id:           Microsoft.VisualStudioCode",
    "Name:         Visual Studio Code",
    "Version:      1.96.0",
    "Publisher:    Microsoft Corporation",
    "Description:  A rich editor for developers",
    "Homepage:     https://code.visualstudio.com",
    "License:      MIT",
    "Source:       winget",
  ].join("\n");
  const client = mockClient(output);
  const detail = await showPackage(client, "Microsoft.VisualStudioCode");
  expect(detail.id).toBe("Microsoft.VisualStudioCode");
  expect(detail.name).toBe("Visual Studio Code");
  expect(detail.version).toBe("1.96.0");
  expect(detail.publisher).toBe("Microsoft Corporation");
  expect(detail.source).toBe("winget");
});

test("show passes package id to winget", async () => {
  const { client, lastArgs } = capturedClient();
  await showPackage(client, "Foo.Bar");
  expect(lastArgs()[0]).toBe("show");
  expect(lastArgs()[1]).toBe("Foo.Bar");
});

// ── install ──

test("install builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await installPackage(client, "Git.Git", { silent: true, version: "2.47.0" });
  expect(lastArgs()).toContain("install");
  expect(lastArgs()).toContain("Git.Git");
  expect(lastArgs()).toContain("--silent");
  expect(lastArgs()).toContain("--version");
  expect(lastArgs()).toContain("2.47.0");
});

test("install returns success on exit code 0", async () => {
  const client = mockClient("", 0);
  const result = await installPackage(client, "Foo.Bar");
  expect(result.success).toBe(true);
});

// ── uninstall ──

test("uninstall builds correct args", async () => {
  const { client, lastArgs } = capturedClient();
  await uninstallPackage(client, "Git.Git", { force: true });
  expect(lastArgs()).toContain("uninstall");
  expect(lastArgs()).toContain("Git.Git");
  expect(lastArgs()).toContain("--force");
});

test("uninstall returns success on exit code 0", async () => {
  const client = mockClient("", 0);
  const result = await uninstallPackage(client, "Foo.Bar");
  expect(result.success).toBe(true);
});

// ── upgrade ──

test("listUpgrades calls upgrade command", async () => {
  const { client, lastArgs } = capturedClient();
  await listUpgrades(client);
  expect(lastArgs()[0]).toBe("upgrade");
});

test("upgradePackage passes package id", async () => {
  const { client, lastArgs } = capturedClient();
  await upgradePackage(client, "Git.Git");
  expect(lastArgs()).toContain("upgrade");
  expect(lastArgs()).toContain("Git.Git");
});

test("upgradeAll builds --all flag", async () => {
  const { client, lastArgs } = capturedClient();
  await upgradeAll(client);
  expect(lastArgs()).toContain("--all");
});
