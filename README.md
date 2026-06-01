# wingetjs

A zero-dependency TypeScript library for the Windows Package Manager (winget) CLI.

```ts
import { search, installPackage } from "@bdbchgg/wingetjs";

const results = await search("vscode");
await installPackage("Microsoft.VisualStudioCode", { silent: true });
```

## Docs

- [docs/README.md](./docs/README.md) — Overview, installation, quick start
- [docs/USAGE.md](./docs/USAGE.md) — Detailed usage guide with examples
- [docs/API.md](./docs/API.md) — Full API reference

## Development

```bash
vp install       # install dependencies
vp check         # type-check + lint + format
vp test          # run tests
vp pack          # build the package
```

## Requirements

- Node.js 20+
- Windows 10 1809+ / Windows 11 (with winget)
