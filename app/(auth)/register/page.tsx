// app/(auth)/register/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const steps = ["Personal Details", "Buddhist Profile", "Set Password"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", gender: "",
    dob: "", tradition: "NAVAYANA", password: "", confirmPassword: "", role: "SEEKER",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); setLoading(false); return; }

      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/profile/edit?welcome=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-saffron to-saffron-dark rounded-xl flex items-center justify-center text-white text-xl">☸</div>
            <span className="font-serif text-2xl font-bold text-mahogany">BuddhaSangam</span>
          </Link>
          <h1 className="font-serif text-3xl font-semibold text-mahogany">Join the Sangha</h1>
          <p className="text-muted-foreground mt-2 text-sm">Create your sacred profile in minutes</p>
        </div>

        <div className="card-base p-8 shadow-xl shadow-mahogany/8">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? "bg-jade text-white" : step === i + 1 ? "bg-saffron text-white ring-4 ring-saffron/20" : "bg-ivory-dark text-muted-foreground"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`w-12 h-0.5 rounded ${step > i + 1 ? "bg-jade" : "bg-ivory-dark"}`} />}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-bold mb-6">{steps[step - 1]}</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Full Name *</label>
                <input className="input-field" placeholder="As per legal documents" value={form.fullName} onChange={e => update("fullName", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Email *</label>
                <input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Phone (WhatsApp)</label>
                <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Gender *</label>
                  <select className="input-field" value={form.gender} onChange={e => update("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Date of Birth *</label>
                  <input className="input-field" type="date" value={form.dob} onChange={e => update("dob", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-3 uppercase tracking-wide">Buddhist Tradition *</label>
                <div className="grid grid-cols-5 gap-2">
                  {[["THERAVADA","Theravada"],["MAHAYANA","Mahayana"],["VAJRAYANA","Vajrayana"],["NAVAYANA","Navayana"],["OTHER","Other"]].map(([val,label]) => (
                    <button key={val} type="button" onClick={() => update("tradition", val)}
                      className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all text-center ${form.tradition === val ? "border-saffron bg-saffron/8 text-saffron" : "border-ivory-dark text-mahogany-mid hover:border-saffron/40"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-3 uppercase tracking-wide">Registering as</label>
                <div className="grid grid-cols-3 gap-3">
                  {[["SEEKER","Myself"],["PARENT","Parent / Guardian"],["MATCHMAKER","Matchmaker"]].map(([val,label]) => (
                    <button key={val} type="button" onClick={() => update("role", val)}
                      className={`py-3 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${form.role === val ? "border-saffron bg-saffron/8 text-saffron" : "border-ivory-dark text-mahogany-mid hover:border-saffron/40"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-saffron/6 border border-saffron/15 rounded-xl p-4">
                <p className="text-xs text-mahogany-mid leading-relaxed">
                  <span className="font-bold">☸ Tip:</span> Complete profiles with verified documents receive 3× more connection requests.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Password *</label>
                <input className="input-field" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update("password", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Confirm Password *</label>
                <input className="input-field" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
              </div>
              <div className="bg-ivory-dark rounded-xl p-4 space-y-2">
                {["Email OTP verification", "Free profile creation", "5 interests/day (Free)", "Upgrade anytime for Premium"].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-mahogany">
                    <div className="w-5 h-5 rounded-full bg-jade flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-saffron font-semibold">Terms</Link> and{" "}
                <Link href="/privacy" className="text-saffron font-semibold">Privacy Policy</Link>.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline-saffron flex-1 py-3 text-sm">← Back</button>
            )}
            <button type="button" disabled={loading}
              onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
              className="btn-saffron flex-[2] py-3 text-sm">
              {loading ? "Creating..." : step === 3 ? "Create My Profile →" : "Continue →"}
            </button>
          </div>

          <p className="text-center mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-saffron font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
