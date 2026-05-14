// app/premium/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "FREE",
    name: "Sacred Path",
    price: "Free",
    period: "Forever",
    color: "#9A7B6F",
    icon: "🪷",
    features: [
      "Create full biodata profile",
      "Upload up to 3 photos",
      "Send 5 interests per day",
      "Send 10 messages per day",
      "10 daily match suggestions",
      "Basic search filters",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    id: "PREMIUM_MONTHLY",
    name: "Bodhisattva",
    price: "₹1,499",
    period: "per month",
    yearNote: "or ₹11,999/year (save 33%)",
    color: "#E8821A",
    icon: "💎",
    popular: true,
    features: [
      "Unlimited interests & messages",
      "Upload up to 10 photos",
      "See who viewed your profile",
      "Advanced filters (Vipassana, tradition, income)",
      "Verified profile badge",
      "Profile boost — 7 days/month",
      "Video calling feature",
      "Voice notes in chat",
      "Priority customer support",
    ],
    cta: "Upgrade Now",
    disabled: false,
  },
  {
    id: "MATCHMAKER",
    name: "Dhamma Vihara",
    price: "₹3,499",
    period: "per month",
    color: "#D4AF37",
    icon: "👑",
    features: [
      "Manage up to 10 profiles",
      "All Premium features × 10",
      "Bulk interest sending",
      "Dedicated account manager",
      "Advanced match analytics",
      "Custom biodata printing",
      "White-label dashboard",
      "Early access to new features",
    ],
    cta: "Contact Us",
    disabled: false,
  },
];

declare global {
  interface Window { Razorpay: any; }
}

export default function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === "MATCHMAKER") {
      window.location.href = "mailto:support@buddhasangam.com?subject=Matchmaker Plan Inquiry";
      return;
    }
    setLoading(planId);
    try {
      const orderRes = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) return;

      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "BuddhaSangam",
        description: `${planId.replace("_", " ")} Plan`,
        order_id: orderData.data.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/premium", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan: planId }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) setSuccess(true);
        },
        prefill: { name: "", email: "" },
        theme: { color: "#E8821A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setLoading(null);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="card-base p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-serif text-3xl font-bold text-mahogany mb-3">Welcome to Premium!</h2>
          <p className="text-muted-foreground mb-6">Your Bodhisattva membership is now active. Enjoy unlimited connections!</p>
          <Link href="/dashboard" className="btn-saffron inline-block px-8 py-3">Go to Dashboard →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <div className="bg-gradient-to-br from-mahogany to-mahogany-mid py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-4 bg-[repeating-linear-gradient(45deg,white_0,white_1px,transparent_0,transparent_50%)] bg-[length:14px_14px]" />
        <Link href="/dashboard" className="absolute top-5 left-6 text-white/60 hover:text-white text-sm font-semibold transition-colors">← Back</Link>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-lotus-gold/15 border border-lotus-gold/30 text-lotus-gold-light px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            👑 Premium Membership
          </div>
          <h1 className="font-serif text-5xl font-semibold text-white mb-4">Elevate Your Sacred Journey</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto font-light">
            Unlock the full power of BuddhaSangam. Find your Dhamma companion faster with Premium tools and verified connections.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 pb-20">
        <div className="grid grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl overflow-hidden transition-all duration-300
                ${plan.popular
                  ? "border-2 border-saffron shadow-2xl shadow-saffron/20 -translate-y-3"
                  : "border border-ivory-dark shadow-lg"
                }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-saffron to-saffron-dark text-white text-center py-2.5 text-xs font-black tracking-widest">
                  ✦ MOST POPULAR ✦
                </div>
              )}
              <div className="p-7">
                {/* Plan header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${plan.color}15` }}>
                    {plan.icon}
                  </div>
                  <div>
                    <p className="font-serif text-lg font-bold text-mahogany">{plan.name}</p>
                    {plan.popular && <p className="text-[10px] text-saffron font-bold uppercase tracking-wide">Recommended</p>}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-serif text-4xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                  {plan.yearNote && (
                    <p className="text-xs text-muted-foreground mt-1">{plan.yearNote}</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-mahogany">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${plan.color}15`, border: `1.5px solid ${plan.color}` }}>
                        <span className="text-[8px] font-bold" style={{ color: plan.color }}>✓</span>
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  disabled={plan.disabled || loading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all
                    ${plan.disabled
                      ? "bg-ivory-dark text-muted-foreground cursor-default"
                      : "text-white hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                  style={!plan.disabled ? {
                    background: `linear-gradient(135deg, ${plan.color}, ${plan.id === "PREMIUM_MONTHLY" ? "#C4671A" : "#B8960C"})`,
                    boxShadow: `0 6px 20px ${plan.color}35`,
                  } : {}}
                >
                  {loading === plan.id ? "Processing..." : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="text-center mt-12">
          <div className="lotus-divider text-lg mb-6">☸</div>
          <p className="text-sm text-muted-foreground mb-2">
            All plans include: SSL encryption · GDPR compliance · 24/7 moderation · Cancel anytime
          </p>
          <p className="text-sm text-muted-foreground">
            Questions?{" "}
            <a href="mailto:support@buddhasangam.com" className="text-saffron font-semibold hover:underline">Chat with support</a>
            {" · "}
            <Link href="/faq" className="text-saffron font-semibold hover:underline">FAQ</Link>
          </p>
        </div>
      </div>

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
