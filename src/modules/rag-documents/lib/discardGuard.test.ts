import { describe, expect, it, vi } from "vitest";
import { canProceed, DISCARD_MESSAGE } from "./discardGuard";

describe("canProceed", () => {
  it("does not prompt when nothing is dirty", () => {
    const confirmFn = vi.fn(() => false);
    expect(canProceed(false, confirmFn)).toBe(true);
    expect(confirmFn).not.toHaveBeenCalled();
  });

  it("prompts when dirty and follows the answer", () => {
    expect(canProceed(true, () => true)).toBe(true);
    const confirmFn = vi.fn(() => false);
    expect(canProceed(true, confirmFn)).toBe(false);
    expect(confirmFn).toHaveBeenCalledWith(DISCARD_MESSAGE);
  });

  it("uses a custom message", () => {
    const confirmFn = vi.fn(() => true);
    canProceed(true, confirmFn, "Other?");
    expect(confirmFn).toHaveBeenCalledWith("Other?");
  });
});
