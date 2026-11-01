# git-sibling-cloner

<p align="center">
  <strong>Fast, fail-safe shallow-cloning of Git repositories side-by-side as siblings from any Source of Truth manifest.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/git-sibling-cloner"><img src="https://img.shields.io/npm/v/git-sibling-cloner.svg?style=flat-square&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/git-sibling-cloner"><img src="https://img.shields.io/npm/dm/git-sibling-cloner.svg?style=flat-square&color=blue" alt="npm downloads" /></a>
  <a href="https://github.com/keshavsoft/git-sibling-cloner"><img src="https://img.shields.io/github/stars/keshavsoft/git-sibling-cloner.svg?style=flat-square&logo=github" alt="GitHub stars" /></a>
  <a href="https://github.com/keshavsoft/git-sibling-cloner/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/git-sibling-cloner.svg?style=flat-square" alt="license" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/git-sibling-cloner.svg?style=flat-square" alt="node version" /></a>
</p>

<p align="center">
  <a href="https://keshavsoft.github.io/git-sibling-cloner/">🌐 <strong>Documentation Website</strong></a> •
  <a href="https://www.npmjs.com/package/git-sibling-cloner">📦 <strong>View on npm</strong></a> •
  <a href="https://github.com/keshavsoft/git-sibling-cloner">🐙 <strong>GitHub Repository</strong></a> •
  <a href="https://github.com/keshavsoft/git-sibling-cloner/blob/main/STRUCTURE.md">📖 <strong>Architecture & Layout</strong></a> •
  <a href="#quick-start">🚀 <strong>Quick Start</strong></a>
</p>

---

## What It Does

`git-sibling-cloner` takes any list of Git repositories (a JSON Source of Truth manifest) and shallow-clones (`--depth 1`) them side-by-side as sibling folders in your workspace.

- **Zero npm/ecosystem coupling:** Clones repositories from any ecosystem (npm, Cargo, Python, Go, GitHub orgs).
- **25s Fail-Safe Timeout:** Prevents hanging builds or terminal freezes on slow or dead remotes.
- **Cross-Platform Process-Tree Termination:** Employs Windows `taskkill /pid <PID> /T /F` and POSIX `SIGKILL` to prevent orphaned background git locks.
- **Prompt Suppression:** Disables interactive password/passphrase prompts (`GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=echo`).
- **Idempotent incremental runs:** Skips folders that already exist on disk.

---

## Quick Start

```bash
# Clone from a manifest file
npx git-sibling-cloner manifest.json

# Clone into a specific folder
npx git-sibling-cloner manifest.json ./my-workspace
```

---

## UNIX Composable Piping

Stream a manifest directly into the cloner via standard input:

```bash
cat manifest.json | npx git-sibling-cloner

# Pipe directly from npm-repo-resolver:
npx npm-repo-resolver express | npx git-sibling-cloner ./express-sources
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
import { cloneSiblings } from "git-sibling-cloner";

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

- **Dependency Tree & Provenance:** [`npm-repo-resolver`](https://github.com/keshavsoft/npm-repo-resolver)
- **Sibling Workspace Cloner:** [`git-sibling-cloner`](https://github.com/keshavsoft/git-sibling-cloner) *(This package)*
- **All-in-One CLI Suite:** [`@keshavsoft/npm-source-explorer`](https://github.com/keshavsoft/npm-source-explorer)

---

## Requirements

- **Node.js**: `>=20.0.0`
- **Git**: Installed and available in `PATH`

---

## License

This project is licensed under the [MIT License](./LICENSE).  
Copyright © 2026 [KeshavSoft](https://github.com/keshavsoft).
