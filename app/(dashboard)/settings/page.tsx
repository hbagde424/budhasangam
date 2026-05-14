// app/(dashboard)/settings/page.tsx
"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

const SECTIONS = [
  { id: "privacy", label: "Privacy & Visibility", icon: "🛡️" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "account", label: "Account & Security", icon: "🔒" },
  { id: "subscription", label: "Subscription", icon: "👑" },
  { id: "verification", label: "Verification Badges", icon: "✅" },
  { id: "blocked", label: "Blocked Users", icon: "🚫" },
  { id: "data", label: "Data & Privacy", icon: "📊" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-all ${value ? "bg-saffron" : "bg-ivory-dark"}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState("privacy");
  const [privacy, setPrivacy] = useState({ visible: true, photoBlur: false, privateMode: false, showOnline: true });
  const [notifs, setNotifs] = useState({ interests: true, messages: true, views: false, matches: true, newsletter: false });

  return (
    <div className="grid grid-cols-[220px_1fr] gap-5">
      {/* Sidebar */}
      <div className="card-base p-3 h-fit">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`sidebar-link w-full ${active === s.id ? "active" : ""}`}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
        <div className="border-t border-ivory-dark mt-2 pt-2">
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-link w-full text-red-400 hover:text-red-500 hover:bg-red-50">
            <span>🚪</span>Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {active === "privacy" && (
          <div className="card-base p-7">
            <h2 className="section-title text-xl mb-1">Privacy & Visibility</h2>
            <p className="text-muted-foreground text-sm mb-6">Control who can see your profile and photos</p>
            {[
              { key: "visible" as const, label: "Show profile in search results", desc: "Uncheck to pause — you can still browse others" },
              { key: "photoBlur" as const, label: "Blur photos until interest accepted", desc: "Photos appear blurred to unconnected users" },
              { key: "privateMode" as const, label: "Private mode — I initiate only", desc: "Others cannot view your full profile" },
              { key: "showOnline" as const, label: "Show online status", desc: "Let connections see when you're active" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-4 border-b border-ivory-dark last:border-0">
                <div>
                  <p className="font-semibold text-sm text-mahogany mb-0.5">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle value={privacy[item.key]} onChange={v => setPrivacy(p => ({...p, [item.key]: v}))} />
              </div>
            ))}
          </div>
        )}

        {active === "notifications" && (
          <div className="card-base p-7">
            <h2 className="section-title text-xl mb-6">Notification Preferences</h2>
            {[
              { key: "interests" as const, label: "New interest received", desc: "When someone sends you an interest" },
              { key: "messages" as const, label: "New messages", desc: "When a connection messages you" },
              { key: "views" as const, label: "Profile views (Premium)", desc: "When someone views your profile" },
              { key: "matches" as const, label: "Daily match suggestions", desc: "Curated profiles emailed daily" },
              { key: "newsletter" as const, label: "Newsletter", desc: "Community updates and Dhamma events" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-4 border-b border-ivory-dark last:border-0">
                <div>
                  <p className="font-semibold text-sm text-mahogany mb-0.5">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle value={notifs[item.key]} onChange={v => setNotifs(p => ({...p, [item.key]: v}))} />
              </div>
            ))}
          </div>
        )}

        {active === "verification" && (
          <div className="card-base p-7">
            <h2 className="section-title text-xl mb-1">Verification Badges</h2>
            <p className="text-muted-foreground text-sm mb-6">Verified profiles receive 3× more connection requests</p>
            {[
              { label: "Email Verified", icon: "✉️", color: "#2D6A4F", done: true, desc: "Email address verified" },
              { label: "Phone Verified", icon: "📱", color: "#E8821A", done: false, desc: "Verify via OTP to your WhatsApp" },
              { label: "Photo Verified", icon: "📸", color: "#B76E79", done: false, desc: "Upload selfie with your ID card" },
              { label: "Income Verified", icon: "💼", color: "#D4AF37", done: false, desc: "Upload salary slip or ITR (optional)" },
              { label: "Education Verified", icon: "🎓", color: "#6B3A2A", done: false, desc: "Upload your degree certificate" },
            ].map(badge => (
              <div key={badge.label} className={`flex items-center gap-4 p-4 rounded-xl mb-3 border
                ${badge.done ? "bg-jade/4 border-jade/20" : "bg-ivory border-ivory-dark"}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-white border border-ivory-dark">
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-mahogany">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
                {badge.done
                  ? <span className="verified-badge">✓ Verified</span>
                  : <button className="btn-saffron text-xs py-2 px-4">Verify Now</button>}
              </div>
            ))}
          </div>
        )}

        {active === "account" && (
          <div className="space-y-4">
            <div className="card-base p-7">
              <h2 className="section-title text-xl mb-5">Account Security</h2>
              {["Change Email","Change Password","Two-Factor Authentication","Active Sessions"].map(item => (
                <button key={item} className="w-full flex items-center gap-3 py-3.5 border-b border-ivory-dark last:border-0 hover:text-saffron transition-colors text-left">
                  <span className="flex-1 text-sm font-semibold text-mahogany">{item}</span>
                  <span className="text-muted-foreground">→</span>
                </button>
              ))}
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600/80 mb-4">These actions are permanent and cannot be undone.</p>
              <div className="flex gap-3">
                <button className="py-2 px-4 rounded-xl border border-ivory-dark bg-white text-sm font-semibold text-muted-foreground hover:border-red-300 transition-all">
                  Pause Profile
                </button>
                <button className="py-2 px-4 rounded-xl border border-red-300 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {active === "subscription" && (
          <div className="card-base p-7">
            <h2 className="section-title text-xl mb-6">Your Subscription</h2>
            <div className="bg-ivory rounded-2xl p-5 border border-ivory-dark mb-6">
              <span className="tag bg-ivory-dark text-mahogany-mid text-[10px] mb-3 inline-block">FREE PLAN</span>
              <p className="font-serif text-2xl font-bold text-mahogany mb-1">Sacred Path</p>
              <p className="text-sm text-muted-foreground">Active since joining · Never expires</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[["Interests / day","3 / 5"],["Messages / day","6 / 10"],["Photos","2 / 3"],["Profile boosts","0"]].map(([l,v]) => (
                  <div key={l} className="bg-white rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="font-bold text-mahogany font-serif text-lg">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <a href="/premium" className="btn-saffron w-full py-3 text-sm flex items-center justify-center gap-2">
              👑 Upgrade to Bodhisattva Premium
            </a>
          </div>
        )}

        {(active === "data" || active === "blocked") && (
          <div className="card-base p-7">
            <h2 className="section-title text-xl mb-5">
              {active === "data" ? "Data & Privacy" : "Blocked Users"}
            </h2>
            {active === "data" ? (
              <div className="space-y-3">
                {["Download My Data (GDPR)","Data Processing Consent","Cookie Preferences","Privacy Policy"].map(item => (
                  <button key={item} className="w-full flex items-center gap-3 p-4 bg-ivory rounded-xl hover:bg-ivory-dark transition-colors text-left">
                    <span className="flex-1 text-sm font-semibold text-mahogany">{item}</span>
                    <span className="text-muted-foreground">→</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🚫</div>
                <p className="font-serif text-lg text-mahogany mb-1">No Blocked Users</p>
                <p className="text-sm text-muted-foreground">Users you block will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
