// app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-saffron to-saffron-dark rounded-xl flex items-center justify-center text-white text-xl">☸</div>
            <span className="font-serif text-2xl font-bold text-mahogany">BuddhaSangam</span>
          </Link>
          <h1 className="font-serif text-3xl font-semibold text-mahogany">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Namo Buddhaya 🙏</p>
        </div>
        <div className="card-base p-8 shadow-xl shadow-mahogany/8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Email</label>
              <input className="input-field" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-saffron font-semibold hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-saffron w-full py-3 text-sm">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full py-3 rounded-xl border border-ivory-dark bg-white text-sm font-semibold text-mahogany-mid hover:bg-ivory transition-colors">
              Continue with Google
            </button>
          </div>
          <p className="text-center mt-5 text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="text-saffron font-semibold hover:underline">Create free profile</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
