// components/layout/DashboardLayout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Icon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/visuals";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/search", icon: "search", label: "Search" },
  { href: "/matches", icon: "lotus", label: "Matches" },
  { href: "/interests", icon: "heart", label: "Interests" },
  { href: "/connections", icon: "users", label: "Connections" },
  { href: "/chat", icon: "message", label: "Chat" },
];

interface Props {
  children: React.ReactNode;
  session: Session;
}

export function DashboardLayout({ children, session }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Top navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-ivory-dark px-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron to-saffron-dark rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-saffron/20 transition-transform group-hover:scale-110 duration-300">
              <Icon name="lotus" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-xl text-mahogany tracking-tight leading-none">BuddhaSangam</span>
              <span className="text-[10px] font-bold text-saffron uppercase tracking-[0.2em] mt-0.5">Matrimony</span>
            </div>
          </Link>

          {/* Center nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300
                    ${isActive
                      ? "bg-saffron text-white shadow-md shadow-saffron/20"
                      : "text-textMid hover:bg-saffron/5 hover:text-saffron"
                    }`}>
                  <Icon name={icon} size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <Link href="/premium" className="hidden sm:flex btn-saffron !py-2.5 !px-5 text-[10px] uppercase tracking-widest items-center gap-2">
              <Icon name="crown" size={12} color="white" /> Upgrade
            </Link>
            
            <div className="h-8 w-[1px] bg-ivory-dark mx-1 hidden sm:block" />

            <div className="flex items-center gap-4">
              <Link href="/settings" className="p-2.5 rounded-xl hover:bg-ivory-dark transition-colors text-textMid hover:text-saffron">
                <Icon name="settings" size={20} />
              </Link>
              
              <Link href="/profile/edit" className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-ivory-dark transition-all group">
                <Avatar 
                  name={session.user?.name || session.user?.email || "U"} 
                  size={36} 
                  online={true}
                />
                <div className="hidden xl:block">
                  <p className="text-xs font-bold text-mahogany leading-none">{session.user?.name?.split(" ")[0] || "User"}</p>
                  <p className="text-[9px] font-bold text-jade uppercase mt-1 tracking-tighter">Verified Profile</p>
                </div>
              </Link>

              <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="p-2.5 rounded-xl hover:bg-rose-50 text-textLight hover:text-rose-500 transition-all"
                title="Sign Out"
              >
                <Icon name="logout" size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="anim-fade-up">
          {children}
        </div>
      </main>

      {/* Footer / Status bar */}
      <footer className="border-t border-ivory-dark bg-white/50 py-6 mt-20">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-textLight text-xs font-medium">© 2024 BuddhaSangam Matrimony. Path to Enlightenment & Union.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-textLight hover:text-saffron text-[11px] font-bold uppercase tracking-wider">Terms</Link>
            <Link href="/privacy" className="text-textLight hover:text-saffron text-[11px] font-bold uppercase tracking-wider">Privacy</Link>
            <Link href="/help" className="text-textLight hover:text-saffron text-[11px] font-bold uppercase tracking-wider">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
