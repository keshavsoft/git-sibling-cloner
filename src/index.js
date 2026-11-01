/**
 * git-sibling-cloner
 *
 * Root export pointing to V1 Engine:
 * Fast, fail-safe shallow-cloning of Git repositories side-by-side as siblings.
 */

export { cloneSiblings, cloneRepo, killProcessTree, default } from "./v1/index.js";
export * from "./v1/index.js";
