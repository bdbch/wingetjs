# Usage Guide

## Table of Contents

- [Client Configuration](#client-configuration)
- [Searching Packages](#searching-packages)
- [Listing Installed Packages](#listing-installed-packages)
- [Viewing Package Details](#viewing-package-details)
- [Installing Packages](#installing-packages)
- [Uninstalling Packages](#uninstalling-packages)
- [Upgrading Packages](#upgrading-packages)
- [Managing Pins](#managing-pins)
- [Managing Sources](#managing-sources)
- [Exporting and Importing](#exporting-and-importing)
- [Downloads and Hashing](#downloads-and-hashing)
- [Validation and Features](#validation-and-features)

---

## Client Configuration

You can use the convenience functions (they use a default client internally):

```ts
import { search } from "@bdbchgg/wingetjs";
const results = await search("vscode");
```

Or create a `WingetClient` for custom options:

```ts
import { WingetClient, search } from "@bdbchgg/wingetjs";

const client = new WingetClient({
  wingetPath: "C:\\tools\\winget.exe", // custom path
  acceptSourceAgreements: true, // auto-accept source licenses
  timeout: 60_000, // 60 second timeout
  verbose: true, // enable winget verbose logging
  disableInteractivity: true, // suppress all prompts
  proxy: "http://proxy:8080", // use a proxy
});
```

Pass the client as the first argument:

```ts
const results = await search(client, "vscode");
```

---

## Searching Packages

```ts
import { search } from "@bdbchgg/wingetjs";

// Basic search (substring match)
const results = await search("vscode");

// Filter by specific fields
const results = await search("vscode", {
  id: "Microsoft.VisualStudioCode",
  exact: true,
  source: "winget",
  count: 10,
});
```

**Options** (`SearchOptions`):

| Option               | CLI flag                | Description                   |
| -------------------- | ----------------------- | ----------------------------- |
| `id`                 | `--id`                  | Filter by package identifier  |
| `name`               | `--name`                | Filter by package name        |
| `moniker`            | `--moniker`             | Filter by moniker             |
| `tag`                | `--tag`                 | Filter by tag                 |
| `command`            | `--command`             | Filter by registered command  |
| `source`             | `--source`              | Restrict to a specific source |
| `count`              | `--count`               | Limit results (1–1000)        |
| `exact`              | `--exact`               | Exact, case-sensitive match   |
| `versions`           | `--versions`            | Show available versions       |
| `authenticationMode` | `--authentication-mode` | Auth window preference        |

**Returns**: `Promise<SearchResult[]>`

```ts
interface SearchResult {
  id: string; // "Microsoft.VisualStudioCode"
  name: string; // "Visual Studio Code"
  version: string; // "1.96.0"
  source: string; // "winget"
  matchType?: string; // "Name" (from JSON output)
}
```

---

## Listing Installed Packages

```ts
import { listInstalled } from "@bdbchgg/wingetjs";

// All installed packages
const installed = await listInstalled();

// Only packages with upgrades available
const upgradable = await listInstalled(undefined, {
  upgradeAvailable: true,
});

// Search within installed packages
const git = await listInstalled("git");
```

**Options** (`ListOptions`):

| Option             | CLI flag              | Description                           |
| ------------------ | --------------------- | ------------------------------------- |
| `id`               | `--id`                | Filter by identifier                  |
| `name`             | `--name`              | Filter by name                        |
| `source`           | `--source`            | Restrict to source                    |
| `count`            | `--count`             | Limit results                         |
| `exact`            | `--exact`             | Exact match                           |
| `scope`            | `--scope`             | `"user"` or `"machine"`               |
| `upgradeAvailable` | `--upgrade-available` | Only upgradable packages              |
| `includeUnknown`   | `--include-unknown`   | Include packages with unknown version |
| `includePinned`    | `--include-pinned`    | Include pinned packages               |

**Returns**: `Promise<InstalledPackage[]>`

```ts
interface InstalledPackage {
  id: string; // "Microsoft.VisualStudioCode"
  name: string; // "Visual Studio Code"
  version: string; // "1.90.0"
  source: string; // "winget"
  availableVersion?: string; // "1.96.0" (present when upgrade exists)
}
```

---

## Viewing Package Details

```ts
import { showPackage } from "@bdbchgg/wingetjs";

const detail = await showPackage("Microsoft.VisualStudioCode");
console.log(detail.publisher); // "Microsoft Corporation"
console.log(detail.description); // "Code editing. Redefined."
console.log(detail.homepage); // "https://code.visualstudio.com/"
```

**Returns**: `Promise<PackageDetail>`

```ts
interface PackageDetail {
  id: string;
  name: string;
  version: string;
  source: string;
  publisher?: string;
  description?: string;
  homepage?: string;
  license?: string;
  licenseUrl?: string;
  installerType?: string;
  installerUrl?: string;
  sha256?: string;
  packageVersion?: string;
  releaseDate?: string;
  tags?: string[];
  commands?: string[];
}
```

---

## Installing Packages

```ts
import { installPackage } from "@bdbchgg/wingetjs";

// Simple install
const result = await installPackage("Microsoft.VisualStudioCode");
console.log(result.success); // true

// Silent install with specific version
const result = await installPackage("Git.Git", {
  version: "2.47.0",
  silent: true,
  acceptPackageAgreements: true,
});

// With installer overrides
const result = await installPackage("MyApp", {
  override: "/S /D=C:\\Programs\\MyApp",
  scope: "machine",
});
```

**Options** (`InstallOptions`):

| Option                    | CLI flag                      | Description                       |
| ------------------------- | ----------------------------- | --------------------------------- |
| `version`                 | `--version`                   | Specific version to install       |
| `source`                  | `--source`                    | Source to install from            |
| `silent`                  | `--silent`                    | Silent installation               |
| `interactive`             | `--interactive`               | Interactive installation          |
| `scope`                   | `--scope`                     | `"user"` or `"machine"`           |
| `architecture`            | `--architecture`              | Target architecture               |
| `locale`                  | `--locale`                    | Installer locale                  |
| `override`                | `--override`                  | Arguments passed to the installer |
| `custom`                  | `--custom`                    | Custom switches                   |
| `force`                   | `--force`                     | Override blocking checks          |
| `acceptPackageAgreements` | `--accept-package-agreements` | Auto-accept license               |
| `authenticationMode`      | `--authentication-mode`       | Auth preference                   |

**Returns**: `Promise<InstallResult>` — `{ packageId: string, success: boolean }`

---

## Uninstalling Packages

```ts
import { uninstallPackage } from "@bdbchgg/wingetjs";

const result = await uninstallPackage("Git.Git", { silent: true });
console.log(result.success);
```

**Options** (`UninstallOptions`):

| Option        | CLI flag        | Description           |
| ------------- | --------------- | --------------------- |
| `silent`      | `--silent`      | Silent uninstall      |
| `interactive` | `--interactive` | Interactive uninstall |
| `force`       | `--force`       | Force uninstall       |

---

## Upgrading Packages

```ts
import { listUpgrades, upgradePackage, upgradeAll } from "@bdbchgg/wingetjs";

// List available upgrades
const available = await listUpgrades();

// Upgrade a specific package
const result = await upgradePackage("Microsoft.VisualStudioCode", { silent: true });

// Upgrade all packages
const results = await upgradeAll();
```

**Returns**: `Promise<InstalledPackage[]>` (list), `Promise<UpgradeResult>` (single), `Promise<UpgradeResult[]>` (all)

---

## Managing Pins

```ts
import { pinList, pinAdd, pinRemove, pinReset } from "@bdbchgg/wingetjs";

// List all pinned packages
const pins = await pinList();

// Pin a package to block upgrades
await pinAdd("Git.Git", { blocking: true });

// Remove a pin
await pinRemove("Git.Git");

// Reset all pins
await pinReset();
```

---

## Managing Sources

```ts
import { sourceList, sourceAdd, sourceRemove, sourceUpdate, sourceReset } from "@bdbchgg/wingetjs";

// List sources
const sources = await sourceList();

// Add a custom source
await sourceAdd("myrepo", {
  type: "Microsoft.Rest",
  argument: "https://example.com/api",
});

// Remove a source
await sourceRemove("myrepo");

// Update sources
await sourceUpdate(); // all sources
await sourceUpdate("winget"); // specific source

// Reset sources to defaults
await sourceReset();
```

---

## Exporting and Importing

```ts
import { exportPackages, importPackages } from "@bdbchgg/wingetjs";

// Export installed packages to a JSON file
await exportPackages("backup.json", {
  source: "winget",
  includeVersions: true,
});

// Import packages from a JSON file
const result = await importPackages("backup.json", {
  ignoreVersions: true,
  acceptPackageAgreements: true,
});
```

---

## Downloads and Hashing

```ts
import { downloadPackage, hashFile } from "@bdbchgg/wingetjs";

// Download an installer (does not install)
const result = await downloadPackage("Git.Git", {
  version: "2.47.0",
  architecture: "x64",
});
console.log(result.filePath); // path to downloaded file

// Hash an installer file
const sha = await hashFile("installer.exe", { algorithm: "sha256" });
```

---

## Validation and Features

```ts
import { validateManifest, listFeatures, openSettings } from "@bdbchgg/wingetjs";

// Validate a manifest file
const valid = await validateManifest("./manifest.yaml");

// List experimental features
const features = await listFeatures();
features.forEach((f) => console.log(f.name, f.enabled));

// Open winget settings UI
await openSettings();
```
