import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuditLog } from "../src/lib/audit.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ log: getAuditLog() });
}
