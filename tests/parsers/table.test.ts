import { expect, test } from "vite-plus/test";
import { tryParseTable } from "../../src/parsers/table.ts";

const searchTable = `Name              Id                           Version      Source
──────────────────────────────────────────────────────────────────
Visual Studio Code Microsoft.VisualStudioCode  1.96.0       winget
Git                Git.Git                     2.47.0       winget`;

const listTable = `Name              Id                           Version      Available   Source
─────────────────────────────────────────────────────────────────────────────
7-Zip             7zip.7zip                    23.01        24.09       winget
Git                Git.Git                     2.47.0                   winget`;

test("parses search table (4 columns)", () => {
  const result = tryParseTable(searchTable);
  expect(result).not.toBeNull();
  expect(result).toHaveLength(2);
  expect(result![0]).toEqual({
    name: "Visual Studio Code",
    id: "Microsoft.VisualStudioCode",
    version: "1.96.0",
    source: "winget",
  });
  expect(result![1].id).toBe("Git.Git");
});

test("parses list table with Available column (5 columns)", () => {
  const result = tryParseTable(listTable);
  expect(result).not.toBeNull();
  expect(result).toHaveLength(2);
  expect(result![0]).toEqual({
    name: "7-Zip",
    id: "7zip.7zip",
    version: "23.01",
    availableVersion: "24.09",
    source: "winget",
  });
});

test("leaves availableVersion empty when not present", () => {
  const result = tryParseTable(listTable);
  expect(result![1].availableVersion).toBeUndefined();
});

test("returns null for fewer than 3 lines", () => {
  expect(tryParseTable("one line")).toBeNull();
});

test("returns null for lines without separator", () => {
  expect(tryParseTable("a b c\nd e f")).toBeNull();
});

test("uses knownFields override when provided", () => {
  const result = tryParseTable(searchTable, ["name", "id", "version", "source"]);
  expect(result).not.toBeNull();
  expect(result![0].name).toBe("Visual Studio Code");
});

test("returns null for empty input", () => {
  expect(tryParseTable("")).toBeNull();
});
