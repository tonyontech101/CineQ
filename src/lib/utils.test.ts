import { describe, expect, it } from "vitest";
import { cn, formatRuntime, languageName, ratingTone, truncate } from "./utils";

describe("cn", () => {
  it("joins truthy class names with spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("ratingTone", () => {
  it("classifies high ratings (>= 7.5)", () => {
    expect(ratingTone(7.5)).toBe("high");
    expect(ratingTone(9.1)).toBe("high");
  });

  it("classifies mid ratings (>= 6 and < 7.5)", () => {
    expect(ratingTone(6)).toBe("mid");
    expect(ratingTone(7.4)).toBe("mid");
  });

  it("classifies low ratings (< 6)", () => {
    expect(ratingTone(5.9)).toBe("low");
    expect(ratingTone(0)).toBe("low");
  });
});

describe("formatRuntime", () => {
  it("returns null for null, zero, or negative input", () => {
    expect(formatRuntime(null)).toBeNull();
    expect(formatRuntime(0)).toBeNull();
    expect(formatRuntime(-10)).toBeNull();
  });

  it("formats sub-hour runtimes as minutes only", () => {
    expect(formatRuntime(45)).toBe("45m");
  });

  it("omits minutes on an exact hour", () => {
    expect(formatRuntime(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatRuntime(128)).toBe("2h 8m");
  });
});

describe("truncate", () => {
  it("leaves short text unchanged", () => {
    expect(truncate("hello", 150)).toBe("hello");
  });

  it("truncates on a word boundary and appends an ellipsis", () => {
    const result = truncate("the quick brown fox jumps", 12);
    expect(result.endsWith("…")).toBe(true);
    // Should not cut mid-word: "the quick" fits within 12 chars, "brown" would not.
    expect(result).toBe("the quick…");
  });
});

describe("languageName", () => {
  it("returns null for a null code", () => {
    expect(languageName(null)).toBeNull();
  });

  it("maps a known ISO 639-1 code to a display name", () => {
    expect(languageName("en")).toBe("English");
  });
});
