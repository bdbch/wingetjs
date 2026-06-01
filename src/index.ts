export { WingetClient } from "./client.ts";

export { runWinget } from "./executor.ts";
export type { WingetResult, RunOptions } from "./executor.ts";

export {
  WingetError,
  WingetNotFoundError,
  WingetPlatformError,
  WingetTimeoutError,
  WingetExecutionError,
  WingetParseError,
} from "./errors.ts";

export { tryParseJson, tryParseTable } from "./parsers/index.ts";

export {
  search,
  listInstalled,
  showPackage,
  installPackage,
  uninstallPackage,
  listUpgrades,
  upgradePackage,
  upgradeAll,
  pinList,
  pinAdd,
  pinRemove,
  pinReset,
  sourceList,
  sourceAdd,
  sourceRemove,
  sourceUpdate,
  sourceReset,
  exportPackages,
  importPackages,
  downloadPackage,
  hashFile,
  validateManifest,
  openSettings,
  listFeatures,
} from "./commands/index.ts";

export type { PinnedPackage, Source, DownloadResult, Feature } from "./commands/index.ts";

export type {
  WingetClientOptions,
  Package,
  InstalledPackage,
  SearchResult,
  PackageDetail,
  SearchOptions,
  ListOptions,
  InstallOptions,
  UninstallOptions,
  UpgradeOptions,
  ExportOptions,
  ImportOptions,
  InstallResult,
  UninstallResult,
  UpgradeResult,
} from "./types.ts";
