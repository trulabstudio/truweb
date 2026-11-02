"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { adminText } from "@/lib/admin/text";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.href = "/admin/threads";
        return;
      }
      setError(((await response.json()) as { error: string }).error);
    } catch {
      setError(adminText.serverError);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">
        {adminText.password}
        <span className="relative block">
          <input name="password" type={visible ? "text" : "password"} required autoFocus autoComplete="current-password" className="tool-input pr-12" />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? adminText.hidePassword : adminText.showPassword}
            className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-trulab-muted hover:text-trulab-ink"
          >
            {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </span>
      </label>
      {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>}
      <button disabled={busy} className="focus-ring rounded-full bg-trulab-button-primary px-6 py-3.5 text-sm font-semibold text-trulab-button-primary-text shadow-sm transition hover:-translate-y-0.5 hover:bg-trulab-button-primary-hover disabled:translate-y-0 disabled:opacity-60">
        {busy ? adminText.signingIn : adminText.signIn}
      </button>
    </form>
  );
}
