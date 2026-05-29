import { ArrowRight, BadgeIndianRupee, ClipboardCheck, LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto grid min-h-screen max-w-7xl content-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <span className="mb-5 w-fit rounded-md bg-wheat px-3 py-2 text-sm font-semibold text-ink">Loan Management System</span>
          <h1 className="max-w-3xl text-5xl font-bold tracking-normal text-ink sm:text-6xl">Apply, approve, disburse, and collect from one clean workflow.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
            A deployment-ready MERN assignment build with borrower onboarding, server-side eligibility, loan math, role dashboards, and protected APIs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="focus-ring flex items-center gap-2 rounded-md bg-pine px-5 py-3 font-semibold text-white" href="/register">
              Start application <ArrowRight size={18} />
            </Link>
            <Link className="focus-ring rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink" href="/login">
              Staff login
            </Link>
          </div>
        </div>
        <div className="grid content-center gap-4">
          {[
            { icon: ClipboardCheck, title: "BRE protected", body: "Age, PAN, salary, and employment rules run on the API." },
            { icon: BadgeIndianRupee, title: "Lifecycle aware", body: "APPLIED to SANCTIONED to DISBURSED to CLOSED with strict role actions." },
            { icon: LockKeyhole, title: "RBAC enforced", body: "Borrowers and executive teams are separated on UI and backend routes." }
          ].map((item) => (
            <article key={item.title} className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
              <item.icon className="mb-4 text-coral" size={28} />
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
