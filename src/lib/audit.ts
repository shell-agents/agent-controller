import { createHash } from "crypto";

export interface AuditEvent {
  ts: string;
  agent: string;
  capability: string;
  blast: string;
  requestId: string | number;
  outcome: "allowed" | "denied" | "pending_confirm";
  prev: string;
}

let chainHead = "0000000000000000000000000000000000000000000000000000000000000000";

const log: AuditEvent[] = [];

export function appendAuditEvent(
  event: Omit<AuditEvent, "ts" | "prev">
): AuditEvent {
  const entry: AuditEvent = {
    ...event,
    ts: new Date().toISOString(),
    prev: chainHead,
  };
  chainHead = createHash("sha256").update(JSON.stringify(entry)).digest("hex");
  log.push(entry);
  return entry;
}

export function getAuditLog(): AuditEvent[] {
  return [...log];
}
