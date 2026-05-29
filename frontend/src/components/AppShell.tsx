"use client";

import { LogOut, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, getStoredUser } from "@/lib/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = getStoredUser();

  return (
    <main className="min-h-screen bg-surface">
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-pine text-white">
              <WalletCards size={22} />
            </span>
            <span>LMS</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 sm:flex">
                  <ShieldCheck size={16} />
                  {user.role}
                </span>
                <button
                  className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink"
                  title="Logout"
                  onClick={() => {
                    clearSession();
                    router.push("/login");
                  }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link className="focus-ring rounded-md bg-ink px-4 py-2 text-white" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
    </main>
  );
}
