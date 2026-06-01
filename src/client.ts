import { runWinget, type WingetResult } from "./executor.ts";
import type { WingetClientOptions } from "./types.ts";

/**
 * Client for executing winget commands.
 *
 * Wraps configuration and delegates to the executor, injecting global options
 * (like --accept-source-agreements, --verbose-logs) into every command.
 *
 * @example
 * ```ts
 * const client = new WingetClient({ acceptSourceAgreements: true })
 * const result = await client.run(["search", "--query", "vscode"])
 * ```
 */
export class WingetClient {
  private options: WingetClientOptions;

  /**
   * @param options - Configuration defaults applied to every winget command.
   */
  constructor(options?: WingetClientOptions) {
    this.options = options ?? {};
  }

  /**
   * Run a winget command with the given arguments.
   *
   * @param args - The command and its arguments, e.g. `["search", "--query", "vscode"]`.
   * @returns The raw stdout, stderr, and exit code from winget.
   */
  async run(args: string[]): Promise<WingetResult> {
    const wingetPath = this.options.wingetPath ?? "winget";
    const fullArgs = this.buildArgs(args);
    return runWinget(wingetPath, fullArgs, { timeout: this.options.timeout });
  }

  private buildArgs(args: string[]): string[] {
    const globalArgs: string[] = [];
    const opts = this.options;

    if (opts.acceptSourceAgreements) {
      globalArgs.push("--accept-source-agreements");
    }
    if (opts.proxy) {
      globalArgs.push("--proxy", opts.proxy);
    }
    if (opts.noProxy) {
      globalArgs.push("--no-proxy");
    }
    if (opts.verbose) {
      globalArgs.push("--verbose-logs");
    }
    if (opts.disableInteractivity) {
      globalArgs.push("--disable-interactivity");
    }

    return [...globalArgs, ...args];
  }
}
