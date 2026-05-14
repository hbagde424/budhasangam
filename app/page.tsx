// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getAuth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-ivory">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-ivory-dark px-6 py-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-saffron to-saffron-dark rounded-xl flex items-center justify-center text-white text-lg">
              ☸
            </div>
            <div>
              <div className="font-serif font-bold text-xl text-mahogany leading-none">BuddhaSangam</div>
              <div className="text-[9px] tracking-[2px] text-saffron uppercase font-semibold">Buddhist Matrimony</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline-saffron text-sm py-2 px-5">Sign In</Link>
            <Link href="/register" className="btn-saffron text-sm py-2 px-5">Join Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mandala-bg py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-saffron/10 text-saffron-dark border border-saffron/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
            ☸ Dedicated Buddhist Matrimony Platform
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold text-mahogany leading-tight mb-6">
            Find Your{" "}
            <span className="shimmer-text">Dhamma Companion</span>
            <br />
            Walk the Path Together
          </h1>
          <p className="text-lg text-mahogany-mid max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            A sacred space for Buddhist hearts to meet — across traditions, with
            verified profiles, mindful matching, and meaningful connections.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-saffron flex items-center gap-2 text-base py-4 px-8">
              Create Free Profile →
            </Link>
            <Link href="/search" className="btn-outline-saffron flex items-center gap-2 text-base py-4 px-8">
              Browse Profiles
            </Link>
          </div>
          <div className="flex gap-10 justify-center mt-14 flex-wrap">
            {[
              ["50,000+", "Buddhist Profiles"],
              ["4 Traditions", "Theravada to Navayana"],
              ["2,800+", "Successful Matches"],
              ["98%", "Verified Profiles"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-serif text-3xl font-bold text-saffron">{val}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="lotus-divider text-xl mb-5">☸</div>
            <h2 className="font-serif text-4xl font-semibold text-mahogany mb-3">Why BuddhaSangam?</h2>
            <p className="text-muted-foreground">Built specifically for the Buddhist community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🪷", title: "Dhamma-Aligned Matching", desc: "Find partners who share your Buddhist tradition, meditation practice, and life philosophy." },
              { icon: "🛡️", title: "Verified & Secure", desc: "Photo verification, document badges, and 24/7 moderation protect your trust." },
              { icon: "⚡", title: "Smart Compatibility", desc: "10+ Buddhist-specific criteria for meaningful 0–100% compatibility scores." },
              { icon: "💛", title: "Mindful Communication", desc: "Dhamma icebreaker questions, guided conversation starters, and safe in-app chat." },
            ].map((f) => (
              <div key={f.title} className="card-base p-7 hover:border-saffron/40 hover:shadow-lg hover:shadow-saffron/8 hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-lg font-bold text-mahogany mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-mahogany to-mahogany-mid text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,white_0,white_1px,transparent_0,transparent_50%)] bg-[length:12px_12px]" />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-5xl mb-6 animate-float">☸</div>
          <h2 className="font-serif text-4xl font-semibold text-white mb-4">Begin Your Journey Today</h2>
          <p className="text-white/60 text-lg mb-10 font-light">Free to join. Thousands of Buddhist hearts waiting to connect.</p>
          <Link href="/register" className="btn-saffron inline-flex items-center gap-2 text-base py-4 px-10">
            Create Free Profile →
          </Link>
          <p className="text-white/30 text-xs mt-6 tracking-wide">
            No credit card required · Free forever · Delete anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mahogany border-t border-white/5 py-6 px-6 text-center text-white/30 text-xs tracking-wide">
        © 2025 BuddhaSangam · Made with Metta for the Sangha ·{" "}
        <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link> ·{" "}
        <Link href="/support" className="hover:text-white/60 transition-colors">Support</Link>
      </footer>
    </main>
  );
}
