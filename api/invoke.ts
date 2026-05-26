import type { VercelRequest, VercelResponse } from "@vercel/node";
import { InvokeRequest, type JsonRpcResponse } from "../src/lib/types.js";
import { lookupAgent, resolveCapabilityBlast, requiresConfirmation, requiresAudit } from "../src/lib/registry.js";
import { appendAuditEvent } from "../src/lib/audit.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = InvokeRequest.safeParse(req.body);
  if (!parsed.success) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: req.body?.id ?? null,
      error: { code: -32600, message: "Invalid request", data: parsed.error.flatten() },
    };
    return res.status(400).json(response);
  }

  const { id, params } = parsed.data;
  const { agent: agentId, capability, args } = params;

  const manifest = lookupAgent(agentId);
  if (!manifest) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Agent not found: ${agentId}` },
    };
    return res.status(404).json(response);
  }

  const blast = resolveCapabilityBlast(manifest, capability);
  if (!blast) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Capability not found: ${capability}` },
    };
    return res.status(404).json(response);
  }

  if (requiresConfirmation(blast)) {
    if (requiresAudit(blast)) {
      appendAuditEvent({ agent: agentId, capability, blast, requestId: id, outcome: "pending_confirm" });
    }
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: `Confirmation required for blast level: ${blast}` },
    };
    return res.status(202).json(response);
  }

  if (requiresAudit(blast)) {
    appendAuditEvent({ agent: agentId, capability, blast, requestId: id, outcome: "allowed" });
  }

  const agentRes = await fetch(manifest.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method: "agent.invoke", params: { capability, args } }),
  });

  const result = await agentRes.json();
  return res.status(200).json(result);
}
