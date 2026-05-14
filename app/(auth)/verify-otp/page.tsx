// app/(auth)/verify-otp/page.tsx
"use client";
import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (data.success) router.push("/dashboard");
      else setError(data.error ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-saffron to-saffron-dark rounded-xl flex items-center justify-center text-white text-xl">☸</div>
          <span className="font-serif text-2xl font-bold text-mahogany">BuddhaSangam</span>
        </Link>

        <div className="card-base p-8 shadow-xl shadow-mahogany/8">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-serif text-2xl font-semibold text-mahogany mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground text-sm mb-8">
            We sent a 6-digit code to <strong className="text-mahogany">{email}</strong>
          </p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm mb-5">{error}</div>}

          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-ivory-dark rounded-xl bg-white text-mahogany
                  focus:border-saffron focus:ring-2 focus:ring-saffron/10 outline-none transition-all"
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading} className="btn-saffron w-full py-3 text-sm mb-4">
            {loading ? "Verifying..." : "Verify Email →"}
          </button>

          <p className="text-sm text-muted-foreground">
            Didn't receive it?{" "}
            <button onClick={resend} className="text-saffron font-semibold hover:underline">Resend OTP</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
