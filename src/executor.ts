import { execFile } from "node:child_process";
import { platform } from "node:os";
import {
  WingetNotFoundError,
  WingetPlatformError,
  WingetTimeoutError,
  WingetExecutionError,
} from "./errors.ts";

export interface WingetResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface RunOptions {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30_000;

function buildCommandString(wingetPath: string, args: string[]): string {
  return `${wingetPath} ${args.join(" ")}`;
}

export function runWinget(
  wingetPath: string,
  args: string[],
  options?: RunOptions,
): Promise<WingetResult> {
  if (platform() !== "win32") {
    throw new WingetPlatformError();
  }

  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const commandStr = buildCommandString(wingetPath, args);

  return new Promise<WingetResult>((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    execFile(
      wingetPath,
      args,
      { signal: controller.signal, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        clearTimeout(timer);

        if (error) {
          if (error.name === "AbortError") {
            reject(new WingetTimeoutError(commandStr, timeout));
            return;
          }

          const nodeError = error as NodeJS.ErrnoException;
          if (nodeError.code === "ENOENT") {
            reject(new WingetNotFoundError(wingetPath));
            return;
          }

          const exitCode = typeof nodeError.code === "number" ? nodeError.code : 1;
          reject(new WingetExecutionError(commandStr, exitCode, stderr));
          return;
        }

        resolve({ stdout, stderr, exitCode: 0 });
      },
    );
  });
}
