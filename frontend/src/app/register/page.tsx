"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { api, saveSession } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password")
        })
      });
      saveSession(result.token, result.user);
      router.push("/apply");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-ink">Create borrower account</h1>
        <p className="mt-2 text-sm text-ink/65">After signup, complete eligibility and upload your salary slip.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">
            Name
            <input className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-3" name="name" required />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-3" name="email" type="email" required />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input className="focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-3" name="password" type="password" minLength={8} required />
          </label>
          {error ? <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
          <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-3 font-semibold text-white" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-sm text-ink/65">
          Already registered?{" "}
          <Link className="font-semibold text-pine" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
