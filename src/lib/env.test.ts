import { describe, expect, it } from "vitest";
import { isSupabaseConfigured, validateClientEnv } from "./env";

describe("env validation", () => {
  it("returns false when values are missing", () => {
    expect(isSupabaseConfigured({})).toBe(false);
  });

  it("returns false when url/key look like placeholder", () => {
    expect(
      isSupabaseConfigured({
        VITE_SUPABASE_URL: "https://your-project.supabase.co",
        VITE_SUPABASE_ANON_KEY: "placeholder-key",
      })
    ).toBe(false);
  });

  it("returns true when url/key look valid", () => {
    expect(
      isSupabaseConfigured({
        VITE_SUPABASE_URL: "https://abc123.supabase.co",
        VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real",
      })
    ).toBe(true);
  });

  it("reports strict mode issue when require flag is enabled", () => {
    const report = validateClientEnv({ VITE_REQUIRE_SUPABASE: "true" });

    expect(report.requireSupabase).toBe(true);
    expect(report.isConfigured).toBe(false);
    expect(report.messages.length).toBeGreaterThan(0);
  });
});
