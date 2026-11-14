import { describe, expect, it } from "vitest";

function validateBackup(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (!Array.isArray(payload.progress) && !Array.isArray(payload.bookmarks)) return false;
  return true;
}

describe("import validation", () => {
  it("rejects invalid payloads", () => {
    expect(validateBackup(null)).toBe(false);
    expect(validateBackup({})).toBe(false);
    expect(validateBackup({ progress: [] })).toBe(true);
    expect(validateBackup({ bookmarks: [] })).toBe(true);
  });
});
