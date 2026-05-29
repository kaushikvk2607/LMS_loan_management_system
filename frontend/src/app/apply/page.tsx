"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileUp, Send, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api, formatInr, getStoredUser } from "@/lib/api";
import type { Application, Loan, Payment } from "@/lib/types";

type BorrowerState = {
  application: Application | null;
  loan: Loan | null;
  payments: Payment[];
};

export default function ApplyPage() {
  const router = useRouter();
  const [state, setState] = useState<BorrowerState>({ application: null, loan: null, payments: [] });
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(100000);
  const [tenureDays, setTenureDays] = useState(180);
  const calculation = useMemo(() => {
    const interest = Number(((amount * 12 * tenureDays) / (365 * 100)).toFixed(2));
    return { interest, total: amount + interest };
  }, [amount, tenureDays]);

  async function load() {
    const user = getStoredUser();
    if (!user) return router.push("/login");
    if (user.role !== "BORROWER") return router.push("/dashboard");
    setState(await api<BorrowerState>("/borrower/me"));
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      await api("/borrower/details", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.get("fullName"),
          pan: form.get("pan"),
          dateOfBirth: form.get("dateOfBirth"),
          monthlySalary: Number(form.get("monthlySalary")),
          employmentMode: form.get("employmentMode")
        })
      });
      setMessage("Eligibility passed.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Eligibility failed.");
      await load();
    }
  }

  async function uploadSlip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      await api("/borrower/salary-slip", { method: "POST", body: form });
      setMessage("Salary slip uploaded.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  async function applyLoan() {
    setMessage("");
    try {
      await api("/borrower/apply", {
        method: "POST",
        body: JSON.stringify({ amount, tenureDays })
      });
      setMessage("Loan application submitted.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Application failed.");
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-normal text-coral">Borrower Portal</p>
          <h1 className="mt-2 text-4xl font-bold text-ink">Complete your application</h1>
          <p className="mt-3 max-w-2xl text-ink/65">Eligibility is checked on the server before upload and loan submission.</p>
          {message ? <p className="mt-5 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink">{message}</p> : null}
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="text-pine" size={20} />
            Current status
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatusItem label="Eligibility" value={state.application?.eligibilityStatus ?? "PENDING"} />
            <StatusItem label="Salary slip" value={state.application?.salarySlip ? "UPLOADED" : "PENDING"} />
            <StatusItem label="Loan" value={state.loan?.status ?? "NOT APPLIED"} />
            <StatusItem label="Paid" value={formatInr(state.loan?.amountPaid ?? 0)} />
          </dl>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Personal details</h2>
          <form className="mt-4 space-y-3" onSubmit={saveDetails}>
            <input className="focus-ring w-full rounded-md border border-ink/15 px-3 py-3" name="fullName" placeholder="Full name" required defaultValue={state.application?.fullName} />
            <input className="focus-ring w-full rounded-md border border-ink/15 px-3 py-3 uppercase" name="pan" placeholder="PAN e.g. ABCDE1234F" required defaultValue={state.application?.pan} />
            <input className="focus-ring w-full rounded-md border border-ink/15 px-3 py-3" name="dateOfBirth" type="date" required />
            <input className="focus-ring w-full rounded-md border border-ink/15 px-3 py-3" name="monthlySalary" type="number" min={0} placeholder="Monthly salary" required defaultValue={state.application?.monthlySalary} />
            <select className="focus-ring w-full rounded-md border border-ink/15 px-3 py-3" name="employmentMode" defaultValue={state.application?.employmentMode ?? "SALARIED"}>
              <option value="SALARIED">Salaried</option>
              <option value="SELF_EMPLOYED">Self-employed</option>
              <option value="UNEMPLOYED">Unemployed</option>
            </select>
            {state.application?.eligibilityErrors?.length ? (
              <ul className="space-y-1 rounded-md bg-coral/10 p-3 text-sm text-coral">
                {state.application.eligibilityErrors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <button className="focus-ring w-full rounded-md bg-ink px-4 py-3 font-semibold text-white">Run eligibility</button>
          </form>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <FileUp size={20} />
            Salary slip
          </h2>
          <form className="mt-4 space-y-4" onSubmit={uploadSlip}>
            <input className="focus-ring w-full rounded-md border border-dashed border-ink/25 px-3 py-8" name="salarySlip" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
            <p className="text-sm text-ink/60">PDF, JPG, or PNG up to 5 MB.</p>
            <button className="focus-ring w-full rounded-md bg-pine px-4 py-3 font-semibold text-white">Upload slip</button>
          </form>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <SlidersHorizontal size={20} />
            Loan configuration
          </h2>
          <div className="mt-5 space-y-5">
            <Slider label="Loan amount" value={amount} min={50000} max={500000} step={10000} onChange={setAmount} display={formatInr(amount)} />
            <Slider label="Tenure" value={tenureDays} min={30} max={365} step={5} onChange={setTenureDays} display={`${tenureDays} days`} />
            <div className="rounded-md bg-surface p-4">
              <p className="text-sm text-ink/60">Interest at 12% p.a.</p>
              <p className="mt-2 text-2xl font-bold">{formatInr(calculation.total)}</p>
              <p className="text-sm text-ink/60">Interest: {formatInr(calculation.interest)}</p>
            </div>
            <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-coral px-4 py-3 font-semibold text-white" onClick={applyLoan}>
              <Send size={18} />
              Apply
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <dt className="text-xs font-semibold uppercase tracking-normal text-ink/50">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function Slider(props: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-medium">
        {props.label}
        <strong>{props.display}</strong>
      </span>
      <input
        className="mt-3 w-full accent-pine"
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.target.value))}
      />
    </label>
  );
}
