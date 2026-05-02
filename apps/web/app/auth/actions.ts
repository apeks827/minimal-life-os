"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../src/lib/supabase-client";

export type AuthActionState = { message: string; ok: boolean };

export async function signInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase env is not configured; local MVP mode remains available." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  redirect("/");
}

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase env is not configured; local MVP mode remains available." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Check your email to confirm the account, then sign in." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/auth");
}
