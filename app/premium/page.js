"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePremium } from "../components/PremiumContext";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$1.99 / mo",
    description: "Cancel any time.",
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$4.99 once",
    description: "Pay once, ads gone forever.",
    badge: "Best value",
  },
];

// Validation helpers
function validateCard(raw) {
  const digits = raw.replace(/\s/g, "");
  if (digits.length !== 16) return "Card number must be 16 digits.";
  return null;
}
function validateExpiry(val) {
  if (!/^\d{2}\/\d{2}$/.test(val)) return "Use MM/YY format.";
  const [mm, yy] = val.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Invalid month.";
  const now = new Date();
  const expDate = new Date(2000 + yy, mm - 1, 1);
  if (expDate < now) return "Card has expired.";
  return null;
}
function validateCvc(val) {
  if (val.length < 3) return "CVC must be 3–4 digits.";
  return null;
}

export default function PremiumPage() {
  const router = useRouter();
  const { isPremium, plan: activePlan, setPremium, clearPremium } = usePremium();
  const [checked, setChecked] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("lifetime");

  const [form, setForm] = useState({ name: "", email: "", card: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => { setChecked(true); }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    // Clear error on change
    setErrors((err) => ({ ...err, [name]: null }));

    if (name === "card") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      setForm((f) => ({ ...f, card: digits.replace(/(.{4})/g, "$1 ").trim() }));
      return;
    }
    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setForm((f) => ({ ...f, expiry: digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits }));
      return;
    }
    if (name === "cvc") {
      setForm((f) => ({ ...f, cvc: value.replace(/\D/g, "").slice(0, 4) }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    const cardErr = validateCard(form.card);
    if (cardErr) newErrors.card = cardErr;
    const expiryErr = validateExpiry(form.expiry);
    if (expiryErr) newErrors.expiry = expiryErr;
    const cvcErr = validateCvc(form.cvc);
    if (cvcErr) newErrors.cvc = cvcErr;
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setPremium(selectedPlan);
  }

  if (!checked) return null;

  // ── Already premium: confirmation screen ──────────────────────────────────
  if (isPremium) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-20 text-center">
        <div className="rounded-2xl border border-black/10 bg-white p-10 shadow-md dark:border-white/10 dark:bg-zinc-900">
          <p className="text-5xl">✅</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">You're Premium!</h1>
          <p className="mt-2 text-sm font-medium text-indigo-500 capitalize">
            {activePlan} plan
          </p>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Ads have been removed — enjoy a clean shop.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Back to shop
          </button>
          <div className="mt-4">
            <button
              onClick={clearPremium}
              className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
            >
              Restore ads / cancel premium
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Payment form ──────────────────────────────────────────────────────────
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-md dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold tracking-tight">Go Premium</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Remove all ads. Pick a plan.
        </p>

        {/* Plan selector */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlan(p.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                selectedPlan === p.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                  : "border-black/10 hover:border-black/20 dark:border-white/10"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {p.badge}
                </span>
              )}
              <p className="font-semibold">{p.label}</p>
              <p className="mt-0.5 text-sm font-bold text-indigo-600">{p.price}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{p.description}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Cardholder name
            </label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="Jane Smith"
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none ring-indigo-500 focus:ring-2 ${
                errors.name ? "border-red-400" : "border-black/20 dark:border-white/20"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="jane@example.com"
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none ring-indigo-500 focus:ring-2 ${
                errors.email ? "border-red-400" : "border-black/20 dark:border-white/20"
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Card number */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Card number
            </label>
            <input
              type="text" name="card" value={form.card} onChange={handleChange}
              placeholder="1234 5678 9012 3456" inputMode="numeric"
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono bg-transparent outline-none ring-indigo-500 focus:ring-2 ${
                errors.card ? "border-red-400" : "border-black/20 dark:border-white/20"
              }`}
            />
            {errors.card && <p className="mt-1 text-xs text-red-500">{errors.card}</p>}
          </div>

          {/* Expiry + CVC */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Expiry
              </label>
              <input
                type="text" name="expiry" value={form.expiry} onChange={handleChange}
                placeholder="MM/YY" inputMode="numeric"
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono bg-transparent outline-none ring-indigo-500 focus:ring-2 ${
                  errors.expiry ? "border-red-400" : "border-black/20 dark:border-white/20"
                }`}
              />
              {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                CVC
              </label>
              <input
                type="text" name="cvc" value={form.cvc} onChange={handleChange}
                placeholder="123" inputMode="numeric"
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono bg-transparent outline-none ring-indigo-500 focus:ring-2 ${
                  errors.cvc ? "border-red-400" : "border-black/20 dark:border-white/20"
                }`}
              />
              {errors.cvc && <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Pay {PLANS.find((p) => p.id === selectedPlan)?.price} — Remove ads
            </button>
            <p className="mt-3 text-center text-xs text-zinc-400">
              This is a mock payment. No real charge will be made.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}