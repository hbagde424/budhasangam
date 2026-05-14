// app/api/premium/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLANS = {
  PREMIUM_MONTHLY: { amount: 149900, duration: 30, label: "Premium Monthly" },
  PREMIUM_YEARLY:  { amount: 1199900, duration: 365, label: "Premium Yearly" },
  MATCHMAKER:      { amount: 349900, duration: 30, label: "Matchmaker Monthly" },
};

// POST /api/premium/create-order - create Razorpay order
export async function POST(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    const planDetails = PLANS[plan as keyof typeof PLANS];

    if (!planDetails) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: planDetails.amount, // in paise
      currency: "INR",
      receipt: `bs_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error("[CREATE_ORDER]", err);
    return NextResponse.json({ success: false, error: "Payment initialization failed" }, { status: 500 });
  }
}

// PATCH /api/premium - verify payment & activate subscription
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    if (!planDetails) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    // Activate subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.duration);

    await db.$transaction([
      db.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          plan: plan as any,
          startDate: new Date(),
          endDate,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: planDetails.amount / 100,
          currency: "INR",
          autoRenew: false,
        },
        update: {
          plan: plan as any,
          startDate: new Date(),
          endDate,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: planDetails.amount / 100,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { premiumUntil: endDate },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `${planDetails.label} activated successfully!`,
      data: { plan, endDate },
    });
  } catch (err) {
    console.error("[VERIFY_PAYMENT]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// GET /api/premium - get subscription status
export async function GET() {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPremium = subscription?.plan !== "FREE" &&
      subscription?.endDate && new Date(subscription.endDate) > new Date();

    return NextResponse.json({ success: true, data: { subscription, isPremium } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
