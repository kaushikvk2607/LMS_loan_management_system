"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, LogIn } from "lucide-react";
import { api, saveSession } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password")
        })
      });
      saveSession(result.token, result.user);
      router.push(result.user.role === "BORROWER" ? "/apply" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/65">Use a seeded staff account or your borrower login.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">
            Email
            <input className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-3" name="email" type="email" required />
          </label>
          <label className="block text-sm font-medium">
            Password
            <span className="mt-2 flex rounded-md border border-ink/15">
              <input className="focus-ring min-w-0 flex-1 rounded-l-md px-3 py-3" name="password" type={showPassword ? "text" : "password"} required />
              <button
                className="focus-ring grid w-12 place-items-center rounded-r-md border-l border-ink/15"
                type="button"
                title="Show password"
                onClick={() => setShowPassword((value) => !value)}
              >
                <Eye size={18} />
              </button>
            </span>
          </label>
          {error ? <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
          <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-3 font-semibold text-white" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-5 text-sm text-ink/65">
          New borrower?{" "}
          <Link className="font-semibold text-pine" href="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
