// app/page.tsx
import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icons";

export default async function HomePage() {
  const session = await getAuth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-ivory">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-ivory-dark px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron to-saffron-dark rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-saffron/20">
              <Icon name="lotus" size={24} />
            </div>
            <div>
              <div className="font-serif font-black text-2xl text-mahogany leading-none tracking-tight">BuddhaSangam</div>
              <div className="text-[10px] tracking-[0.2em] text-saffron uppercase font-bold mt-1">Buddhist Matrimony</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-black text-mahogany uppercase tracking-widest hover:text-saffron transition-colors px-4">Sign In</Link>
            <Link href="/register" className="btn-saffron !py-3 !px-8 text-xs uppercase tracking-widest shadow-xl shadow-saffron/20">Join Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mandala-bg py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-3xl" />
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-saffron/5 text-saffron-dark border border-saffron/20 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-10 anim-fade-up">
            <Icon name="lotus" size={14} /> Dedicated Buddhist Matrimony
          </div>
          <h1 className="font-serif text-6xl md:text-8xl font-black text-mahogany leading-[1.1] mb-8 anim-fade-up-2">
            Find Your{" "}
            <span className="shimmer-text">Soul Companion</span>
            <br />
            On The Noble Path
          </h1>
          <p className="text-xl text-textMid max-w-3xl mx-auto mb-12 leading-relaxed font-medium anim-fade-up-3">
            A sacred space for Buddhist hearts to meet across traditions—Theravada to Navayana. 
            Experience mindful matching, verified profiles, and spiritual harmony.
          </p>
          <div className="flex gap-6 justify-center flex-wrap anim-fade-up-4">
            <Link href="/register" className="btn-saffron flex items-center gap-3 text-sm font-black uppercase tracking-widest py-5 px-12 shadow-2xl shadow-saffron/30">
              Seek Your Sangam <Icon name="arrow" size={18} />
            </Link>
            <Link href="/search" className="btn-outline-saffron flex items-center gap-3 text-sm font-black uppercase tracking-widest py-5 px-12 bg-white/50 backdrop-blur-sm">
              Browse Souls <Icon name="search" size={18} />
            </Link>
          </div>
          
          <div className="flex gap-12 justify-center mt-20 flex-wrap anim-fade-up-4 opacity-70">
            {[
              ["50K+", "BUDDHIST SOULS"],
              ["4", "TRADITIONS"],
              ["2.8K+", "UNION STORIES"],
              ["98%", "VERIFIED"],
            ].map(([val, label]) => (
              <div key={label} className="text-center group">
                <div className="font-serif text-4xl font-black text-saffron mb-1 group-hover:scale-110 transition-transform duration-500">{val}</div>
                <div className="text-[10px] text-textLight font-black tracking-widest uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="lotus-divider mb-8">
              <Icon name="lotus" size={32} />
            </div>
            <h2 className="font-serif text-5xl font-black text-mahogany mb-4">Mindful Connection Features</h2>
            <p className="text-textMid text-lg font-medium">Built with Metta for the global Buddhist community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "lotus", title: "Dhamma Matching", desc: "Our algorithm aligns souls based on tradition, meditation practice, and spiritual goals.", color: "#E8821A" },
              { icon: "shield", title: "Sacred Trust", desc: "Rigorous profile verification and 24/7 moderation ensure a safe environment for your search.", color: "#2D6A4F" },
              { icon: "zap", title: "Path Compatibility", desc: "Dynamic scores based on 10+ Buddhist-specific criteria for truly meaningful unions.", color: "#D4AF37" },
              { icon: "message", title: "Conscious Chat", desc: "Dhamma icebreakers and guided prompts help you start conversations with depth and mindfulness.", color: "#B76E79" },
            ].map((f, idx) => (
              <div key={f.title} className="card-base p-10 hover:border-saffron/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-mahogany opacity-[0.03] group-hover:scale-150 transition-transform duration-1000">
                  <Icon name={f.icon} size={120} />
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${f.color}15`, color: f.color }}>
                  <Icon name={f.icon} size={32} />
                </div>
                <h3 className="font-serif text-2xl font-black text-mahogany mb-4">{f.title}</h3>
                <p className="text-textMid text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-mahogany text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mandala-bg scale-150 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent opacity-5" />
        
        <div className="relative max-w-3xl mx-auto">
          <div className="text-saffron mb-10 flex justify-center anim-float">
            <Icon name="lotus" size={64} />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-black text-white mb-6 leading-tight">Begin Your Sacred Journey Today</h2>
          <p className="text-white/60 text-xl mb-12 font-medium max-w-xl mx-auto">
            Free to join. Thousands of Buddhist hearts waiting to walk the path with you.
          </p>
          <Link href="/register" className="btn-saffron inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest py-6 px-16 shadow-2xl shadow-black/40 hover:scale-105 transition-transform">
            Seek Your Companion <Icon name="arrow" size={20} />
          </Link>
          <div className="flex flex-col items-center gap-4 mt-12">
            <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">
              Safe · Private · Dedicated
            </p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={14} color="#D4AF37" />)}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mahogany-dark border-t border-white/5 py-12 px-6 text-center relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-8 mb-10">
            <Icon name="lotus" size={20} color="rgba(255,255,255,0.2)" />
            <Icon name="heart" size={20} color="rgba(255,255,255,0.2)" />
            <Icon name="shield" size={20} color="rgba(255,255,255,0.2)" />
          </div>
          <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-6">
            © 2024 BuddhaSangam Matrimony · Made with Metta for the Sangha
          </p>
          <div className="flex justify-center gap-8">
            <Link href="/privacy" className="text-white/20 hover:text-saffron text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/20 hover:text-saffron text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Service</Link>
            <Link href="/support" className="text-white/20 hover:text-saffron text-[10px] font-black uppercase tracking-widest transition-colors">Support Center</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
