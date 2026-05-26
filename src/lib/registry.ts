import type { AgentManifest, BlastLevel } from "./types.js";
import { blastIndex } from "./types.js";

const REGISTRY = new Map<string, AgentManifest>();

export function registerAgent(manifest: AgentManifest): void {
  REGISTRY.set(manifest.id, manifest);
}

export function lookupAgent(agentId: string): AgentManifest | undefined {
  return REGISTRY.get(agentId);
}

export function resolveCapabilityBlast(
  manifest: AgentManifest,
  capabilityId: string
): BlastLevel | undefined {
  return manifest.capabilities.find((c) => c.id === capabilityId)?.blast;
}

export function requiresConfirmation(blast: BlastLevel): boolean {
  return blastIndex(blast) >= blastIndex("medium");
}

export function requiresAudit(blast: BlastLevel): boolean {
  return blastIndex(blast) >= blastIndex("low");
}
