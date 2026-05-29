"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Banknote, HandCoins, ListChecks, RefreshCw, SendHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api, formatInr, getStoredUser } from "@/lib/api";
import type { Application, Loan, Role } from "@/lib/types";

type ModuleKey = "sales" | "sanction" | "disbursement" | "collection";
type DashboardLoan = Omit<Loan, "borrower" | "application"> & {
  borrower?: { name?: string; email?: string };
  application?: Application;
};
type Lead = {
  borrower: { _id: string; name: string; email: string };
  application: Application | null;
};

const modules: Array<{ key: ModuleKey; label: string; icon: typeof ListChecks }> = [
  { key: "sales", label: "Sales", icon: ListChecks },
  { key: "sanction", label: "Sanction", icon: BadgeCheck },
  { key: "disbursement", label: "Disbursement", icon: Banknote },
  { key: "collection", label: "Collection", icon: HandCoins }
];

const access: Record<Role, ModuleKey[]> = {
  ADMIN: ["sales", "sanction", "disbursement", "collection"],
  SALES: ["sales"],
  SANCTION: ["sanction"],
  DISBURSEMENT: ["disbursement"],
  COLLECTION: ["collection"],
  BORROWER: []
};

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("BORROWER");
  const [active, setActive] = useState<ModuleKey>("sales");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loans, setLoans] = useState<DashboardLoan[]>([]);
  const [message, setMessage] = useState("");
  const available = useMemo(() => access[role], [role]);

  async function load(moduleKey = active) {
    const user = getStoredUser();
    if (!user) return router.push("/login");
    if (user.role === "BORROWER") return router.push("/apply");

    setRole(user.role);
    const firstModule = access[user.role][0];
    const selected = access[user.role].includes(moduleKey) ? moduleKey : firstModule;
    setActive(selected);

    const result = await api<{ leads?: Lead[]; loans?: DashboardLoan[] }>(`/dashboard/${selected}`);
    setLeads(result.leads ?? []);
    setLoans(result.loans ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function runAction(path: string, body?: object) {
    setMessage("");
    try {
      await api(path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined
      });
      setMessage("Action completed.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Action failed.");
    }
  }

  async function recordPayment(event: FormEvent<HTMLFormElement>, loanId: string) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      await api(`/dashboard/collection/${loanId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          utrNumber: form.get("utrNumber"),
          amount: Number(form.get("amount")),
          paidAt: form.get("paidAt")
        })
      });
      event.currentTarget.reset();
      setMessage("Payment recorded.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment failed.");
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-coral">Operations Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-ink">Role-based loan operations</h1>
          <p className="mt-3 max-w-2xl text-ink/65">Each team sees only its permitted module. Admin can review the full flow.</p>
        </div>
        <button className="focus-ring flex w-fit items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 font-semibold" onClick={() => load()}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {modules
          .filter((item) => available.includes(item.key))
          .map((item) => (
            <button
              key={item.key}
              className={`focus-ring flex items-center gap-2 rounded-md px-4 py-3 font-semibold ${
                active === item.key ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink"
              }`}
              onClick={() => load(item.key)}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
      </div>

      {message ? <p className="mt-5 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink">{message}</p> : null}

      <section className="mt-6">
        {active === "sales" ? <SalesModule leads={leads} /> : null}
        {active === "sanction" ? <LoanModule loans={loans} empty="No applied loans waiting for sanction." actions={(loan) => <SanctionActions loan={loan} runAction={runAction} />} /> : null}
        {active === "disbursement" ? (
          <LoanModule
            loans={loans}
            empty="No sanctioned loans waiting for disbursement."
            actions={(loan) => (
              <button className="focus-ring rounded-md bg-pine px-3 py-2 text-sm font-semibold text-white" onClick={() => runAction(`/dashboard/disbursement/${loan._id}/disburse`)}>
                Disburse
              </button>
            )}
          />
        ) : null}
        {active === "collection" ? <LoanModule loans={loans} empty="No active collection loans." actions={(loan) => <PaymentForm loan={loan} recordPayment={recordPayment} />} /> : null}
      </section>
    </AppShell>
  );
}

function SalesModule({ leads }: { leads: Lead[] }) {
  if (!leads.length) return <EmptyState text="No borrower leads without applications." />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {leads.map((lead) => (
        <article key={lead.borrower._id} className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-lg font-semibold">{lead.borrower.name}</p>
          <p className="mt-1 text-sm text-ink/60">{lead.borrower.email}</p>
          <div className="mt-4 rounded-md bg-surface p-3 text-sm">
            <p className="font-medium">Eligibility: {lead.application?.eligibilityStatus ?? "Not started"}</p>
            <p className="mt-1 text-ink/60">Salary: {lead.application ? formatInr(lead.application.monthlySalary) : "Pending"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function LoanModule({ loans, empty, actions }: { loans: DashboardLoan[]; empty: string; actions: (loan: DashboardLoan) => React.ReactNode }) {
  if (!loans.length) return <EmptyState text={empty} />;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {loans.map((loan) => {
        const outstanding = loan.totalRepayment - loan.amountPaid;
        return (
          <article key={loan._id} className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold">{loan.borrower?.name ?? "Borrower"}</p>
                <p className="mt-1 text-sm text-ink/60">{loan.borrower?.email}</p>
              </div>
              <span className="w-fit rounded-md bg-wheat px-3 py-2 text-xs font-bold text-ink">{loan.status}</span>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-4">
              <Metric label="Principal" value={formatInr(loan.amount)} />
              <Metric label="Interest" value={formatInr(loan.interestAmount)} />
              <Metric label="Repayment" value={formatInr(loan.totalRepayment)} />
              <Metric label="Outstanding" value={formatInr(outstanding)} />
            </dl>
            <div className="mt-5">{actions(loan)}</div>
          </article>
        );
      })}
    </div>
  );
}

function SanctionActions({ loan, runAction }: { loan: DashboardLoan; runAction: (path: string, body?: object) => Promise<void> }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="focus-ring rounded-md bg-pine px-3 py-2 text-sm font-semibold text-white" onClick={() => runAction(`/dashboard/sanction/${loan._id}/approve`)}>
        Approve
      </button>
      <button
        className="focus-ring rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white"
        onClick={() => {
          const reason = window.prompt("Rejection reason");
          if (reason) void runAction(`/dashboard/sanction/${loan._id}/reject`, { reason });
        }}
      >
        Reject
      </button>
    </div>
  );
}

function PaymentForm({ loan, recordPayment }: { loan: DashboardLoan; recordPayment: (event: FormEvent<HTMLFormElement>, loanId: string) => Promise<void> }) {
  if (loan.status === "CLOSED") {
    return <p className="rounded-md bg-pine/10 px-3 py-2 text-sm font-semibold text-pine">Loan closed.</p>;
  }

  return (
    <form className="grid gap-2 md:grid-cols-[1fr_140px_160px_auto]" onSubmit={(event) => recordPayment(event, loan._id)}>
      <input className="focus-ring rounded-md border border-ink/15 px-3 py-2" name="utrNumber" placeholder="UTR number" required />
      <input className="focus-ring rounded-md border border-ink/15 px-3 py-2" name="amount" type="number" min={1} max={loan.totalRepayment - loan.amountPaid} placeholder="Amount" required />
      <input className="focus-ring rounded-md border border-ink/15 px-3 py-2" name="paidAt" type="date" required />
      <button className="focus-ring grid h-11 w-11 place-items-center rounded-md bg-pine text-white" title="Record payment">
        <SendHorizontal size={18} />
      </button>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <dt className="text-xs font-semibold uppercase tracking-normal text-ink/50">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-ink/20 bg-white p-8 text-center text-ink/60">{text}</div>;
}
