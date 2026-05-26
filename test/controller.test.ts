import { appendAuditEvent, getAuditLog } from "../src/lib/audit.js";
import { requiresConfirmation, requiresAudit } from "../src/lib/registry.js";

describe("audit chain", () => {
  it("chains hashes across events", () => {
    appendAuditEvent({ agent: "git-recover", capability: "git.status", blast: "none", requestId: "1", outcome: "allowed" });
    appendAuditEvent({ agent: "git-recover", capability: "git.reset", blast: "medium", requestId: "2", outcome: "pending_confirm" });
    const log = getAuditLog();
    expect(log.length).toBeGreaterThanOrEqual(2);
    expect(log[log.length - 1].prev).not.toBe("0000000000000000000000000000000000000000000000000000000000000000");
  });
});

describe("blast radius rules", () => {
  it("none and low do not require confirmation", () => {
    expect(requiresConfirmation("none")).toBe(false);
    expect(requiresConfirmation("low")).toBe(false);
  });

  it("medium and above require confirmation", () => {
    expect(requiresConfirmation("medium")).toBe(true);
    expect(requiresConfirmation("high")).toBe(true);
    expect(requiresConfirmation("critical")).toBe(true);
  });

  it("none does not require audit, low and above do", () => {
    expect(requiresAudit("none")).toBe(false);
    expect(requiresAudit("low")).toBe(true);
    expect(requiresAudit("high")).toBe(true);
  });
});
