import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { cloneSiblings } from "../src/index.js";

test("cloner: skips existing directory cleanly", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "git-sibling-test-"));
  const existingFolder = path.join(tempDir, "my-repo");
  await fs.mkdir(existingFolder);

  const manifest = [
    {
      name: "my-repo",
      folder: "my-repo",
      cloneUrl: "https://github.com/example/my-repo.git"
    }
  ];

  try {
    const summary = await cloneSiblings(manifest, tempDir);
    assert.equal(summary.totalCount, 1);
    assert.equal(summary.clonedCount, 0);
    assert.equal(summary.skippedCount, 1);
    assert.equal(summary.results[0].status, "skipped");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});
