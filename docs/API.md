# API Reference

## Table of Contents

- [WingetClient](#wingetclient)
- [Convenience Functions](#convenience-functions)
  - [Read Commands](#read-commands)
  - [Write Commands](#write-commands)
  - [Management Commands](#management-commands)
  - [Utility Commands](#utility-commands)
- [Low-Level API](#low-level-api)
- [Parsers](#parsers)
- [Errors](#errors)
- [Type Definitions](#type-definitions)

---

## WingetClient

### Constructor

```ts
new WingetClient(options?: WingetClientOptions)
```

### Methods

```ts
client.run(args: string[]): Promise<WingetResult>
```

Runs a winget command with the given arguments. Global options from the constructor (like `--accept-source-agreements`, `--verbose-logs`) are injected automatically.

### WingetClientOptions

```ts
interface WingetClientOptions {
  wingetPath?: string; // default: "winget" (from PATH)
  acceptSourceAgreements?: boolean;
  timeout?: number; // ms, default: 30000
  locale?: string;
  proxy?: string;
  noProxy?: boolean;
  verbose?: boolean;
  disableInteractivity?: boolean;
  debug?: boolean;
}
```

---

## Convenience Functions

All convenience functions accept an optional `WingetClient` as the first argument. If omitted, a default client is used.

### Read Commands

#### `search`

```ts
function search(
  client?: WingetClient,
  query?: string,
  options?: SearchOptions,
): Promise<SearchResult[]>;
```

Searches for available packages. Tries JSON output first, falls back to table parsing.

#### `listInstalled`

```ts
function listInstalled(
  client?: WingetClient,
  query?: string,
  options?: ListOptions,
): Promise<InstalledPackage[]>;
```

Lists installed packages. Supports filtering and upgrade-available flag.

#### `showPackage`

```ts
function showPackage(
  client?: WingetClient,
  packageId: string,
  options?: { versions?: boolean; source?: string },
): Promise<PackageDetail>;
```

Shows detailed information about a package.

### Write Commands

#### `installPackage`

```ts
function installPackage(
  client?: WingetClient,
  packageId: string,
  options?: InstallOptions,
): Promise<InstallResult>;
```

Installs a package.

#### `uninstallPackage`

```ts
function uninstallPackage(
  client?: WingetClient,
  packageId: string,
  options?: UninstallOptions,
): Promise<UninstallResult>;
```

Uninstalls a package.

#### `upgradePackage`

```ts
function upgradePackage(
  client?: WingetClient,
  packageId: string,
  options?: UpgradeOptions,
): Promise<UpgradeResult>;
```

Upgrades a specific package.

#### `upgradeAll`

```ts
function upgradeAll(client?: WingetClient, options?: { source?: string }): Promise<UpgradeResult[]>;
```

Upgrades all packages with available updates.

#### `listUpgrades`

```ts
function listUpgrades(
  client?: WingetClient,
  options?: { source?: string },
): Promise<InstalledPackage[]>;
```

Lists packages with available upgrades.

### Management Commands

#### `pinList`

```ts
function pinList(client?: WingetClient): Promise<PinnedPackage[]>;
```

#### `pinAdd`

```ts
function pinAdd(
  client?: WingetClient,
  packageId: string,
  options?: { version?: string; blocking?: boolean; source?: string },
): Promise<void>;
```

#### `pinRemove`

```ts
function pinRemove(client?: WingetClient, packageId: string): Promise<void>;
```

#### `pinReset`

```ts
function pinReset(client?: WingetClient): Promise<void>;
```

---

#### `sourceList`

```ts
function sourceList(client?: WingetClient): Promise<Source[]>;
```

#### `sourceAdd`

```ts
function sourceAdd(
  client?: WingetClient,
  name: string,
  options: { type: string; argument: string },
): Promise<void>;
```

#### `sourceRemove`

```ts
function sourceRemove(client?: WingetClient, name: string): Promise<void>;
```

#### `sourceUpdate`

```ts
function sourceUpdate(client?: WingetClient, name?: string): Promise<void>;
```

#### `sourceReset`

```ts
function sourceReset(client?: WingetClient): Promise<void>;
```

---

#### `exportPackages`

```ts
function exportPackages(
  client?: WingetClient,
  outputFile: string,
  options?: ExportOptions,
): Promise<void>;
```

Exports installed packages to a JSON file.

#### `importPackages`

```ts
function importPackages(
  client?: WingetClient,
  inputFile: string,
  options?: ImportOptions,
): Promise<{ success: boolean }>;
```

Imports and installs packages from a JSON file.

### Utility Commands

#### `downloadPackage`

```ts
function downloadPackage(
  client?: WingetClient,
  packageId: string,
  options?: {
    version?: string;
    source?: string;
    architecture?: string;
    locale?: string;
  },
): Promise<DownloadResult>;
```

Downloads the installer without installing.

#### `hashFile`

```ts
function hashFile(
  client?: WingetClient,
  filePath: string,
  options?: { algorithm?: string; msix?: boolean },
): Promise<string>;
```

Generates a SHA256 hash for an installer file.

#### `validateManifest`

```ts
function validateManifest(client?: WingetClient, manifestPath: string): Promise<boolean>;
```

Validates a package manifest file.

#### `openSettings`

```ts
function openSettings(client?: WingetClient): Promise<void>;
```

Opens the winget settings UI.

#### `listFeatures`

```ts
function listFeatures(client?: WingetClient): Promise<Feature[]>;
```

Lists experimental winget features and their status.

---

## Low-Level API

### `runWinget`

```ts
function runWinget(wingetPath: string, args: string[], options?: RunOptions): Promise<WingetResult>;
```

Low-level executor. Wraps `child_process.execFile` with timeout, platform guard, and error mapping. Used internally by `WingetClient`.

---

## Parsers

### `tryParseJson`

```ts
function tryParseJson(input: string): Record<string, unknown>[] | null;
```

Attempts to parse JSON output from winget. Returns `null` if the input is not valid JSON, so callers can fall back to table parsing.

### `tryParseTable`

```ts
function tryParseTable(input: string, knownFields?: string[]): Record<string, unknown>[] | null;
```

Parses winget's column-aligned table output using column positions (locale-independent). Returns `null` if the input doesn't look like a winget table.

---

## Errors

```ts
class WingetError extends Error              // base class

class WingetNotFoundError extends WingetError    // winget not on PATH
class WingetPlatformError extends WingetError     // not running on Windows
class WingetTimeoutError extends WingetError      // command timed out
class WingetExecutionError extends WingetError    // non-zero exit code
class WingetParseError extends WingetError         // failed to parse output
```

### WingetExecutionError

```ts
class WingetExecutionError {
  exitCode: number; // the process exit code
  stderr: string; // standard error output
  command: string; // the full command string
}
```

---

## Type Definitions

### Package

```ts
interface Package {
  id: string; // "Microsoft.VisualStudioCode"
  name: string; // "Visual Studio Code"
  version: string; // "1.96.0"
  source: string; // "winget"
  moniker?: string; // "vscode"
}
```

### SearchResult

```ts
interface SearchResult extends Package {
  matchType?: string;
}
```

### InstalledPackage

```ts
interface InstalledPackage extends Package {
  availableVersion?: string;
}
```

### PackageDetail

```ts
interface PackageDetail extends Package {
  publisher?: string;
  description?: string;
  homepage?: string;
  license?: string;
  licenseUrl?: string;
  installerType?: string; // "MSI", "EXE", "Portable", etc.
  installerUrl?: string;
  sha256?: string;
  packageVersion?: string;
  releaseDate?: string;
  tags?: string[];
  commands?: string[];
}
```

### Option Interfaces

```ts
interface SearchOptions {
  id?: string;
  name?: string;
  moniker?: string;
  tag?: string;
  command?: string;
  source?: string;
  count?: number;
  exact?: boolean;
  versions?: boolean;
  authenticationMode?: "silent" | "silentPreferred" | "interactive";
  authenticationAccount?: string;
}

interface ListOptions {
  id?: string;
  name?: string;
  moniker?: string;
  source?: string;
  tag?: string;
  command?: string;
  count?: number;
  exact?: boolean;
  scope?: "user" | "machine";
  upgradeAvailable?: boolean;
  includeUnknown?: boolean;
  includePinned?: boolean;
}

interface InstallOptions {
  version?: string;
  source?: string;
  silent?: boolean;
  interactive?: boolean;
  scope?: "user" | "machine";
  architecture?: string;
  locale?: string;
  override?: string;
  custom?: string[];
  force?: boolean;
  acceptPackageAgreements?: boolean;
  authenticationMode?: "silent" | "silentPreferred" | "interactive";
  authenticationAccount?: string;
}

interface UninstallOptions {
  silent?: boolean;
  interactive?: boolean;
  force?: boolean;
}

interface UpgradeOptions extends InstallOptions {}
```

### Result Interfaces

```ts
interface InstallResult {
  packageId: string;
  success: boolean;
}

interface UninstallResult {
  packageId: string;
  success: boolean;
}

interface UpgradeResult {
  packageId: string;
  version: string;
  success: boolean;
}
```

### Other Interfaces

```ts
interface WingetClientOptions {
  /* see above */
}
interface WingetResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
interface RunOptions {
  timeout?: number;
}

interface PinnedPackage {
  id: string;
  name: string;
  version: string;
  pinType?: string;
}

interface Source {
  name: string;
  argument: string;
  type: string;
}

interface DownloadResult {
  packageId: string;
  success: boolean;
  filePath?: string;
}

interface Feature {
  name: string;
  enabled: boolean;
}
```
