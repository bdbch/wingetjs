/**
 * Base error for all winget-related issues.
 * All other winget error classes extend this one.
 */
export class WingetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WingetError";
  }
}

/**
 * Thrown when the winget executable cannot be found at the configured path.
 * Typically means winget is not installed or not on the system PATH.
 */
export class WingetNotFoundError extends WingetError {
  constructor(path: string) {
    super(`winget not found at "${path}". Make sure winget is installed on your system.`);
    this.name = "WingetNotFoundError";
  }
}

/**
 * Thrown when the library is used on a non-Windows platform.
 * winget is only available on Windows 10 1809+ and Windows 11.
 */
export class WingetPlatformError extends WingetError {
  constructor() {
    super(
      "winget is only available on Windows (win32). This library cannot be used on this platform.",
    );
    this.name = "WingetPlatformError";
  }
}

/**
 * Thrown when a winget command exceeds the configured timeout.
 */
export class WingetTimeoutError extends WingetError {
  constructor(command: string, timeout: number) {
    super(`winget command "${command}" timed out after ${timeout}ms.`);
    this.name = "WingetTimeoutError";
  }
}

export class WingetParseError extends WingetError {
  constructor(input: string, originalError: Error) {
    super(`Failed to parse winget output: ${originalError.message}. Input was: ${input}`);
    this.name = "WingetParseError";
  }
}

/**
 * Thrown when a winget command completes with a non-zero exit code.
 * Contains the exit code, stderr output, and the command that was run.
 */
export class WingetExecutionError extends WingetError {
  /** The numeric exit code returned by winget. */
  exitCode: number;

  /** The standard error output from the winget command. */
  stderr: string;

  /** The full command string that was executed. */
  command: string;

  constructor(command: string, exitCode: number, stderr: string) {
    super(`winget command "${command}" failed with exit code ${exitCode}: ${stderr}`);
    this.name = "WingetExecutionError";
    this.exitCode = exitCode;
    this.stderr = stderr;
    this.command = command;
  }
}
