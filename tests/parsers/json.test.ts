import { expect, test } from "vite-plus/test";
import { tryParseJson } from "../../src/parsers/json.ts";

test("parses a flat JSON array and normalizes keys", () => {
  const input = JSON.stringify([
    {
      Id: "Microsoft.VisualStudioCode",
      Name: "Visual Studio Code",
      Version: "1.96.0",
      Source: "winget",
    },
    { Id: "Git.Git", Name: "Git", Version: "2.47.0", Source: "winget" },
  ]);

  const result = tryParseJson(input);
  expect(result).not.toBeNull();
  expect(result).toHaveLength(2);
  expect(result![0]).toEqual({
    id: "Microsoft.VisualStudioCode",
    name: "Visual Studio Code",
    version: "1.96.0",
    source: "winget",
  });
  expect(result![1].id).toBe("Git.Git");
});

test("parses JSON with AvailableVersion", () => {
  const input = JSON.stringify([
    {
      Id: "Microsoft.VisualStudioCode",
      Name: "VS Code",
      Version: "1.90.0",
      AvailableVersion: "1.96.0",
      Source: "winget",
    },
  ]);

  const result = tryParseJson(input);
  expect(result).not.toBeNull();
  expect(result![0].availableVersion).toBe("1.96.0");
});

test("returns null for object not array", () => {
  const input = JSON.stringify({ WinGetVersion: "1.8.0" });
  expect(tryParseJson(input)).toBeNull();
});

test("returns null for invalid JSON", () => {
  expect(tryParseJson("not json")).toBeNull();
});

test("returns null for empty string", () => {
  expect(tryParseJson("")).toBeNull();
});

test("returns null for whitespace-only string", () => {
  expect(tryParseJson("  \n  ")).toBeNull();
});
