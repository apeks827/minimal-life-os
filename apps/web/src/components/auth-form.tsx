"use client";

import { useActionState } from "react";
import { signInAction, signUpAction, type AuthActionState } from "../../app/auth/actions";

const initialState: AuthActionState = { ok: true, message: "" };

export function AuthForm() {
  const [signInState, signIn, isSigningIn] = useActionState(signInAction, initialState);
  const [signUpState, signUp, isSigningUp] = useActionState(signUpAction, initialState);
  const state = signInState.message ? signInState : signUpState;

  return (
    <div className="grid gap-4">
      <form action={signIn} className="grid gap-3">
        <label className="grid gap-2 text-sm">Email<input name="email" className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" placeholder="you@example.com" /></label>
        <label className="grid gap-2 text-sm">Password<input name="password" className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" type="password" placeholder="minimum 6 chars" /></label>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white" disabled={isSigningIn}>{isSigningIn ? "Вход..." : "Войти"}</button>
          <button formAction={signUp} className="rounded-full bg-white/70 px-6 py-4 text-left" disabled={isSigningUp}>{isSigningUp ? "Регистрация..." : "Зарегистрироваться"}</button>
        </div>
      </form>
      {state.message ? <p className={state.ok ? "text-sm text-[var(--moss)]" : "text-sm text-[var(--clay)]"}>{state.message}</p> : null}
    </div>
  );
}
