// app/admin/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ADMIN_TABS = ["overview", "users", "reports", "analytics"];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (session?.user?.role !== "ADMIN") { router.push("/dashboard"); return; }
    fetchData("stats");
  }, [session, status]);

  const fetchData = async (type: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin?type=${type}`);
    const data = await res.json();
    if (data.success) {
      if (type === "stats") setStats(data.data);
      else if (type === "users") setUsers(data.data.users);
      else if (type === "reports") setReports(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const typeMap: Record<string, string> = { overview: "stats", users: "users", reports: "reports", analytics: "stats" };
    fetchData(typeMap[tab] ?? "stats");
  }, [tab]);

  const adminAction = async (action: string, payload: Record<string, string>) => {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    fetchData("stats");
  };

  const STAT_CARDS = stats ? [
    { label: "Total Users", value: stats.totalUsers?.toLocaleString(), icon: "👥", color: "#E8821A" },
    { label: "Active Profiles", value: stats.activeUsers?.toLocaleString(), icon: "✅", color: "#2D6A4F" },
    { label: "Successful Matches", value: stats.totalMatches?.toLocaleString(), icon: "💛", color: "#B76E79" },
    { label: "Premium Members", value: stats.premiumUsers?.toLocaleString(), icon: "👑", color: "#D4AF37" },
    { label: "Pending Reports", value: stats.pendingReports, icon: "🚩", color: "#E8828A" },
    { label: "New Today", value: stats.newToday, icon: "✨", color: "#6B3A2A" },
  ] : [];

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#1A0D06]">
      {/* Admin Navbar */}
      <nav className="bg-[#2A120A] border-b border-white/6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-saffron to-saffron-dark rounded-lg flex items-center justify-center text-base">☸</div>
            <span className="font-serif font-bold text-lg text-white">BuddhaSangam</span>
            <span className="bg-saffron text-white text-[9px] font-black px-2 py-1 rounded-md tracking-widest">ADMIN</span>
          </div>
          <div className="flex gap-1">
            {ADMIN_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                  ${tab === t ? "bg-saffron/20 text-saffron" : "text-white/40 hover:text-white/70"}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => router.push("/dashboard")}
            className="text-xs text-white/40 hover:text-white/70 font-semibold transition-colors">
            ← Exit Admin
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-7">

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-6 gap-3">
              {STAT_CARDS.map(s => (
                <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/6">
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <div className="font-serif text-2xl font-bold text-white leading-none">{s.value ?? "—"}</div>
                  <div className="text-[10px] text-white/35 mt-1.5 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Pending verifications */}
              <div className="bg-white/4 rounded-2xl border border-white/6 p-5">
                <h3 className="font-serif text-lg font-bold text-white mb-4">Pending Verifications</h3>
                {loading ? (
                  <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}</div>
                ) : (
                  <p className="text-sm text-white/35 text-center py-4">No pending verifications</p>
                )}
              </div>

              {/* Tradition breakdown */}
              <div className="bg-white/4 rounded-2xl border border-white/6 p-5">
                <h3 className="font-serif text-lg font-bold text-white mb-4">Users by Tradition</h3>
                {stats?.traditions?.map((t: any) => {
                  const colors: Record<string, string> = { NAVAYANA:"#E8821A", THERAVADA:"#2D6A4F", MAHAYANA:"#D4AF37", VAJRAYANA:"#B76E79", OTHER:"#9A7B6F" };
                  const total = stats.totalUsers || 1;
                  const pct = Math.round((t._count.buddhistTradition / total) * 100);
                  return (
                    <div key={t.buddhistTradition} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white font-semibold">{t.buddhistTradition}</span>
                        <span style={{ color: colors[t.buddhistTradition] ?? "#9A7B6F" }} className="font-bold">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[t.buddhistTradition] ?? "#9A7B6F" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="bg-white/4 rounded-2xl border border-white/6 overflow-hidden">
            <div className="flex gap-3 p-4 border-b border-white/6">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-saffron/40"
                  placeholder="Search by name or email..." />
              </div>
              {["All","Active","Premium","Flagged","Blocked"].map(f => (
                <button key={f} className="px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors">
                  {f}
                </button>
              ))}
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-white/3">
                  {["User","Tradition","Location","Joined","Plan","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:5}).map((_,i) => (
                    <tr key={i} className="border-t border-white/4">
                      {Array.from({length:7}).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : users.map(u => (
                  <tr key={u.id} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 relative flex-shrink-0">
                          {u.photos?.[0]?.url
                            ? <Image src={u.photos[0].url} alt="" fill className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-white/40 text-lg">👤</div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.profile?.fullName ?? u.email}</p>
                          <p className="text-[10px] text-white/30">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">{u.profile?.buddhistTradition ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-white/50">{u.profile?.workLocation ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/35">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${u.subscription?.plan !== "FREE" ? "bg-lotus-gold/20 text-lotus-gold" : "bg-white/8 text-white/35"}`}>
                        {u.subscription?.plan ?? "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${u.isVerified ? "bg-jade/20 text-jade-mid" : "bg-white/5 text-white/25"}`}>
                        {u.isVerified ? "VERIFIED" : "BASIC"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => router.push(`/profile/view?id=${u.id}`)}
                          className="w-7 h-7 rounded-lg bg-saffron/15 flex items-center justify-center text-saffron text-xs hover:bg-saffron/25 transition-colors">
                          👁
                        </button>
                        <button onClick={() => adminAction(u.isBlocked ? "unblock_user" : "block_user", { userId: u.id })}
                          className="w-7 h-7 rounded-lg bg-red-900/20 flex items-center justify-center text-red-400 text-xs hover:bg-red-900/40 transition-colors">
                          {u.isBlocked ? "🔓" : "🔒"}
                        </button>
                        <button onClick={() => adminAction("verify_user", { userId: u.id })}
                          className="w-7 h-7 rounded-lg bg-jade/15 flex items-center justify-center text-jade-mid text-xs hover:bg-jade/25 transition-colors">
                          ✓
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports */}
        {tab === "reports" && (
          <div className="bg-white/4 rounded-2xl border border-white/6 p-5">
            <h2 className="font-serif text-xl font-bold text-white mb-5">Active Reports</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-3">🏳</div>
                <p className="font-serif text-lg">No pending reports</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.id} className="bg-white/3 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{r.reporter?.profile?.fullName ?? "Anonymous"}</span>
                        <span className="text-white/30 text-xs">reported</span>
                        <span className="text-sm font-bold text-red-400">{r.reported?.profile?.fullName ?? "User"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-red-900/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-lg">{r.reason}</span>
                        <span className="text-white/25 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.description && <p className="text-xs text-white/40 mt-1">{r.description}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => adminAction("dismiss_report", { reportId: r.id })}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold text-white/40 hover:bg-white/10 transition-colors">
                        Dismiss
                      </button>
                      <button onClick={() => adminAction("resolve_report", { reportId: r.id })}
                        className="px-3 py-1.5 rounded-lg bg-red-900/30 text-xs font-bold text-red-400 hover:bg-red-900/50 transition-colors">
                        Take Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div className="grid grid-cols-2 gap-5">
            {[
              { title: "New Registrations (Last 7 Days)", data: stats?.last7Days ?? [0,0,0,0,0,0,0], color: "#E8821A" },
              { title: "Platform Activity", data: [12,19,9,25,16,22,30], color: "#D4AF37" },
            ].map(chart => {
              const max = Math.max(...chart.data, 1);
              const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              return (
                <div key={chart.title} className="bg-white/4 rounded-2xl border border-white/6 p-5">
                  <h3 className="font-serif text-lg font-bold text-white mb-5">{chart.title}</h3>
                  <div className="flex items-end gap-2.5 h-32">
                    {chart.data.map((val: number, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                        <div className="flex-1 flex items-end w-full">
                          <div className="w-full rounded-t-lg min-h-[4px] transition-all duration-700"
                            style={{ height: `${Math.max((val/max)*100,3)}%`, background: `linear-gradient(to top, ${chart.color}, ${chart.color}80)` }} />
                        </div>
                        <span className="text-[9px] text-white/25">{days[i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-right mt-3 font-serif text-2xl font-bold" style={{ color: chart.color }}>
                    {chart.data[chart.data.length-1]}
                    <span className="text-xs text-white/30 font-sans font-normal ml-2">today</span>
                  </div>
                </div>
              );
            })}
            {/* Tradition pie chart (simplified as bars) */}
            <div className="bg-white/4 rounded-2xl border border-white/6 p-5 col-span-2">
              <h3 className="font-serif text-lg font-bold text-white mb-5">Users by Buddhist Tradition</h3>
              <div className="grid grid-cols-4 gap-4">
                {[["Navayana",72,"#E8821A"],["Theravada",15,"#2D6A4F"],["Mahayana",8,"#D4AF37"],["Vajrayana",5,"#B76E79"]].map(([name,pct,color]) => (
                  <div key={name as string} className="p-4 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-white">{name}</span>
                      <span className="font-serif text-xl font-bold" style={{ color: color as string }}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color as string }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
