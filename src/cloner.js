/**
 * Git Cloner Core
 * ----------------------------------------------------------------------------
 * Executes `git clone --depth 1` with a fail-safe timeout, non-interactive
 * credentials, and cross-platform process-tree termination.
 */

import { spawn, exec } from "node:child_process";

export function killProcessTree(child) {
  if (!child || !child.pid) return;

  if (process.platform === "win32") {
    exec(`taskkill /pid ${child.pid} /T /F`, () => {});
  } else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      try {
        child.kill("SIGKILL");
      } catch {}
    }
  }
}

export function cloneRepo(cloneUrl, targetDir, options = {}) {
  const timeoutMs = options.timeoutMs ?? 25000;

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let isSettled = false;

    const child = spawn("git", ["clone", "--depth", "1", cloneUrl, targetDir], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      detached: process.platform !== "win32",
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",
        GIT_ASKPASS: "echo"
      }
    });

    const timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      killProcessTree(child);
      reject(new Error(`Git clone timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);

      const durationMs = Date.now() - startTime;
      if (code === 0) {
        resolve({ durationMs });
      } else {
        const message = stderr.trim() || `git exited with code ${code}`;
        reject(new Error(message));
      }
    });
  });
}
