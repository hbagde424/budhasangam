// components/layout/DashboardLayout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/search", icon: "🔍", label: "Search" },
  { href: "/matches", icon: "✨", label: "Matches" },
  { href: "/interests", icon: "💛", label: "Interests" },
  { href: "/connections", icon: "🤝", label: "Connections" },
  { href: "/chat", icon: "💬", label: "Chat" },
];

interface Props {
  children: React.ReactNode;
  session: Session;
}

export function DashboardLayout({ children, session }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-ivory-dark px-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-saffron to-saffron-dark rounded-lg flex items-center justify-center text-white text-base">☸</div>
            <span className="font-serif font-bold text-lg text-mahogany">BuddhaSangam</span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, icon, label }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all
                  ${pathname === href || pathname.startsWith(href + "/")
                    ? "bg-saffron/10 text-saffron"
                    : "text-muted-foreground hover:bg-ivory-dark hover:text-mahogany"
                  }`}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/premium" className="btn-saffron text-xs py-2 px-4 flex items-center gap-1.5">
              👑 Premium
            </Link>
            <Link href="/profile/view" className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-lotus-gold flex items-center justify-center text-white font-bold text-sm ring-2 ring-ivory-dark">
              {session.user?.name?.[0] ?? session.user?.email?.[0]?.toUpperCase() ?? "?"}
            </Link>
            <Link href="/settings" className="text-xl hover:opacity-70 transition-opacity">⚙️</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-muted-foreground hover:text-mahogany font-semibold transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-5 py-7">
        {children}
      </main>
    </div>
  );
}
