/**
 * Configuration options for the WingetClient.
 * All properties are optional — defaults are sensible for most use cases.
 */
export interface WingetClientOptions {
  wingetPath?: string;
  acceptSourceAgreements?: boolean;
  timeout?: number;
  locale?: string;
  proxy?: string;
  noProxy?: boolean;
  verbose?: boolean;
  disableInteractivity?: boolean;
  debug?: boolean;
}

/**
 * A package returned by winget commands.
 * Represents a package with its identifier, display name, version, and source.
 */
export interface Package {
  /** The PackageIdentifier (publisher.product), e.g. "Microsoft.VisualStudioCode". This is NOT the moniker/short alias. */
  id: string;

  /** The moniker (short alias) of the package, e.g. "vscode". Not all packages have one. */
  moniker?: string;

  /** The display name of the package, e.g. "Visual Studio Code". */
  name: string;

  /** The version string of the package, e.g. "1.96.0". */
  version: string;

  /** The source the package belongs to, e.g. "winget" or "msstore". */
  source: string;
}

/**
 * A package installed on the system.
 * Extends Package with an optional available version for upgrades.
 */
export interface InstalledPackage extends Package {
  /** The latest available version if an upgrade exists, e.g. "1.96.0". */
  availableVersion?: string;
}

/**
 * A result from the winget search command.
 */
export interface SearchResult extends Package {
  /** How the package matched the query, e.g. "Name", "Id", "Moniker" (from JSON output). */
  matchType?: string;
}

/**
 * Detailed information about a package from the winget show command.
 */
export interface PackageDetail extends Package {
  /** The publisher of the package. */
  publisher?: string;
  /** A human-readable description of what the package does. */
  description?: string;
  /** URL to the package's homepage. */
  homepage?: string;
  /** The license type, e.g. "MIT". */
  license?: string;
  /** URL to the license text. */
  licenseUrl?: string;
  /** The installer type, e.g. "MSI", "EXE", "Portable". */
  installerType?: string;
  /** URL to download the installer. */
  installerUrl?: string;
  /** SHA256 hash of the installer file. */
  sha256?: string;
  /** The version string from the package manifest. */
  packageVersion?: string;
  /** Release date of this package version. */
  releaseDate?: string;
  /** Tags associated with the package. */
  tags?: string[];
  /** Commands registered by this package. */
  commands?: string[];
}

/**
 * Options for the winget search command.
 */
export interface SearchOptions {
  /** Filter results by package identifier. */
  id?: string;
  /** Filter results by package name. */
  name?: string;
  /** Filter results by package moniker. */
  moniker?: string;
  /** Filter results by package tag. */
  tag?: string;
  /** Filter results by command registered by the package. */
  command?: string;
  /** Restrict search to a specific source name. */
  source?: string;
  /** Maximum number of results to return (1–1000). */
  count?: number;
  /** Require exact, case-sensitive match instead of substring. */
  exact?: boolean;
  /** Show available versions of the package. */
  versions?: boolean;
  /** Authentication window preference for REST sources. */
  authenticationMode?: "silent" | "silentPreferred" | "interactive";
  /** Account to use for authentication. */
  authenticationAccount?: string;
}

/**
 * Options for the winget list command.
 */
export interface ListOptions {
  /** Filter by package identifier. */
  id?: string;
  /** Filter by package name. */
  name?: string;
  /** Filter by package moniker. */
  moniker?: string;
  /** Restrict to a specific source. */
  source?: string;
  /** Filter by package tags. */
  tag?: string;
  /** Filter by command registered by the package. */
  command?: string;
  /** Maximum number of results to return. */
  count?: number;
  /** Require exact, case-sensitive match. */
  exact?: boolean;
  /** Filter by installation scope. */
  scope?: "user" | "machine";
  /** Only show packages with available upgrades. */
  upgradeAvailable?: boolean;
  /** Include packages whose version cannot be determined. */
  includeUnknown?: boolean;
  /** Include packages that are pinned. */
  includePinned?: boolean;
}

/**
 * Options for the winget install command.
 */
export interface InstallOptions {
  /** Specific version to install. */
  version?: string;
  /** Source to install from. */
  source?: string;
  /** Run the installer silently (no UI). */
  silent?: boolean;
  /** Run the installer in interactive mode. */
  interactive?: boolean;
  /** Installation scope. */
  scope?: "user" | "machine";
  /** Target architecture for the installer. */
  architecture?: string;
  /** Locale for the installer. */
  locale?: string;
  /** Additional arguments passed directly to the installer. */
  override?: string;
  /** Custom arguments appended to the installer command. */
  custom?: string[];
  /** Override checks that block installation (e.g. hash mismatch). */
  force?: boolean;
  /** Accept all package license agreements. */
  acceptPackageAgreements?: boolean;
  /** Authentication window preference for REST sources. */
  authenticationMode?: "silent" | "silentPreferred" | "interactive";
  /** Account to use for authentication. */
  authenticationAccount?: string;
}

/**
 * Options for the winget uninstall command.
 */
export interface UninstallOptions {
  /** Run the uninstaller silently. */
  silent?: boolean;
  /** Run the uninstaller in interactive mode. */
  interactive?: boolean;
  /** Force uninstall even if there are issues. */
  force?: boolean;
}

/**
 * Options for the winget upgrade command. Shares the same shape as InstallOptions.
 */
export interface UpgradeOptions extends InstallOptions {}

/**
 * Options for the winget export command.
 */
export interface ExportOptions {
  /** Only export packages from the specified source. */
  source?: string;
  /** Include version information in the export. */
  includeVersions?: boolean;
}

/** Result returned by installing a package. */
export interface InstallResult {
  packageId: string;
  success: boolean;
}

/** Result returned by uninstalling a package. */
export interface UninstallResult {
  packageId: string;
  success: boolean;
}

/** Result returned by upgrading a package. */
export interface UpgradeResult {
  packageId: string;
  version: string;
  success: boolean;
}

/**
 * Options for the winget import command.
 */
export interface ImportOptions {
  /** Ignore packages that are not available. */
  ignoreUnavailable?: boolean;
  /** Ignore version constraints during import. */
  ignoreVersions?: boolean;
  /** Accept all package license agreements. */
  acceptPackageAgreements?: boolean;
}
