# @keshavsoft/git-sibling-cloner

<p align="center">
  <strong>Fast, fail-safe shallow-cloning of Git repositories side-by-side as siblings from any Source of Truth manifest.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@keshavsoft/git-sibling-cloner"><img src="https://img.shields.io/npm/v/@keshavsoft/git-sibling-cloner.svg?style=flat-square&color=cb3837" alt="npm version" /></a>
  <a href="https://github.com/keshavsoft/git-sibling-cloner"><img src="https://img.shields.io/github/stars/keshavsoft/git-sibling-cloner.svg?style=flat-square&logo=github" alt="GitHub stars" /></a>
  <a href="https://github.com/keshavsoft/git-sibling-cloner/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@keshavsoft/git-sibling-cloner.svg?style=flat-square" alt="license" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/@keshavsoft/git-sibling-cloner.svg?style=flat-square" alt="node version" /></a>
</p>

<p align="center">
  <a href="https://github.com/keshavsoft/git-sibling-cloner">🐙 <strong>GitHub Repository</strong></a> •
  <a href="https://www.npmjs.com/package/@keshavsoft/git-sibling-cloner">📦 <strong>View on npm</strong></a> •
  <a href="https://github.com/keshavsoft/npm-source-explorer">🌐 <strong>Parent Suite (npm-source-explorer)</strong></a> •
  <a href="#quick-start">🚀 <strong>Quick Start</strong></a>
</p>

---

## What It Does

`@keshavsoft/git-sibling-cloner` takes any list of Git repositories (a JSON Source of Truth manifest) and shallow-clones (`--depth 1`) them side-by-side as sibling folders in your workspace.

- **Zero npm/ecosystem coupling:** Clones repositories from any ecosystem (npm, Cargo, Python, Go, GitHub orgs).
- **25s Fail-Safe Timeout:** Prevents hanging builds or terminal freezes on slow or dead remotes.
- **Cross-Platform Process-Tree Killing:** Employs Windows `taskkill /pid <PID> /T /F` and POSIX `SIGKILL` to prevent orphaned background git locks.
- **Prompt Suppression:** Disables interactive password/passphrase prompts (`GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=echo`).
- **Idempotent incremental runs:** Skips folders that already exist on disk.

---

## Quick Start

```bash
# Clone from a manifest file
npx @keshavsoft/git-sibling-cloner manifest.json

# Clone into a specific folder
npx @keshavsoft/git-sibling-cloner manifest.json ./my-workspace
```

---

## UNIX Composable Piping

Stream a manifest directly into the cloner via standard input:

```bash
cat manifest.json | npx @keshavsoft/git-sibling-cloner

# Pipe directly from @keshavsoft/npm-repo-resolver:
npx @keshavsoft/npm-repo-resolver express | npx @keshavsoft/git-sibling-cloner ./express-sources
```

---

## Manifest Format

The input manifest is a simple JSON array:

```json
[
  {
    "folder": "express",
    "cloneUrl": "https://github.com/expressjs/express.git"
  },
  {
    "folder": "accepts",
    "cloneUrl": "https://github.com/jshttp/accepts.git"
  }
]
```

---

## Programmatic API (ESM)

```javascript
import { cloneSiblings } from "@keshavsoft/git-sibling-cloner";

const manifest = [
  { folder: "express", cloneUrl: "https://github.com/expressjs/express.git" },
  { folder: "accepts", cloneUrl: "https://github.com/jshttp/accepts.git" }
];

const summary = await cloneSiblings(manifest, "./my-folder", {
  timeoutMs: 25000,
  onProgress: (event) => console.log(event)
});

console.log(`Cloned ${summary.clonedCount} repos!`);
```

---

## Ecosystem

- **Dependency Tree & Provenance:** [`@keshavsoft/npm-repo-resolver`](https://github.com/keshavsoft/npm-repo-resolver)
- **Sibling Workspace Cloner:** [`@keshavsoft/git-sibling-cloner`](https://github.com/keshavsoft/git-sibling-cloner) *(This package)*
- **All-in-One CLI Suite:** [`@keshavsoft/npm-source-explorer`](https://github.com/keshavsoft/npm-source-explorer)

---

## Requirements

- **Node.js**: `>=20.0.0`
- **Git**: Installed and available in `PATH`

---

## License

This project is licensed under the [MIT License](./LICENSE).  
Copyright © 2026 [KeshavSoft](https://github.com/keshavsoft).

