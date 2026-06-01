# wingetjs

A zero-dependency TypeScript library that wraps the **winget** CLI (Windows Package Manager). Search, install, list, upgrade, and manage Windows packages programmatically from Node.js.

```ts
import { search, installPackage } from "@bdbchgg/wingetjs";

const results = await search("vscode");
// [{ id: "Microsoft.VisualStudioCode", name: "Visual Studio Code", version: "1.96.0", source: "winget" }]

await installPackage("Microsoft.VisualStudioCode", { silent: true });
```

## Features

- **14 commands** covering the full winget CLI surface
- **JSON-first parsing** with automatic fallback to table parsing for older winget versions
- **Fully typed** — everything is TypeScript, zero `any`
- **Zero dependencies** — only uses Node.js built-in `child_process`
- **Async only** — all operations return promises
- **Windows-only** — throws a clear `WingetPlatformError` on other platforms

## Installation

```bash
npm install @bdbchgg/wingetjs
# or
pnpm add @bdbchgg/wingetjs
```

## Quick Start

```ts
import { WingetClient, search, listInstalled } from "wingetjs";

// Use the convenience functions (default client)
const apps = await search("firefox");
console.log(apps);

// Or create a client with custom options
const client = new WingetClient({ acceptSourceAgreements: true, verbose: true });
const installed = await listInstalled(client);
```

## Documentation

| Document               | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| [USAGE.md](./USAGE.md) | Detailed usage guide with examples for every command |
| [API.md](./API.md)     | Full API reference — types, functions, and options   |

## Requirements

- Node.js 20+
- Windows 10 1809+ or Windows 11 (winget must be installed)
- winget available on the system PATH (default installation)

## License

MIT
