#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { cloneSiblings } from "../src/index.js";

const packageJson = JSON.parse(
  await fs.readFile(new URL("../package.json", import.meta.url), "utf8")
);
const VERSION = packageJson.version;

function help() {
  console.log(`@keshavsoft/git-sibling-cloner v${VERSION}

Fast, fail-safe shallow-cloning of Git repositories side-by-side as siblings
from any Source of Truth manifest.

Usage:
  npx @keshavsoft/git-sibling-cloner <manifest.json> [destination-folder]
  cat manifest.json | npx @keshavsoft/git-sibling-cloner [destination-folder]

Examples:
  npx @keshavsoft/git-sibling-cloner repos.json ./my-workspace
  npx @keshavsoft/npm-repo-resolver express | npx @keshavsoft/git-sibling-cloner ./sources
`);
}

async function readStdin() {
  if (process.stdin.isTTY) return null;
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const flags = rawArgs.filter((arg) => arg.startsWith("-"));
  const positional = rawArgs.filter((arg) => !arg.startsWith("-"));

  if (flags.includes("--version") || flags.includes("-v")) {
    console.log(VERSION);
    return;
  }

  if (flags.includes("--help") || flags.includes("-h")) {
    help();
    return;
  }

  let manifestData = null;
  let targetDir = process.cwd();

  // 1. Try reading from stdin first (for piping)
  const stdinInput = await readStdin();
  if (stdinInput) {
    try {
      manifestData = JSON.parse(stdinInput);
    } catch {
      throw new Error("Invalid JSON manifest piped from standard input.");
    }
    if (positional[0]) {
      targetDir = path.resolve(positional[0]);
    }
  } else if (positional.length > 0) {
    // 2. Read from manifest file
    const manifestPath = path.resolve(positional[0]);
    const fileContent = await fs.readFile(manifestPath, "utf8");
    manifestData = JSON.parse(fileContent);
    if (positional[1]) {
      targetDir = path.resolve(positional[1]);
    }
  } else {
    help();
    return;
  }

  if (!Array.isArray(manifestData)) {
    throw new Error("Manifest must be a JSON array of repository objects.");
  }

  console.log(`\n🚀 Cloning ${manifestData.length} repositories into "${targetDir}"...\n`);

  const summary = await cloneSiblings(manifestData, targetDir, {
    timeoutMs: 25000,
    onProgress: (event) => {
      if (event.stage === "cloning-start") {
        process.stdout.write(`  [${event.index}/${event.total}] ${event.name} (started ${event.startedAt})... `);
      } else if (event.stage === "cloning-finish") {
        const secs = (event.durationMs / 1000).toFixed(1);
        if (event.status === "cloned") {
          const tag = event.isInferred ? " (inferred from owner)" : "";
          console.log(`✔ cloned in ${secs}s${tag}`);
        } else if (event.status === "skipped") {
          console.log(`⏩ skipped (already exists)`);
        } else if (event.status === "skipped-unlinked") {
          console.log(`⏩ skipped (no repository found)`);
        } else if (event.status === "timed-out") {
          console.log(`⚠️ TIMED OUT after ${secs}s (skipped)`);
        } else if (event.status === "failed") {
          console.log(`❌ failed (${event.error || "unknown"})`);
        }
      }
    }
  });

  const totalSecs = (summary.totalDurationMs / 1000).toFixed(1);
  console.log(`\n✨ Finished in ${totalSecs}s!`);
  console.log(`📁 Destination: ${summary.destination}`);
  console.log(`📊 Cloned: ${summary.clonedCount} | Skipped: ${summary.skippedCount} | Failed/Timed Out: ${summary.failedCount}\n`);
}

main().catch((error) => {
  console.error(`\ngit-sibling-cloner error: ${error.message}\n`);
  process.exitCode = 1;
});
