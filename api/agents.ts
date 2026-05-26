import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AgentManifest } from "../src/lib/types.js";
import { registerAgent, lookupAgent } from "../src/lib/registry.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    const parsed = AgentManifest.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid manifest", detail: parsed.error.flatten() });
    }
    registerAgent(parsed.data);
    return res.status(201).json({ registered: parsed.data.id });
  }

  if (req.method === "GET") {
    const { id } = req.query;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Missing agent id" });
    }
    const manifest = lookupAgent(id);
    if (!manifest) {
      return res.status(404).json({ error: `Agent not found: ${id}` });
    }
    return res.status(200).json(manifest);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
