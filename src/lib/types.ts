import { z } from "zod";

export type BlastLevel = "none" | "low" | "medium" | "high" | "critical";

export const BLAST_LEVELS: BlastLevel[] = ["none", "low", "medium", "high", "critical"];

export const blastIndex = (level: BlastLevel): number => BLAST_LEVELS.indexOf(level);

export const AgentManifest = z.object({
  id: z.string(),           // e.g. "git-recover"
  endpoint: z.string().url(),
  capabilities: z.array(z.object({
    id: z.string(),
    blast: z.enum(["none", "low", "medium", "high", "critical"]),
  })),
  sandbox: z.enum(["required", "recommended", "optional"]),
});
export type AgentManifest = z.infer<typeof AgentManifest>;

export const InvokeRequest = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  method: z.literal("agent.invoke"),
  params: z.object({
    agent: z.string(),
    capability: z.string(),
    args: z.record(z.unknown()).optional(),
  }),
});
export type InvokeRequest = z.infer<typeof InvokeRequest>;

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: T;
  error?: JsonRpcError;
}
