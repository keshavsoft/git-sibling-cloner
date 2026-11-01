# Architecture & Source Layout

<p align="center">
  <a href="https://keshavsoft.github.io/git-sibling-cloner/">🌐 <strong>Live Documentation</strong></a> •
  <a href="https://www.npmjs.com/package/git-sibling-cloner">📦 <strong>npm Package</strong></a> •
  <a href="https://github.com/keshavsoft/git-sibling-cloner">🐙 <strong>GitHub Repository</strong></a> •
  <a href="https://github.com/keshavsoft/git-sibling-cloner#readme">📖 <strong>README</strong></a> •
  <a href="https://github.com/keshavsoft/git-sibling-cloner/issues">🐛 <strong>Issues</strong></a>
</p>

---

## Architecture Philosophy

1. **Ecosystem-Agnostic Workspace Builder:** Takes any list of Git repositories (from npm, GitHub orgs, Cargo, Python, or internal manifests) and shallow-clones them as sibling folders side-by-side in your workspace.
2. **Fail-Safe & Zero-Hang Guarantee:**
   - 25-second configurable timeout prevents dead networks or unreachable remotes from hanging CI/CD pipelines.
   - Cross-platform process-tree termination kills helper binaries (`git-remote-https.exe`) on timeout.
   - Non-interactive prompts (`GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=echo`) immediately reject password queries for private or deleted repos.
3. **V1 Versioned Routine:** Core cloning engine resides in `src/v1/`, while `src/index.js` serves as the root router.

```
┌─────────────────────────────────────────────────────────────┐
│                      INPUT MANIFEST                         │
│            Array<{ folder, cloneUrl, ... }>                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 git-sibling-cloner Engine                   │
├──────────────────────────────┬──────────────────────────────┤
│ 1. Incremental Check         │ Skip if folder exists on disk│
│ 2. Non-interactive Spawn     │ GIT_TERMINAL_PROMPT=0        │
│ 3. Fail-Safe Timer           │ Default 25s timeout          │
│ 4. Process Tree Kill         │ Windows taskkill / POSIX kill│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     WORKSPACE SIBLINGS                      │
│     my-folder/repo-a/   my-folder/repo-b/   my-folder/...   │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Overview

```
git-sibling-cloner/
├── cli/
│   └── index.js             # CLI runner supporting manifest files and stdin piping
├── docs/
│   ├── .nojekyll            # Prevents Jekyll build override on GitHub Pages
│   └── index.html           # Live documentation website
├── src/
│   ├── index.js             # Root export pointing to ./v1/index.js
│   └── v1/                  # V1 Sibling Cloner Engine
│       ├── builder.js       # Sibling orchestration, incremental checks, progress
│       ├── cloner.js        # Safe git spawn, timeout timers, process-tree killing
│       └── index.js         # V1 Module entrypoint
├── test/
│   └── cloner.test.js       # Unit tests for incremental skips and timeouts
├── package.json             # Package configuration & exports
├── README.md                # Project documentation & usage
└── STRUCTURE.md             # Codebase layout and architecture reference
```

---

## V1 Engine Breakdown

### 1. `src/v1/cloner.js` (Process Management & Shallow Clone)
- Executes `git clone --depth 1 <cloneUrl> <targetDir>`.
- Configures environment: `GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=echo`, `windowsHide: true`.
- Employs `killProcessTree`:
  - **Windows:** `taskkill /pid <PID> /T /F` terminates the child process and all its subprocesses (e.g. `git-remote-https.exe`, `sh.exe`).
  - **POSIX:** `process.kill(-child.pid, "SIGKILL")` terminates the process group.

### 2. `src/v1/builder.js` (Sibling Workspace Orchestrator)
- Normalizes destination paths with `path.resolve()`.
- Iterates through the repository manifest:
  - If target directory exists on disk: emits `status: "skipped"` in 0ms.
  - If target directory is empty: initiates shallow clone.
- Emits real-time progress events (`cloning-start`, `cloning-finish`, `completed`).
- Computes comprehensive summary: `totalCount`, `clonedCount`, `skippedCount`, `failedCount`, `totalDurationMs`.

---

## Input Manifest Data Contract

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

## Decoupled Ecosystem Links

- 🌐 **Live Docs**: [keshavsoft.github.io/git-sibling-cloner](https://keshavsoft.github.io/git-sibling-cloner/)
- 📦 **npm Package**: [npmjs.com/package/git-sibling-cloner](https://www.npmjs.com/package/git-sibling-cloner)
- 🐙 **GitHub Repository**: [github.com/keshavsoft/git-sibling-cloner](https://github.com/keshavsoft/git-sibling-cloner)
- 🔍 **Companion Resolver**: [`npm-repo-resolver`](https://www.npmjs.com/package/npm-repo-resolver)
- ⚡ **Parent Suite**: [`@keshavsoft/npm-source-explorer`](https://www.npmjs.com/package/@keshavsoft/npm-source-explorer)
- 📄 **License**: [MIT License](./LICENSE)

