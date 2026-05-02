const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OWNER_EMAIL", "OWNER_PASSWORD", "TEST_EMAIL", "TEST_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.log(`Seed skipped. Missing env: ${missing.join(", ")}`);
  process.exit(0);
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

for (const [email, password] of [[process.env.OWNER_EMAIL, process.env.OWNER_PASSWORD], [process.env.TEST_EMAIL, process.env.TEST_PASSWORD]]) {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error && !error.message.includes("already")) throw error;
  console.log(`Seed user ready: ${email} ${data.user?.id ?? "existing"}`);
}
