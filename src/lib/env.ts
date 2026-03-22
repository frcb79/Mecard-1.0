type ClientEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_REQUIRE_SUPABASE?: string;
};

const PLACEHOLDER_PATTERNS = [
  "your-project",
  "placeholder",
  "dummy",
  "example",
  "localhost",
  "xxx",
  "test-project",
  "fake",
];

const looksLikePlaceholder = (value: string): boolean => {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
};

export const isSupabaseConfigured = (env: ClientEnv): boolean => {
  const url = (env.VITE_SUPABASE_URL ?? "").trim();
  const key = (env.VITE_SUPABASE_ANON_KEY ?? "").trim();

  if (!url || !key) {
    return false;
  }

  if (looksLikePlaceholder(url) || looksLikePlaceholder(key)) {
    return false;
  }

  return true;
};

export const shouldRequireSupabase = (env: ClientEnv): boolean => {
  return (env.VITE_REQUIRE_SUPABASE ?? "false").toLowerCase() === "true";
};

export type EnvValidationReport = {
  isConfigured: boolean;
  requireSupabase: boolean;
  messages: string[];
};

export const validateClientEnv = (env: ClientEnv): EnvValidationReport => {
  const messages: string[] = [];
  const configured = isSupabaseConfigured(env);
  const requireSupabase = shouldRequireSupabase(env);

  if (!configured) {
    messages.push(
      "Supabase no esta configurado con credenciales reales. La app seguira en modo mock/fallback."
    );
  }

  if (requireSupabase && !configured) {
    messages.push(
      "VITE_REQUIRE_SUPABASE=true exige VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY validos."
    );
  }

  return {
    isConfigured: configured,
    requireSupabase,
    messages,
  };
};
