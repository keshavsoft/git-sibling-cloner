/**
 * Sibling Workspace Builder
 * ----------------------------------------------------------------------------
 * Iterates through a Source of Truth manifest of repositories, prepares
 * workspace directories, skips already-existing folders, and manages execution.
 */

import path from "node:path";
import fs from "node:fs/promises";
import { cloneRepo } from "./cloner.js";

export async function cloneSiblings(repositories, destinationDirectory = process.cwd(), options = {}) {
  const destination = path.resolve(destinationDirectory);
  await fs.mkdir(destination, { recursive: true });

  const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
  const timeoutMs = options.timeoutMs ?? 25000;
  const startTime = Date.now();

  const results = [];
  let index = 0;

  for (const repo of repositories) {
    index++;
    const folder = repo.folder || repo.name?.replace(/^@/, "").replace(/[\\/]/g, "-") || `repo-${index}`;
    const cloneUrl = repo.cloneUrl || repo.repoUrl;
    const targetPath = path.join(destination, folder);
    const itemStart = Date.now();

    onProgress({
      stage: "cloning-start",
      index,
      total: repositories.length,
      name: repo.name || folder,
      folder,
      cloneUrl,
      startedAt: new Date().toLocaleTimeString()
    });

    // 1. Skip if already exists on disk
    const exists = await fs.access(targetPath).then(() => true, () => false);
    if (exists) {
      const durationMs = Date.now() - itemStart;
      const record = {
        index,
        total: repositories.length,
        name: repo.name || folder,
        folder,
        cloneUrl,
        status: "skipped",
        durationMs,
        detail: "already exists"
      };
      results.push(record);
      onProgress({ stage: "cloning-finish", ...record });
      continue;
    }

    // 2. Clone repository
    try {
      const cloneResult = await cloneRepo(cloneUrl, targetPath, { timeoutMs });
      const durationMs = cloneResult.durationMs ?? (Date.now() - itemStart);
      const record = {
        index,
        total: repositories.length,
        name: repo.name || folder,
        folder,
        cloneUrl,
        status: "cloned",
        durationMs,
        isInferred: Boolean(repo.isInferred)
      };
      results.push(record);
      onProgress({ stage: "cloning-finish", ...record });
    } catch (error) {
      const durationMs = Date.now() - itemStart;
      const isNotFound = /not found|could not read/i.test(error.message);
      const isTimeout = error.message.includes("timed out");

      let status = isTimeout ? "timed-out" : "failed";
      let detail = error.message;

      if (repo.isInferred && isNotFound) {
        status = "skipped-unlinked";
        detail = "not found on remote host";
      }

      const record = {
        index,
        total: repositories.length,
        name: repo.name || folder,
        folder,
        cloneUrl,
        status,
        durationMs,
        detail,
        error: error.message
      };
      results.push(record);
      onProgress({ stage: "cloning-finish", ...record });
    }
  }

  const totalDurationMs = Date.now() - startTime;
  const clonedCount = results.filter((r) => r.status === "cloned").length;
  const skippedCount = results.filter((r) => r.status === "skipped" || r.status === "skipped-unlinked").length;
  const failedCount = results.filter((r) => r.status === "failed" || r.status === "timed-out").length;

  const summary = {
    destination,
    totalCount: repositories.length,
    clonedCount,
    skippedCount,
    failedCount,
    totalDurationMs,
    results
  };

  onProgress({ stage: "completed", summary });
  return summary;
}
