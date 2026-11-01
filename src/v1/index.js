/**
 * ============================================================================
 * git-sibling-cloner :: V1 Engine
 * ----------------------------------------------------------------------------
 * Sibling Git cloner that consumes any Source of Truth manifest and safely
 * shallow-clones repositories side-by-side into a workspace.
 * ============================================================================
 */

export { cloneSiblings } from "./builder.js";
export { cloneRepo, killProcessTree } from "./cloner.js";
export { cloneSiblings as default } from "./builder.js";
